import React from "react";
import {FormattedNumber} from "react-intl";
import utils from "common/utils";
import assetUtils from "common/asset_utils";
import {PropTypes} from "react";
import ChainTypes from "../ChainTypes";
import BindToChainState from "../BindToChainState";
import Popover from "react-popover";
import HelpContent from "../HelpContent";
import AssetName from "../AssetName";
import {ChainStore} from "bitsharesjs/es";

/**
 *  Given an amount and an asset, render it with proper precision
 *
 *  Expected Properties:
 *     asset:  asset id, which will be fetched from the
 *     amount: the ammount of asset
 *
 */

class FormattedAsset extends React.Component {

    static propTypes = {
        amount: PropTypes.any.isRequired,
        asset: ChainTypes.ChainAsset.isRequired,
        exact_amount: PropTypes.bool,
        decimalOffset: PropTypes.number,
        color: PropTypes.string,
        hide_asset: PropTypes.bool,
        hide_amount: PropTypes.bool,
        asPercentage: PropTypes.bool,
        assetInfo: PropTypes.node,
        dollarShow: PropTypes.bool,
        trustyPercentage: PropTypes.bool,
        trfndPrice:  PropTypes.number
    };

    static defaultProps = {
        amount: 0,
        decimalOffset: 0,
        hide_asset: false,
        hide_amount: false,
        asPercentage: false,
        assetInfo: null,
        replace: true,
        dollarShow: false,
        trustyPercentage: false,
        trfndPrice: 0
    };

    constructor(props) {
        super(props);
        this.state = {isPopoverOpen: false};
        this.togglePopover = this.togglePopover.bind(this);
        this.closePopover = this.closePopover.bind(this);
    }

    togglePopover(e) {
        e.preventDefault();
        this.setState({isPopoverOpen: !this.state.isPopoverOpen});
    }

    closePopover() {
        this.setState({isPopoverOpen: false});
    }

    render() {
        let {amount, decimalOffset, color, asset, hide_asset, hide_amount, asPercentage, trustyPercentage} = this.props;

        if( asset && asset.toJS ) asset = asset.toJS();

        let colorClass = color ? "facolor-" + color : "";

        let precision = utils.get_asset_precision(asset.precision);

        let decimals = Math.max(0, asset.precision - decimalOffset);

        if (hide_amount) {
            colorClass += " no-amount";
        }


        if(trustyPercentage) {
            let totalAmount = +localStorage.getItem("_trusty_total_value")
            let percent = amount.toFixed(2) / totalAmount.toFixed(2) * 100
            return (
                <span className={colorClass}>
                    {percent.toFixed(0)}%
                </span>
            )
        } 


        if (asPercentage) {
            let supply = parseInt(asset.dynamic.current_supply, 10);
            let percent = utils.format_number((amount / supply) * 100, 4);
            return (
                <span className={colorClass}>
                    {percent}%
                </span>
            )

        }

        let issuer = ChainStore.getObject(asset.issuer, false, false);
        let issuerName = issuer ? issuer.get('name') : '';

        let description = assetUtils.parseDescription(asset.options.description);

        const currency_popover_body = !hide_asset && this.props.assetInfo && <div>
            <HelpContent
                path={"assets/Asset"}
                section="summary"
                symbol={asset.symbol}
                description={description.short_name ? description.short_name : description.main}
                issuer={issuerName}
            />
            {this.props.assetInfo}
        </div>;


        let formattedNumber = this.props.exact_amount ? amount : amount / precision
        if(this.props.trfndPrice) formattedNumber = formattedNumber * this.props.trfndPrice

        return (
                <span className={colorClass}>
                { this.props.dollarShow ? <span style={{paddingRight: "10px"}}>$</span> : null }
                {!hide_amount ?
                    <FormattedNumber
                        value={formattedNumber}
                        minimumFractionDigits={0}
                        maximumFractionDigits={decimals}
                    />
                : null}
                {!hide_asset && (this.props.assetInfo ? (
                    <span>&nbsp;
                    <Popover
                        isOpen={this.state.isPopoverOpen}
                        onOuterAction={this.closePopover}
                        body={currency_popover_body}
                    >
                        <span className="currency click-for-help" onClick={this.togglePopover}><AssetName name={asset.symbol} /></span>
                    </Popover></span>) :

                     (!this.props.dollarShow ? <span style={{display: "none"}} className="currency" onClick={this.togglePopover}> 
                        <AssetName noTip={this.props.noTip} noPrefix={this.props.noPrefix} name={asset.symbol} replace={this.props.replace} />
                    </span> : null ) 

                )}
                </span>
        );
    }
}
FormattedAsset = BindToChainState(FormattedAsset);

export default FormattedAsset;
