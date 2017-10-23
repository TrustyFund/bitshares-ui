import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";

let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {
	constructor() {
        super();
        this._export(
            "test"
        );
        this.test = this.test.bind(this);
    }

    test(){
    	return "trololo";
    }
	
}

export default alt.createStore(PortfolioStore, "PortfolioStore");