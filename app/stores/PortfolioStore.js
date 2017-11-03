import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";

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
            "getAssetPrices"
        );
        this.getPortfolio = this.getPortfolio.bind(this);
        this.getTotalPercentage = this.getTotalPercentage.bind(this);
        this.incrementAsset = this.incrementAsset.bind(this);
        this.decrementAsset = this.decrementAsset.bind(this);
        this.isValid = this.isValid.bind(this);
        this.getBalances = this.getBalances.bind(this);
        this.getAssetPrices = this.getAssetPrices.bind(this);
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
            });
        }
        console.log(account_balances);
    }

    getPortfolio(){
        let storedPortfolio = portfolioStorage.get("portfolio");

        let defaultPortfolio = {
            data:[
                {asset: "BTC",share: 60,marketAsset: "OPEN.BTC",tradable: true},
                {asset: "ETH",share: 10,marketAsset: "OPEN.ETH",tradable: true},
                {asset: "DASH",share: 5,marketAsset: "OPEN.DASH",tradable: true},
                {asset: "LTC",share: 10,marketAsset: "OPEN.LTC",tradable: true},
                {asset: "EOS",share: 4,marketAsset: "OPEN.EOS",tradable: true},
                {asset: "STEEM",share: 4,marketAsset: "OPEN.STEEM",tradable: true},
                {asset: "BTS",share: 4,marketAsset: "BTS",tradable: false},
                {asset: "TRFND",share: 3,marketAsset: "TRFND",tradable: true}
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

    incrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let assetIndex = storedPortfolio.map.indexOf(asset)
        if (assetIndex >= 0 && storedPortfolio.data[assetIndex].share < 100){
            storedPortfolio.data[assetIndex].share++; 
            portfolioStorage.set("portfolio",storedPortfolio);
            return true;
        }
        return false;
    }

    decrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let assetIndex = storedPortfolio.map.indexOf(asset)
        if (assetIndex >= 0 && storedPortfolio.data[assetIndex].share > 0){
            storedPortfolio.data[assetIndex].share--; 
            portfolioStorage.set("portfolio",storedPortfolio);
            return true;
        }
        return false;
    }

    getTotalPercentage(){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let result = 0;
        storedPortfolio.data.forEach(current => {
            result = result + current.share;
        });
        this.summValid = result == 100;
        return result;
    }	

    isValid(){
        return this.summValid;
    }

    getAssetPrices(){
        let baseAsset = ChainStore.getAsset("BTS");
        let portfolio = this.getPortfolio();
        console.log("BASE",baseAsset);

        portfolio.data.forEach((asset) => {
            let marketAsset = asset.marketAsset;
            let tradable = asset.tradable;
            if (tradable){
                this.getAsset(marketAsset).then((quoteAsset)=> {
                    console.log("QUOTE",marketAsset,quoteAsset);
                    MarketsActions.subscribeMarket(baseAsset, quoteAsset, 20).then(()=>{
                        MarketsActions.getMarketStats(baseAsset,quoteAsset);
                        let stats = MarketsStore.getState().marketData;
                        console.log("STATS",stats);
                        MarketsActions.unSubscribeMarket(quoteAsset,baseAsset);
                    });  
                });
            }
        });
    }

    getAsset(symbol){
        return new Promise((resolve,reject) => {
            let quoteAsset = ChainStore.getAsset(symbol);
            if (quoteAsset){
                resolve(quoteAsset)
            }else{
                reject("No such " + symbol);     
            }   
        })
    }
}
export default alt.createStore(PortfolioStore, "PortfolioStore");