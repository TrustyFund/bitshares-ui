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

        let defaultPortfolio = [
            {asset: "BTC",share: 0.6},
            {asset: "ETH",share: 0.1},
            {asset: "LTC",share: 0.1},
            {asset: "DASH",share: 0.05},
            {asset: "EOS",share: 0.04},
            {asset: "STEEM",share: 0.04},
            {asset: "BTS",share: 0.04},
            {asset: "TRFND",share: 0.03}
        ];

        if (storedPortfolio.length > 0){
            return storedPortfolio;
        }else{
            portfolioStorage.set("portfolio",defaultPortfolio);
            return defaultPortfolio;
        }
    }

    incrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        storedPortfolio.forEach(current => {
            if (current.asset === asset){
                current.share = current.share + 0.01;
            }
        });
        portfolioStorage.set("portfolio",storedPortfolio);
    }

    decrementAsset(asset){
        let storedPortfolio = portfolioStorage.get("portfolio");
        storedPortfolio.forEach(current => {
            if (current.asset === asset){
                current.share = current.share - 0.01;
            }
        });
        portfolioStorage.set("portfolio",storedPortfolio);
    }

    getTotalPercentage(){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let result = 0;
        storedPortfolio.forEach(current => {
            result += current.share;
        });
        return result;
    }	
}

export default alt.createStore(PortfolioStore, "PortfolioStore");