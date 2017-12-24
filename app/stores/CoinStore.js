import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";
import CoinActions from "actions/CoinActions"


class PortfolioStore extends BaseStore {
	constructor() {
        super();

        this._export(

        );

        this.state = {
            coinValue: "0",
            coinType: "BTC",
            deposit: true
        }

        this.bindListeners({
            onSetCoinPayload: CoinActions.setCoinPayload,
        })

    }

    onSetCoinPayload({value, type, deposit}) {
        this.setState({
          coinType: type,
          coinValue: value,
          deposit
        })
    }

}

export default alt.createStore(PortfolioStore, "CoinStore");