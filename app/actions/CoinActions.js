import alt from "alt-instance";

class CoinActions {

    setCoinPayload({ value, type, deposit }) {
        return { value, type, deposit }
    }

}

const CoinActionsInstance = alt.createActions(CoinActions);

export default CoinActionsInstance;
