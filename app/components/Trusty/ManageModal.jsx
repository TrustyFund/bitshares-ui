import React from "react";
import BaseModal from "components/Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import UnlockAccount from "components/Trusty/UnlockAccount";
import WalletDb from "stores/WalletDb";
import AccountActions from "actions/AccountActions";
import WalletUnlockActions from "actions/WalletUnlockActions";
import PasswordInput from "../Trusty/Forms/PasswordInput";
import AltContainer from "alt-container";
import AccountStore from "stores/AccountStore";
import WalletUnlockStore from "stores/WalletUnlockStore";
import {Apis} from "bitsharesjs-ws";
import classnames from 'classnames'

import {dispatcher} from "components/Trusty/utils";



class ManageModal extends React.Component {


	constructor(){
		super()
		this.onPasswordEnter = this.onPasswordEnter.bind(this)
		this.state = {
            orders: [],
            password_error: null,
            password_input_reset: Date.now(),
        }


        dispatcher.register(({orders,type,transactionProcess})=>{
            if(type=="trusty_manage_modal"){
                ZfApi.publish("trusty_manage_modal", "open");
                this.setState({orders})
                this.transactionProcess = transactionProcess;
            }
        })
        
	}


	startComponent() {
        if (!this.props.passwordLogin) {
            if (this.refs.password_input) {
                this.refs.password_input.clear();
                this.refs.password_input.focus();
            }
            if(WalletDb.getWallet() && Apis.instance().chain_id !== WalletDb.getWallet().chain_id) {
                notify.error("This wallet was intended for a different block-chain; expecting " +
                    WalletDb.getWallet().chain_id.substring(0,4).toUpperCase() + ", but got " +
                    Apis.instance().chain_id.substring(0,4).toUpperCase());
                ZfApi.publish(this.props.modalId, "close");
                return;
            }
        }

        if (this.props.passwordLogin) {
            if (this.state.account_name) {
                this.refs.password_input.focus();
            } else if (this.refs.account_input && this.refs.account_input.refs.bound_component) {
                this.refs.account_input.refs.bound_component.refs.user_input.focus();
            }
        }
    }

	onPasswordEnter(e) {

		const {passwordLogin} = this.props;

        e.preventDefault();

        const password = this.refs.password_input.value() 

        const account = passwordLogin ? this.state.account && this.state.account.get("name") : null;

        this.setState({password_error: null});

        WalletDb.validatePassword(
            password || "",
            true, //unlock
            account
        );

        if (WalletDb.isLocked()) {
            this.setState({password_error: true});
            console.log("!wallet lock")
            return false;
        } else {
            if (!passwordLogin) {
                this.refs.password_input.clear();
            } else {
                this.refs.password_input.value = "";
                AccountActions.setPasswordAccount(account);
            }
            
            typeof this.props.resolve == "function" && this.props.resolve();
            WalletUnlockActions.change()
            this.setState({password_input_reset: Date.now(), password_error: false});
        }
        return false;
	}

	componentDidMount(){
		this.startComponent()
	}

	render(){

        let orders = <div className="trusty_profile_incoming_depositis"> { this.state.orders.map((o,i)=><p key={i} className="_yellow">{o.type + " " + o.amount_for_sale.amount}</p>) } </div>
	    return (

	    <BaseModal ref={"model"} id={this.props.modalId} ref="modal" overlay={true} overlayClose={false}>

	    	<form onSubmit={this.onPasswordEnter} noValidate>

                <div className="trusty_input_container">
                    <div className="w_input">
                        <div className="t_input active_input" style={{border:"none"}}>
                            <label className="trusty_place_holder">Account Name</label>
                            <div className="trusty_fake_input_show">{localStorage.getItem("_trusty_username")}</div>
                        </div>
                    </div>
                </div>

                <PasswordInput
                    ref="password_input"
                    onKeyUp={this.onPasswordEnter}
                    onEnter={this.onPasswordEnter}
                    key={this.state.password_input_reset}
                    wrongPassword={this.state.password_error}
                    noValidation
                />


            </form>

            { orders }

            <div className="trusty_inline_buttons">
               <button disabled={this.props.locked} onClick={this.transactionProcess} style={{opacity: this.props.locked ? "0.4" : "1"}}>Approve</button>
               <button onClick={()=>{ZfApi.publish("trusty_manage_modal","close")}}>Deny</button>
            </div>

        </BaseModal>

        )

	}

}

ManageModal.defaultProps = {
    modalId: "trusty_manage_modal"
};


class ManageModalContainer extends React.Component {
    render() {
        return (
            <AltContainer
                stores={[WalletUnlockStore, AccountStore]}
                inject={{
                    resolve: () => {
                        return WalletUnlockStore.getState().resolve;
                    },
                    reject: () => {
                        return WalletUnlockStore.getState().reject;
                    },
                    locked: () => {
                        return WalletUnlockStore.getState().locked;
                    },
                    passwordLogin: () => {
                        return WalletUnlockStore.getState().passwordLogin;
                    }
                }}
            >
                <ManageModal {...this.props} />
            </AltContainer>
        );
    }
}
export default ManageModalContainer
