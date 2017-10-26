import React from "react";
import FormattedAsset from "./FormattedAsset";
import ChainTypes from "../ChainTypes";
import BindToChainState from "../BindToChainState";


/**
 *  Given a balance_object, displays it in a pretty way
 *
 *  Expects one property, 'balance' which should be a balance_object id
 */

class BalanceComponent extends React.Component {

    static propTypes = {
        balance: ChainTypes.ChainObject.isRequired,
        assetInfo: React.PropTypes.node,
        hide_asset: React.PropTypes.bool
    };

    static defaultProps = {
        hide_asset: false
    };

    getPrice(){
        let { combinedBids, highestBid } = this.props.marketData
        let amount = Number(this.props.balance.get("balance"));
        return combinedBids.map(order=>order.getPrice())[0] 
    }

    render() {
        let amount = Number(this.props.balance.get("balance"));
        let type = this.props.balance.get("asset_type");
        return (
            <span>
                <FormattedAsset
                    trfndPrice={this.getPrice()}
                    amount={amount}
                    asset={type}
                    asPercentage={this.props.asPercentage}
                    assetInfo={this.props.assetInfo}
                    replace={this.props.replace}
                    hide_asset={this.props.hide_asset}
                />
            </span>
        );
    }
}

export default BindToChainState(BalanceComponent, {keep_updating: true});
