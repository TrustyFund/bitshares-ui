import alt from "alt-instance";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";
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


    execBuyOrders(){
        return dispatch=> { 
            let { totalBaseValue, totalBuyOrdersPrice, buyOrders } = PortfolioStore.getState()
            if(buyOrders.length) {
                if(totalBaseValue > totalBuyOrdersPrice ) {
                    buyOrders[0]()
                    dispatch(true)
                    console.log("Orders transactions done")
                    return
                }
            }
            dispatch()

        }
    }


    calculateSums(portfolio){
        let sells = [];
        let buys = [];
        portfolio.data.forEach((asset) => {
            if (asset.futureShare > asset.currentShare){
                asset.type = "buy";
                asset.amountToSell = Math.floor(portfolio.totalBaseValue * asset.futureShare / 100);
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

    //Yes, this function makes Orders for Sell and Summzz calculations
    makeOrderCallback(asset,baseAsset,accountID, type){
        let quoteAsset = ChainStore.getObject(asset.assetMap.get("id"));

        return this.getMarketOrders(baseAsset,quoteAsset,(type == "buy") ? "asks" : "bids").then((marketOrders)=>{
            let totalWants = 0;
            for (let i = 0; i < marketOrders.length; i++){
                let marketOrder = marketOrders[i];
                let theyWants = marketOrder.totalToReceive({noCache: true});
                totalWants += theyWants.amount;
                if (totalWants >= asset.amountToSell){

                    theyWants.amount = asset.amountToSell;
                    let weReceive = theyWants.times(marketOrder.sellPrice());
                    

                    let order = new LimitOrderCreate({
                        for_sale: theyWants,
                        to_receive: weReceive,
                        seller: accountID,
                        fee: {
                            asset_id: baseAsset.get("id"),
                            amount: 0
                        }
                    });
                    order.type = type;
                    if (type == "sell"){
                        console.log("ORDER " + type + " FOR " + asset.assetFullName,order);
                        console.log("market",marketOrder)
                        console.log("theyWants",theyWants)
                        console.log("weReceive",weReceive)
                    }
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



    updatePortfolio(account){
        PortfolioStore.setLoading();
        let portfolio = PortfolioStore.getState();

        console.log("PORTFOLIO",portfolio);

        let calculated = this.calculateSums(portfolio);
        let baseAsset = ChainStore.getAsset("BTS");
        let ordersCallbacks = [];
        
        calculated.data.forEach((asset)=>{
            if (asset.assetFullName != baseAsset.get("symbol") && asset.type != "none"){
                ordersCallbacks.push(this.makeOrderCallback(asset,baseAsset,account.get("id"),asset.type));
            }

        });

        return dispatch => {
            return Promise.all(ordersCallbacks).then(function(orders) {
                console.log("ORDERS",orders);
                var buyTransaction = WalletApi.new_transaction();
                var sellTransaction = WalletApi.new_transaction();
                let sellCount = 0,buyCount = 0;
                let totalBuyOrdersPrice = 0
                orders.forEach((order)=>{
                    if(order) {
                        if (order.type == "buy"){
                            totalBuyOrdersPrice+= order.amount_for_sale.amount
                            order.setExpiration();
                            order = order.toObject();
                            buyTransaction.add_type_operation("limit_order_create", order);
                            buyCount++;
                        }

                        if (order.type == "sell"){
                            order.setExpiration();
                            order = order.toObject();
                            sellTransaction.add_type_operation("limit_order_create", order);
                            sellCount++;
                        }    
                    }
                });


                let transactionProcess = () => {
                    return WalletDb.process_transaction(sellTransaction, null, true).then(result => {
                        console.log("DONE SELL TRANSACTION",result);
                        dispatch({buyOrdersProcess})
                        return
                    })
                    .catch(error => {
                        console.log("order error:", error);
                        return {error};
                    });
                }

                let buyOrdersProcess = () => {
                    WalletDb.process_transaction(buyTransaction, null, true).then(result => {
                        console.log("DONE BUY TRANSACTION",result);
                        return
                    })
                    .catch(error => {
                        console.log("order error:", error);
                        return {error};
                    });
                }

                if (sellCount){
                    dispatch({orders, totalBuyOrdersPrice })
                    dispatcher.dispatch({type: "trusty_manage_modal", orders, transactionProcess });
                }else{
                    alert("no sell count")
                    dispatch(0);
                }

            });
        }
    }

    suggestPortfolio(){
        let portfolio = PortfolioStore.getState().data;
        let defaultPortfolio = PortfolioStore.getDefaultPortfolio(); 
        let concatenated = this.concatenate(portfolio,defaultPortfolio,true);
        return dispatch => {dispatch(concatenated)}
    }

    //Возвращает массив балансов, дополненный ассетами из портфеля, 
    //в зависимости от флага futureMode будет заполнение futureShare из портфеля или нет
    concatenate(portfolio,defaultPortfolio, futureMode = false){
        defaultPortfolio.map = defaultPortfolio.data.map(b=>b.assetFullName)

        defaultPortfolio.data.forEach(asset => {
            if (!futureMode){
                asset.futureShare = 0;
            }
        });

        portfolio.forEach((asset)=>{
            var indexInDefault = defaultPortfolio.map.indexOf(asset.assetFullName);
            if (indexInDefault > -1){
                let defaultAsset = defaultPortfolio.data[indexInDefault];
                if (futureMode){
                    asset.futureShare = defaultAsset.futureShare;
                }
                defaultPortfolio.map.splice(indexInDefault,1);
                defaultPortfolio.data.splice(indexInDefault,1);
            }
        });
        return portfolio.concat(defaultPortfolio.data);
    }

    compilePortfolio(balances){
        

        let defaultPortfolio = PortfolioStore.getDefaultPortfolio();
        let baseSymbol = defaultPortfolio.base;

        let {data,totalBaseValue,totalUSDShare} = getBalancePortfolio(balances,baseSymbol);

        let concatenated = this.concatenate(data,defaultPortfolio);

        let portfolio = {
            data: concatenated,
            totalBaseValue: totalBaseValue,
            totalUSDShare: totalUSDShare,
            base: baseSymbol,
            map: data.map(b=>b.assetShortName)
        }

        return dispatch =>{
            return new Promise((resolve, reject)=>{
                Promise.resolve().then(()=>{
                    let listCallbacks = [];

                    portfolio.totalFutureShare = 0;
                    portfolio.data.forEach( bal =>{
                        listCallbacks.push(
                            Apis.instance().db_api().exec("list_assets", [
                                bal.assetFullName, 1
                            ]).then(assets => {
                                ChainStore._updateObject(assets[0], false);
                                bal.assetMap = createMap(assets[0]);
                            })
                        );
                        portfolio.totalFutureShare += bal.futureShare;
                    });

                    Promise.all(listCallbacks).then(()=>{
                        resolve(portfolio);
                        dispatch(portfolio);
                    });
                })
            })
        }
    }
}

let getBalancePortfolio = (balances, baseSymbol)=>{
    let futureMode = PortfolioStore.getState().futureMode;
    let activeBalaces = []
    let totalBaseValue = 0,totalUSDShare = 0;

    balances.forEach(balance => {
       
        let balanceObject = ChainStore.getObject(balance)
        let asset_type = balanceObject.get("asset_type");
        let balanceAsset = ChainStore.getObject(asset_type);

        if (balanceAsset) {
            let symbol = balanceAsset.get("symbol")
            let amount = Number(balanceObject.get("balance"));
            let eqValue = countEqvValue(amount,symbol,baseSymbol);
            let eqUsdValue = (countEqvValue(amount,symbol,"USD") / 10000).toFixed(2);
            totalBaseValue += Math.floor(eqValue);
            totalUSDShare += Math.floor(eqUsdValue);

            activeBalaces.push({
                balanceID: balance,
                balanceMap: balance,
                assetShortName: ~symbol.search(/open/i) ? symbol.substring(5) : symbol,
                assetFullName: symbol, 
                baseEqValue: +eqValue,
                bitUSDShare: +eqUsdValue,
                amount: amount
            });
        }
    });

    activeBalaces.forEach((balance)=>{
        balance.currentShare = Math.round( 100 * balance.baseEqValue / totalBaseValue );
        balance.futureShare = balance.currentShare;
    });

    return {data:activeBalaces,totalBaseValue: totalBaseValue, totalUSDShare: totalUSDShare}
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

export default alt.createActions(PortfolioActions)