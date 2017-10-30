import React from "react";
import Trigger from "react-foundation-apps/src/trigger";
import Translate from "react-translate-component";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import utils from "common/utils";
import BalanceComponent from "components/Utility/BalanceComponent";
import counterpart from "counterpart";
import AmountSelector from "components/Utility/Trusty/AmountSelector";
import AccountActions from "actions/AccountActions";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import { validateAddress, WithdrawAddresses } from "common/blockTradesMethods";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import Modal from "react-foundation-apps/src/modal";
import { checkFeeStatusAsync, checkBalance } from "common/trxHelper";
import {Asset} from "common/MarketClasses";
import { debounce } from "lodash";
import TrustyInput from "components/Trusty/Forms/TrustyInput";


class ButtonWithdraw extends React.Component {
    static propTypes = {
        balance: ChainTypes.ChainObject,
        url: React.PropTypes.string.isRequired
    };

    getWithdrawModalId() {
        return "withdraw_asset_" + this.props.gateway + "_bridge";
    }

    onWithdraw() {
        ZfApi.publish(this.getWithdrawModalId(), "open");
    }

    componentDidMount(){
        ZfApi.publish(this.getWithdrawModalId(), "open");
    }

    render() {

        let withdraw_modal_id = this.getWithdrawModalId();

        let button_class = "button disabled";

        if (Object.keys(this.props.account.get('balances').toJS()).includes(this.props.asset.get('id')) ) {
            if (!(this.props.amount_to_withdraw.indexOf(' ') >= 0) && !isNaN(this.props.amount_to_withdraw) && (this.props.amount_to_withdraw > 0) && (this.props.amount_to_withdraw <= this.props.balance.toJS().balance/utils.get_asset_precision(this.props.asset.get("precision")))) {

                button_class = "button";

            }
        }

        return (<span>
                    <span>
                        <button className={button_class} onClick={this.onWithdraw.bind(this)}><Translate content="" /><Translate content="gateway.withdraw_now" /> </button>
                    </span>
                    <BaseModal id={withdraw_modal_id} overlay={true}>
                        <br/>
                        <div className="grid-block vertical">
                            <WithdrawModalBlocktrades
								key={`${this.props.key}`}
                                account={this.props.account.get('name')}
                                issuer={this.props.issuer}
                                asset={this.props.asset.get('id')}
                                output_coin_name={this.props.output_coin_name}
                                output_coin_symbol={this.props.output_coin_symbol}
                                output_coin_type={this.props.output_coin_type}
								output_supports_memos={this.props.output_supports_memos}
                                amount_to_withdraw={this.props.amount_to_withdraw}
                                modal_id={withdraw_modal_id}
                                url={this.props.url}
                                output_wallet_type={this.props.output_wallet_type}
                                balance={this.props.account.get("balances").toJS()[this.props.asset.get('id')]} />
                        </div>
                    </BaseModal>
                </span>);
    }
}

ButtonWithdraw = BindToChainState(ButtonWithdraw);

class ButtonWithdrawContainer extends React.Component {
    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
        asset: ChainTypes.ChainAsset.isRequired,
        output_coin_type: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired
    };

    render() {

        let withdraw_button =
            <ButtonWithdraw key={this.props.key}
                            account={this.props.account}
                            issuer={this.props.issuer}
                            asset={this.props.asset}
                            output_coin_name={this.props.output_coin_name}
                            output_coin_symbol={this.props.output_coin_symbol}
                            output_coin_type={this.props.output_coin_type}
							output_supports_memos={this.props.output_supports_memos}
                            amount_to_withdraw={this.props.amount_to_withdraw}
                            url={this.props.url}
                            gateway={this.props.gateway}
                            output_wallet_type={this.props.output_wallet_type}
                            balance={this.props.account.get("balances").toJS()[this.props.asset.get('id')]}/>;

        return (<span>
                    {withdraw_button}
                </span>);
    }
}