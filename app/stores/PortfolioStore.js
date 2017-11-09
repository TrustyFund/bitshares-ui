import BaseStore from "./BaseStore";
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

const createMap = (myObj) =>{
     return new Map(
        Object
            .keys(myObj)
            .map(
                key => [key, myObj[key]]
            )
    )
}

let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {
	constructor() {
        super();
        this.summValid = false;
        this._export(
            "getPortfolio",
            "getTotalPercentage",
            "incrementAsset",
            "decrementAsset",
            "isValid",
            "getBalances",
            "updatePortfolio",
            "getConcatedPortfolio"
        );
        this.getPortfolio = this.getPortfolio.bind(this);
        this.getConcatedPortfolio = this.getConcatedPortfolio.bind(this)
        this.getTotalPercentage = this.getTotalPercentage.bind(this);
        this.incrementAsset = this.incrementAsset.bind(this);
        this.decrementAsset = this.decrementAsset.bind(this);
        this.isValid = this.isValid.bind(this);
        this.getBalances = this.getBalances.bind(this);
        this.updatePortfolio = this.updatePortfolio.bind(this);
        this.chainStoreUpdate = this.chainStoreUpdate.bind(this);
    }

    getBalances(account){

        let account_balances = account.get("balances");
        let orders = account.get("orders", null);
        if (account_balances) {
            // Filter out balance objects that have 0 balance or are not included in open orders
            account_balances = account_balances.filter((a, index) => {
                let balanceObject = ChainStore.getObject(a);
                if (balanceObject && (!balanceObject.get("balance") && !orders[index])) {
                    return false;
                } else {
                    return true;
                }
            })
        }
        return account_balances;
    }

    getPortfolio(){
        let storedPortfolio = portfolioStorage.get("portfolio");

        let defaultPortfolio = {
            data:[
                { assetShortName: "BTC",
                  futureShare: 60,
                  currentShare:0,
                  assetFullName: "OPEN.BTC"},
                { assetShortName: "ETH",
                  futureShare: 10,
                  currentShare:0,
                  assetFullName: "OPEN.ETH"},
                { assetShortName: "DASH",
                  futureShare: 5,
                  currentShare:0,
                  assetFullName: "OPEN.DASH"},
                { assetShortName: "LTC",
                  futureShare: 10,
                  currentShare:0,
                  assetFullName: "OPEN.LTC"},
                { assetShortName: "EOS",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "OPEN.EOS"},
                { assetShortName: "STEEM",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "OPEN.STEEM"},
                { assetShortName: "BTS",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "BTS"},
                { assetShortName: "TRFND",
                  futureShare: 3,
                  currentshare:0,
                  assetFullName: "TRFND"}
            ],
            map: ["BTC","ETH","DASH","LTC","EOS","STEEM","BTS","TRFND"]
        };

        if (storedPortfolio.data && storedPortfolio.data.length > 0){
            return storedPortfolio;
        }else{
            portfolioStorage.set("portfolio",defaultPortfolio);
            return defaultPortfolio;
        }

    }

    _getCurrentShare(amount, fromAsset, percentage=false){

        fromAsset = ChainStore.getObject(fromAsset)
        let toAsset = ChainStore.getAsset("USD")

        if(!toAsset) return 0
        //console.log("------>", toAsset)
        let marketStats = MarketsStore.getState().allMarketStats

        let coreAsset = ChainStore.getAsset("1.3.0");
        let toStats, fromStats;
        let toID = toAsset.get("id");
        let toSymbol = toAsset.get("symbol");
        let fromID = fromAsset.get("id");
        let fromSymbol = fromAsset.get("symbol");

        // console.log("marketStats:", marketStats.toJS());
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

        let eqValue = price ? utils.convertValue(price, amount, fromAsset, toAsset) : null;
        if(eqValue==null) return 0

        if(percentage) {

            let totalAmount = +localStorage.getItem("_trusty_total_value")
            let percent = eqValue.toFixed(2) / totalAmount.toFixed(2) * 100
            return percent.toFixed(0) 
            
        }
 
    }

    getConcatedPortfolio(account, marketData=null){
        portfolioStorage.set("portfolio",{});
        let balances  = this.getBalances(account)
        let activeBalaces = []
        //balances list Map { _root: { entries:[["1.3.0": "2.5.1315326" ]]} }

        let portfolioData = this.getPortfolio().data.slice()
        balances.forEach(b=> {

            let balance = ChainStore.getObject(b)
            let balanceAsset = ChainStore.getObject(balance.get("asset_type"))

            if (balanceAsset) {

                let data = portfolioData.filter(p=>{
                    return p.assetShortName==balanceAsset.get("symbol") || p.assetFullName==balanceAsset.get("symbol")
                })
                let futureShare
                if(data.length){
                   futureShare = portfolioData.splice(portfolioData.findIndex(i=>i.assetFullName==data[0].assetFullName), 1)[0].futureShare 
                } 
             
                let asset_type = balance.get("asset_type");
                let asset = ChainStore.getObject(asset_type);
                if(asset) {
                    let s = asset.get("symbol")
                    let amount = Number(balance.get("balance"))
                    activeBalaces.push({
                        balanceID: b,
                        balanceMap: balance,
                        assetShortName: ~s.search(/open/i)?s.substring(5):s,
                        assetFullName: asset.get("symbol"), 
                        futureShare: futureShare || 0, 
                        currentShare: +this._getCurrentShare(amount, asset_type, true), 
                        amount, 
                    })    
                } 
            
            }
           
        })

        let data = activeBalaces.concat(portfolioData)

        let port = {
            data,
            map: data.map(b=>b.assetShortName)
        }

        return new Promise((resolve, reject)=>{
            Promise.resolve().then(()=>{
                port.data.forEach((item, index)=>{
                    Apis.instance().db_api().exec("list_assets", [
                        item.assetShortName, 1
                    ]).then(assets => {
                        let bal = port.data[index]
                        bal.assetMap = createMap(assets[0])
                        if(!bal.balanceMap) {
                            bal.balanceID = null;
                            bal.balanceMap = createMap({
                                id:"0",
                                owner: "0",
                                asset_type: "0",
                                balance: "0"
                            })
                            bal.amount = 0
                            bal.currentShare =  0
                        }
                        if(!bal.futureShare) bal.futureShare = 0
                        // bal.priceBts = 0
                    })  
                })
                
            }).then(()=>{
                portfolioStorage.set("portfolio",port);
                console.log(port)
                resolve(port)
            })
        })
    }

    incrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let assetIndex = storedPortfolio.map.indexOf(asset)
        if (assetIndex >= 0 && storedPortfolio.data[assetIndex].futureShare < 100){
            storedPortfolio.data[assetIndex].futureShare++; 
            portfolioStorage.set("portfolio",storedPortfolio);
            return true;
        }
        return false;
    }

    decrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let assetIndex = storedPortfolio.map.indexOf(asset)
        if (assetIndex >= 0 && storedPortfolio.data[assetIndex].futureShare > 0){
            storedPortfolio.data[assetIndex].futureShare--; 
            portfolioStorage.set("portfolio",storedPortfolio);
            return true;
        }
        return false;
    }

    getTotalPercentage(){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let result = 0;
        storedPortfolio.data.forEach(current => {
            result = result + current.futureShare;
        });
        this.summValid = result == 100;
        return result;
    }	

    isValid(){
        return this.summValid;
    }

    updatePortfolio(account){
        ChainStore.subscribe(this.chainStoreUpdate);
        this.getConcatedPortfolio(account).then((result) => {
            result.data.forEach((asset) => {
                let a = ChainStore.getAsset(asset.marketAsset);
            });
        });
    }

    chainStoreUpdate(){
        let portfolio = this.getPortfolio();
        let assetsFetchComplite = true;
        portfolio.data.forEach((asset)=>{
            if (!ChainStore.assets_by_symbol.has(asset.marketAsset)){
                assetsFetchComplite = false;
            }
        });
        
        if (assetsFetchComplite){
            ChainStore.unsubscribe(this.chainStoreUpdate);

            let baseAsset = ChainStore.getAsset("BTS");
            let portfolio = this.getPortfolio();

            portfolio.data.forEach((asset) => {
                if (asset.asset != "BTS"){
                    let quoteAsset = ChainStore.getAsset(asset.marketAsset);
                    MarketsActions.subscribeMarket(baseAsset, quoteAsset, 20).then(()=>{
                        MarketsActions.getMarketStats(baseAsset,quoteAsset);
                        let stats = MarketsStore.getState().marketData;
                        console.log("STATS: ",quoteAsset.get("symbol"),stats);
                        MarketsActions.unSubscribeMarket(quoteAsset,baseAsset);
                    });  
                }
            });
        }
    }
}
export default alt.createStore(PortfolioStore, "PortfolioStore");