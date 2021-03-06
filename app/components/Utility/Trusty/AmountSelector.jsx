import React from "react";
import Translate from "react-translate-component";
import ChainTypes from "../ChainTypes";
import BindToChainState from "../BindToChainState";
import FormattedAsset from "../FormattedAsset";
import FloatingDropdown from "../FloatingDropdown";
import Immutable from "immutable";
import counterpart from "counterpart";
import TrustyInput from "components/Trusty/Forms/TrustyInput"
import CoinStore from "stores/CoinStore"

import {connect} from "alt-react"

class AssetSelector extends React.Component {

    static propTypes = {
        assets: ChainTypes.ChainAssetsList,
        value: React.PropTypes.string, // asset id
        onChange: React.PropTypes.func
    };

    render() {
        if(this.props.assets.length === 0) return null;

        return <FloatingDropdown
            entries={this.props.assets.map(a => a && a.get("symbol")).filter(a => !!a)}
            values={this.props.assets.reduce((map, a) => {if (a && a.get("symbol")) map[a.get("symbol")] = a; return map;}, {})}
            singleEntry={this.props.assets[0] ? <FormattedAsset asset={this.props.assets[0].get("id")} amount={0} hide_amount={true}/> : null}
            value={this.props.value}
            onChange={this.props.onChange}
        />;
    }
}

AssetSelector = BindToChainState(AssetSelector);

class AmountSelector extends React.Component {

    static propTypes = {
        label: React.PropTypes.string, // a translation key for the label
        asset: ChainTypes.ChainAsset.isRequired, // selected asset by default
        assets: React.PropTypes.array,
        amount: React.PropTypes.any,
        placeholder: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        tabIndex: React.PropTypes.number,
        error: React.PropTypes.string
    };

    static defaultProps = {
        disabled: false
    };

    componentDidMount() {
        this.onAssetChange(this.props.asset);

        this._onChange({target:{value:this.props.changedCoinValue}})
    }

    formatAmount(v) {
        /*// TODO: use asset's precision to format the number*/
        if (!v) v = "";
        if (typeof v === "number") v = v.toString();
        let value = v.trim().replace(/,/g, "");

        return value;
    }

    _onChange(event) {
        let amount = event.target.value;
        this.props.onChange({amount: amount, asset: this.props.asset});
    }

    onAssetChange(selected_asset) {
        this.props.onChange({amount: this.props.amount, asset: selected_asset});
    }

    render() {
        let assetSelector = <AssetSelector
                            ref={this.props.refCallback}
                            value={this.props.asset.get("symbol")}
                            assets={Immutable.List(this.props.assets)}
                            onChange={this.onAssetChange.bind(this)}
                        />
        let value = this.props.error ? counterpart.translate(this.props.error) : this.formatAmount(this.props.amount);
        let input = <input
                        disabled={this.props.disabled}
                        type="text"
                        value={this.props.trustyLabel=="exchange fee" ? value || "" : this.props.changedCoinValue}
                        placeholder={this.props.placeholder}
                        onChange={this._onChange.bind(this) }
                        tabIndex={this.props.tabIndex}
                    />

        return (
            <div className="amount-selector" style={this.props.style}>
                {/*<label className="right-label">{this.props.display_balance}</label>
                                <Translate className="left-label" component="label" content={this.props.label}/>*/}
                <div className="inline-label input-wrapper">
                    {<TrustyInput className="_trusty_hide_input" isOpen={true} input={input} label={this.props.trustyLabel} right={this.props.trustySelects ? this.props.trustySelects : assetSelector}/>}
                    {/*input*/}
                    <div className="form-label select floating-dropdown">
                        {/*assetSelector*/}
                    </div>
                </div>
            </div>
        )
    }
}


let storeWrapper = BindToChainState(AmountSelector);

export default connect(storeWrapper, {
    listenTo() {
        return [CoinStore];
    },
    getProps() {
        return {
            changedCoinValue: CoinStore.getState().coinValue,
        };
    }
});

