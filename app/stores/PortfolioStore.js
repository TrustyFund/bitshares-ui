import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";

let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {

	constructor() {
        super();
        this._export(
            "getPortfolio"
        );
        this.getPortfolio = this.getPortfolio.bind(this);
    }

    getPortfolio(){
        let defaultPortfolio = [
            {asset: "ETH",share: 0.4},
            {asset: "BTC",share: 0.3},
            {asset: "LTC",share: 0.15},
            {asset: "DASH",share: 0.12},
            {asset: "TRFND",share: 0.03}
        ];
    	return defaultPortfolio;
    }
	
}

export default alt.createStore(PortfolioStore, "PortfolioStore");