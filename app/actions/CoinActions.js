import alt from "alt-instance";

class CoinActions {

    setCoinPayload({ value, type, deposit }) {
        return { value, type, deposit }
    }

    setTrustyDepositIsOrdered(value) {
    	return value
    }

}

const CoinActionsInstance = alt.createActions(CoinActions);

export default CoinActionsInstance;
