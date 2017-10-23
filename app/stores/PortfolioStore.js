import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";

let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {

	constructor() {
        super();
        this._export(
            "getPortfolio",
            "getTotalPercentage",
            "incrementAsset",
            "decrementAsset"
        );
        this.getPortfolio = this.getPortfolio.bind(this);
        this.getTotalPercentage = this.getTotalPercentage.bind(this);
        this.incrementAsset = this.incrementAsset.bind(this);
        this.decrementAsset = this.decrementAsset.bind(this);
    }

    getPortfolio(){
        let storedPortfolio = portfolioStorage.get("portfolio");

        let defaultPortfolio = {
            data:[
                {asset: "BTC",share: 60},
                {asset: "ETH",share: 10},
                {asset: "LTC",share: 10},
                {asset: "DASH",share: 5},
                {asset: "EOS",share: 4},
                {asset: "STEEM",share: 4},
                {asset: "BTS",share: 4},
                {asset: "TRFND",share: 3}
            ],
            map: ["BTC","ETH","LTC","DASH","EOS","STEEM","BTS","TRFND"]
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
        return result;
    }	
}

export default alt.createStore(PortfolioStore, "PortfolioStore");