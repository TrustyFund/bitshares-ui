import React from "react";
import FormattedAsset from "../../Utility/FormattedAsset";
import {Link} from "react-router/es";
import classNames from "classnames";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import utils from "common/utils";
import BlockTime from "components/Blockchain/Trusty/BlockTime";
import LinkToAccountById from "../../Utility/LinkToAccountById";
import LinkToAssetById from "../../Utility/LinkToAssetById";
import BindToChainState from "../../Utility/BindToChainState";
import ChainTypes from "../../Utility/ChainTypes";
import TranslateWithLinks from "components/Utility/Trusty/TranslateWithLinks";
import {ChainStore, ChainTypes as grapheneChainTypes} from "bitsharesjs/es";
import account_constants from "chain/account_constants";
import MemoText from "../../Blockchain/MemoText";
import ProposedOperation from "../../Blockchain/ProposedOperation";
import marketUtils from "common/market_utils";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";

const {operations} = grapheneChainTypes;

let ops = Object.keys(operations);
let listings = account_constants.account_listing;

class TransactionLabel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (
            nextProps.color !== this.props.color ||
            nextProps.type !== this.props.type
        );
    }
    render() {
        let trxTypes = counterpart.translate("transaction.trxTypes");
        let labelClass = classNames("label", this.props.color || "info");
        return (
            <span className={labelClass}>
                {trxTypes[ops[this.props.type]]}
            </span>
        );
    }
}

class Row extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    }

    static propTypes = {
        dynGlobalObject: ChainTypes.ChainObject.isRequired,
    };

    static defaultProps = {
        dynGlobalObject: "2.1.0",
    };

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        let {block, dynGlobalObject} = this.props;
        let last_irreversible_block_num = dynGlobalObject.get("last_irreversible_block_num" );
        if (nextProps.dynGlobalObject === this.props.dynGlobalObject) {
            return false;
        }
        return block > last_irreversible_block_num;

    }

    render() {
        return <div style={{margin:".3rem 0", color:"#e2de1b"}}> { this.props.info }, <BlockTime  block_number={this.props.block}/></div>;
    }
}
Row = BindToChainState(Row, {keep_updating:true});

class Operation extends React.Component {

    static defaultProps = {
        op: [],
        current: "",
        block: null,
        hideOpLabel: false,
        csvExportMode: false
    };

    static propTypes = {
        op: React.PropTypes.array.isRequired,
        current: React.PropTypes.string,
        block: React.PropTypes.number,
        csvExportMode: React.PropTypes.bool
    };

    componentWillReceiveProps(np) {
        if (np.marketDirections !== this.props.marketDirections) {
            this.forceUpdate();
        }
    }

    shouldComponentUpdate(nextProps) {
        if (!this.props.op || !nextProps.op) {
            return false;
        }
        return !utils.are_equal_shallow(nextProps.op[1], this.props.op[1]) ||
            nextProps.marketDirections !== this.props.marketDirections;
    }

    render() {

        let {op, current, block} = this.props;
        let line = null, column = null, color = "info";
        let memoComponent = null;
        
        switch (ops[op[0]]) { // For a list of trx types, see chain_types.coffee

            case "transfer":

                color = "success";
                op[1].amount.amount = parseFloat(op[1].amount.amount);

                column = (
                    <p className="_yellow">
                        Receive {op[1].amount.amount / 100000} BTS
                    </p>
                );

                break;

            case "limit_order_create":
                color = "warning";
                let o = op[1];
                /*
                marketID = OPEN.ETH_USD
                if (!inverted) (default)
                    price = USD / OPEN.ETH
                    buy / sell OPEN.ETH
                    isBid = amount_to_sell.asset_symbol = USD
                    amount = to_receive
                if (inverted)
                    price =  OPEN.ETH / USD
                    buy / sell USD
                    isBid = amount_to_sell.asset_symbol = OPEN.ETH
                    amount =
                */
                column = (
                        <span>
                            <BindToChainState.Wrapper base={o.min_to_receive.asset_id} quote={o.amount_to_sell.asset_id}>
                                { ({base, quote}) => {
                                    const {marketID, first, second} = marketUtils.getMarketID(base, quote);
                                    const inverted = this.props.marketDirections.get(marketID);
                                    // const paySymbol = base.get("symbol");
                                    // const receiveSymbol = quote.get("symbol");

                                    const isBid = o.amount_to_sell.asset_id === (inverted ? first.get("id") : second.get("id"));

                                    let priceBase = (isBid) ? o.amount_to_sell : o.min_to_receive;
                                    let priceQuote = (isBid) ? o.min_to_receive : o.amount_to_sell;
                                    const amount = isBid ? op[1].min_to_receive : op[1].amount_to_sell;

                                    return <TranslateWithLinks
                                        string={isBid ? "operation.limit_order_buy" : "operation.limit_order_sell"}
                                        keys={[
                                            {type: "account", value: op[1].seller, arg: "account"},
                                            {type: "amount", value: amount, arg: "amount"},
                                            {type: "price", value: {base: priceBase, quote: priceQuote}, arg: "price"}
                                        ]}
                                    />;
                                }}
                            </BindToChainState.Wrapper>

                        </span>
                );
                break;
            case "fill_order":
                color = "success";
                o = op[1];

                /*
                marketID = OPEN.ETH_USD
                if (!inverted) (default)
                    price = USD / OPEN.ETH
                    buy / sell OPEN.ETH
                    isBid = amount_to_sell.asset_symbol = USD
                    amount = to_receive
                if (inverted)
                    price =  OPEN.ETH / USD
                    buy / sell USD
                    isBid = amount_to_sell.asset_symbol = OPEN.ETH
                    amount =

                    const {marketID, first, second} = marketUtils.getMarketID(base, quote);
                    const inverted = this.props.marketDirections.get(marketID);
                    // const paySymbol = base.get("symbol");
                    // const receiveSymbol = quote.get("symbol");

                    const isBid = o.amount_to_sell.asset_id === (inverted ? first.get("id") : second.get("id"));

                    let priceBase = (isBid) ? o.amount_to_sell : o.min_to_receive;
                    let priceQuote = (isBid) ? o.min_to_receive : o.amount_to_sell;
                    const amount = isBid ? op[1].min_to_receive : op[1].amount_to_sell;
                */

                column = (
                        <span>
                            <BindToChainState.Wrapper base={o.receives.asset_id} quote={o.pays.asset_id}>
                                { ({base, quote}) => {

                                    const {marketID, first, second} = marketUtils.getMarketID(base, quote);
                                    const inverted = this.props.marketDirections.get(marketID);
                                    const isBid = o.pays.asset_id === (inverted ? first.get("id") : second.get("id"));


                                    // const paySymbol = base.get("symbol");
                                    // const receiveSymbol = quote.get("symbol");
                                    let priceBase = (isBid) ? o.receives : o.pays;
                                    let priceQuote = (isBid) ? o.pays : o.receives;
                                    let amount = isBid ? o.receives : o.pays;
                                    let receivedAmount = o.fee.asset_id === amount.asset_id ? amount.amount - o.fee.amount : amount.amount;

                                    return <TranslateWithLinks
                                        string={`operation.fill_order_${isBid ? "buy" : "sell"}`}
                                        keys={[
                                            {type: "account", value: op[1].account_id, arg: "account"},
                                            {type: "amount", value: {amount: receivedAmount, asset_id: amount.asset_id}, arg: "amount", decimalOffset: op[1].receives.asset_id === "1.3.0" ? 3 : null},
                                            {type: "price", value: {base: priceBase, quote: priceQuote}, arg: "price"}
                                        ]}
                                    />;
                                }}
                        </BindToChainState.Wrapper>
                        </span>
                );
                break;

        }

        line = (
            <Row
                block={block}
                type={op[0]}
                color={color}
                fee={op[1].fee}
                hideOpLabel={this.props.hideOpLabel}
                hideDate={this.props.hideDate}
                info={column}
                hideFee={this.props.hideFee}
            >
            </Row>
        )



        return line;
    }
}


Operation = connect(Operation, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            marketDirections: SettingsStore.getState().marketDirections
        };
    }
});

export default Operation;
