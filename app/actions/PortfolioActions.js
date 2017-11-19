import alt from "alt-instance";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";
import Immutable from "immutable";
import AssetActions from 'actions/AssetActions';
import { dispatcher } from 'components/Trusty/utils';
import {Apis} from "bitsharesjs-ws";
import utils from "common/utils";
import PortfolioStore from "stores/PortfolioStore";
import WalletApi from "api/WalletApi";
import WalletDb from "stores/WalletDb";
import {LimitOrder,Price,LimitOrderCreate} from "common/MarketClasses";
import marketUtils from "common/market_utils";
import WalletUnlockStore from "stores/WalletUnlockStore";

let portfolioStorage = new ls("__trusty_portfolio__");

const createMap = (myObj) =>{
     return new Map(
        Object
            .keys(myObj)
            .map(
                key => [key, myObj[key]]
            )
    )
}

class PortfolioActions {

    incrementAsset(asset){
        return dispatch => {
            dispatch({asset});
        }
    }

    decrementAsset(asset){
        return dispatch => {
            dispatch({asset});
        }
    }

    getNeedleSumsFromPortfolio(portfolio){
        let sells = [];
        let buys = [];
        portfolio.data.forEach((asset) => {
            if (asset.futureShare > asset.currentShare){
                asset.type = "buy";
                asset.amountToSellBase = Math.floor(portfolio.totalBaseValue * asset.futureShare / 100);
            }else if(asset.futureShare < asset.currentShare){
                asset.type = "sell";
                if (asset.futureShare == 0){
                    asset.amountToSell = asset.amount;
                }else{
                    let fullAmmountInCurrent = Math.floor(asset.amount * 100 / asset.currentShare);
                    let amountInFuture = Math.floor(fullAmmountInCurrent * asset.futureShare / 100);
                    let otherPortfolioAmount = fullAmmountInCurrent - asset.amount;
                    let amountToSell = fullAmmountInCurrent - otherPortfolioAmount - amountInFuture;
                    asset.amountToSell = amountToSell;
                }
            }else{
                asset.type = "none";
            }
        });
        return portfolio;
    }

    makeBuyOrderCallback(asset,baseAsset,accountID){
        let quoteAsset = ChainStore.getObject(asset.assetMap.get("id"));

        return this.getMarketOrders(baseAsset,quoteAsset,"asks").then((asks)=>{
            let totalWants = 0;
            for (let i = 0; i < asks.length; i++){
                let ask = asks[i];
                let theyWants = ask.totalToReceive({noCache: true});
                totalWants += theyWants.amount;
                if (totalWants >= asset.amountToSellBase){

                    theyWants.amount = asset.amountToSellBase;
                    let weReceive = theyWants.times(ask.sellPrice());

                    let order = new LimitOrderCreate({
                        for_sale: theyWants,
                        to_receive: weReceive,
                        seller: accountID,
                        fee: {
                            asset_id: baseAsset.get("id"),
                            amount: 0
                        }
                    });
                    order.type = "buy";
                    console.log("ORDER FOR " + asset.assetFullName,asset,order);
                    return order;
                }
            }
        });
    }

    makeSellOrderCallback(asset,baseAsset,accountID){
        let quoteAsset = ChainStore.getObject(asset.assetMap.get("id"));
        
        return this.getMarketOrders(baseAsset,quoteAsset,"bids").then((bids)=>{
            let totalWants = 0;
            for (let i = 0; i < bids.length; i++){
                let bid = bids[i];
                let theyWants = bid.totalToReceive({noCache: true});
                totalWants += theyWants.amount;
                if (totalWants >= asset.amountToSell){

                    theyWants.amount = asset.amountToSell;
                    let weReceive = theyWants.times(bid.sellPrice());

                    let order = new LimitOrderCreate({
                        for_sale: theyWants,
                        to_receive: weReceive,
                        seller: accountID,
                        fee: {
                            asset_id: baseAsset.get("id"),
                            amount: 0
                        }
                    });
                    order.type = "sell";
                    console.log("ORDER FOR " + asset.assetFullName,asset,order);
                    return order;
                }
            }
        });

    }


    getMarketOrders(baseAsset,quoteAsset,type = "bids"){
        let assets = {
            [quoteAsset.get("id")]: {precision: quoteAsset.get("precision")},
            [baseAsset.get("id")]: {precision: baseAsset.get("precision")}
        };
        return Apis.instance().db_api().exec("get_limit_orders", [ baseAsset.get("id"), quoteAsset.get("id"), 50 ])
        .then((results)=>{
            let orders = [];
            results.forEach((result) => {
                let order = new LimitOrder(result, assets, quoteAsset.get("id"));
                orders.push(order);
            });
            return (type == "bids") ? marketUtils.getBids(orders) : marketUtils.getAsks(orders);
        });
    }



    updatePortfolio(account, router){

        if(WalletUnlockStore.getState().locked) {
            router.push('/unlock')
            return dispatch => dispatch()
        }

        PortfolioStore.setLoading();
        let portfolio = PortfolioStore.getState();
        let summedportfolio = this.getNeedleSumsFromPortfolio(portfolio);
        let baseAsset = ChainStore.getAsset("BTS");
        let ordersCallbacks = [];
        
        summedportfolio.data.forEach((asset)=>{
            if (asset.type == "sell"){
                if (asset.assetFullName != baseAsset.get("symbol")){
                    ordersCallbacks.push(this.makeSellOrderCallback(asset,baseAsset,account.get("id")));
                }
            }
            if (asset.type == "buy"){
                if (asset.assetFullName != baseAsset.get("symbol")){
                    ordersCallbacks.push(this.makeBuyOrderCallback(asset,baseAsset,account.get("id")));
                }
            }
        });

        return dispatch => {
            return Promise.all(ordersCallbacks).then(function(orders) {
                var buyTransaction = WalletApi.new_transaction();
                var sellTransaction = WalletApi.new_transaction();
                let sellCount = 0,buyCount = 0;
                orders.forEach((order)=>{
                    order.setExpiration();
                    if (order.type == "buy"){
                        order = order.toObject();
                        buyTransaction.add_type_operation("limit_order_create", order);
                        buyCount++;
                    }
                    if (order.type == "sell"){
                        order = order.toObject();
                        sellTransaction.add_type_operation("limit_order_create", order);
                        sellCount++;
                    }
                });

                //Вот в этот момент нужно вызвать кастомный экран подтверждения на котором будет список операций (orders)
                //Пока что там можно просто вывести их в строчку по паре полей (желтым шрифтом как на accontoverview)
                //Соответствено на экране будет input для пароля, потом список операций, потом две кнопки Approve, Deny
                //Ессли выбрано Approve то исполняется код который дальше, если нет - то dispatch("canceled")
                //Нужно убрать анлок на входе в manage чтобы начать.
                //Строка в формате: Покупаем X {AssetName} За Y BTS (order.type == "buy")
                //                  Покупаем X BTS за Y {AssetName} (order.type == "sell" - но его пока нет, я добавлю в процессе)


                if (buyCount){
                    WalletDb.process_transaction(buyTransaction, null, true).then(result => {
                        console.log("DONE TRANSACTION",result);
                        dispatch();
                    })
                    .catch(error => {
                        console.log("order error:", error);
                        return {error};
                    });
                }else{
                    dispatch(0);
                }
            });
        }
    }

    suggestPortfolio(){
        let portfolio = PortfolioStore.getState().data;


    }

    concatPortfolio(account){
        
        portfolioStorage.set("portfolio",{});

        let defaultPortfolio = PortfolioStore.getDefaultPortfolio();
        let portfolioData = defaultPortfolio.data.slice();
        let baseSymbol = defaultPortfolio.base;
        let futureMode = PortfolioStore.getState().futureMode;

        let {data,totalBaseValue} = getActivePortfolio(account, portfolioData, baseSymbol);

        let portfolio = {
            data: data,
            totalBaseValue: totalBaseValue,
            base: baseSymbol,
            map: data.map(b=>b.assetShortName)
        }

        return dispatch =>{
            return new Promise((resolve, reject)=>{
                Promise.resolve().then(()=>{
                    portfolio.data.forEach((bal)=>{
                        Apis.instance().db_api().exec("list_assets", [
                            bal.assetFullName, 1
                        ]).then(assets => {
                            ChainStore._updateObject(assets[0], false);
                            bal.assetMap = createMap(assets[0]);
                            if(!bal.balanceMap) {
                                bal.balanceID = null;
                                bal.balanceMap = createMap({
                                    id:"0",
                                    owner: "0",
                                    asset_type: "0",
                                    balance: "0"
                                })
                                bal.baseEqValue = 0;
                                bal.amount = 0;
                                bal.currentShare =  0;
                                bal.bitUSDShare = 0;
                            }

                            if (!bal.futureShare){
                                bal.futureShare = 0;
                            }
                        })  
                    })
                }).then(()=>{
                    portfolio.totalFutureShare = 0;
                    portfolio.data.forEach(i=>{
                        PortfolioStore.getState().data && PortfolioStore.getState().data.forEach(already=>{
                            if(already.assetShortName == i.assetShortName) {
                                i.futureShare = already.futureShare;
                            }
                        })
                        portfolio.totalFutureShare += i.futureShare;
                    })

                    portfolioStorage.set("portfolio",portfolio);
                    resolve(portfolio);
                    dispatch(portfolio);
                })
            })
        }
    }
}

let countEqvValue = (amount,from,to) => {
    let fromAsset = ChainStore.getAsset(from);
    let toAsset = ChainStore.getAsset(to);

    if(!toAsset || !fromAsset) return 0

    let marketStats = MarketsStore.getState().allMarketStats

    let coreAsset = ChainStore.getAsset("1.3.0");
    let toStats, fromStats;
    let toID = toAsset.get("id");
    let toSymbol = toAsset.get("symbol");
    let fromID = fromAsset.get("id");
    let fromSymbol = fromAsset.get("symbol");

    if (coreAsset && marketStats) {
        let coreSymbol = coreAsset.get("symbol");
        toStats = marketStats.get(toSymbol + "_" + coreSymbol);
        fromStats = marketStats.get(fromSymbol + "_" + coreSymbol);
    }

    let price = utils.convertPrice(fromStats && fromStats.close ? fromStats.close :
                                    fromID === "1.3.0" || fromAsset.has("bitasset") ? fromAsset : null,
                                    toStats && toStats.close ? toStats.close :
                                    (toID === "1.3.0" || toAsset.has("bitasset")) ? toAsset : null,
                                    fromID,
                                    toID);

    return price ? Math.floor(utils.convertValue(price, amount, fromAsset, toAsset)): 0;
}


let getActivePortfolio = (account, portfolioData,baseSymbol)=>{
    

    let balances  = PortfolioStore.getBalances(account);
    let futureMode = PortfolioStore.getState().futureMode;
    let activeBalaces = []
    let totalBaseValue = 0;

    balances.forEach(balance => {

        let balanceObject = ChainStore.getObject(balance)
        let asset_type = balanceObject.get("asset_type");
        let balanceAsset = ChainStore.getObject(asset_type);

        if (balanceAsset) {

            let data = portfolioData.filter(p=>{
                return p.assetShortName==balanceAsset.get("symbol") || p.assetFullName==balanceAsset.get("symbol")
            })
            let futureShare = (data.length) ? portfolioData.splice(portfolioData.findIndex(i=>i.assetFullName==data[0].assetFullName), 1)[0].futureShare : 0;
           
            let symbol = balanceAsset.get("symbol")
            let amount = Number(balanceObject.get("balance"));
            let eqValue = countEqvValue(amount,symbol,baseSymbol);
            let eqUsdValue = (countEqvValue(amount,symbol,"USD") / 10000).toFixed(2);
            totalBaseValue += eqValue;

            activeBalaces.push({
                balanceID: balance,
                balanceMap: balance,
                assetShortName: ~symbol.search(/open/i) ? symbol.substring(5) : symbol,
                assetFullName: symbol, 
                futureShare: futureShare,
                baseEqValue: eqValue,
                bitUSDShare: eqUsdValue,
                amount: amount
            });
        }
    });

    activeBalaces.forEach((balance)=>{
        balance.currentShare = Math.round( 100 * balance.baseEqValue / totalBaseValue );
    });

    return {data:activeBalaces.concat(portfolioData),totalBaseValue: totalBaseValue}

}

export default alt.createActions(PortfolioActions)