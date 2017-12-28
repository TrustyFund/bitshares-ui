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
            coinValue: "",
            coinType: "BTC",
            deposit: true,
            isTrustyDepositOrder: false
        }

        this.bindListeners({
            onSetCoinPayload: CoinActions.setCoinPayload,
            onSetTrustyDepositIsOrdered: CoinActions.setTrustyDepositIsOrdered
        })

    }
    onSetTrustyDepositIsOrdered(value) {
        this.setState({
            isTrustyDepositOrder: value
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