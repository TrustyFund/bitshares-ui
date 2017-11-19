import React from "react";
import Trigger from "react-foundation-apps/src/trigger";
import BaseModal from "../Modal/BaseModal";
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import PasswordInput from "../Trusty/Forms/PasswordInput";
import notify from "actions/NotificationActions";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import AltContainer from "alt-container";
import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";
import AccountStore from "stores/AccountStore";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import utils from "common/utils";
import AccountSelector from "../Account/AccountSelector";
import Icon from 'components/Icon/Icon'
var logo = require("assets/logo-ico-blue.png");

class WalletUnlockModal extends React.Component {

    static contextTypes = {
        router: React.PropTypes.object
    }

    constructor(props) {
        super();
        this.state = this._getInitialState(props);
        this.onPasswordEnter = this.onPasswordEnter.bind(this);
        this._toggleLock = this._toggleLock.bind(this);
    }

    _getInitialState(props = this.props) {
        return {
            password_error: null,
            password_input_reset: Date.now(),
            account_name: props.passwordAccount,
            account: null
        };
    }

    reset() {
        this.setState(this._getInitialState());
    }

    componentWillReceiveProps(np) {
        if (np.passwordAccount && !this.state.account_name) {
            this.setState({account_name: np.passwordAccount});
        }
    }

    shouldComponentUpdate(np, ns) {
        return (
            !utils.are_equal_shallow(np, this.props) ||
            !utils.are_equal_shallow(ns, this.state)
        );
    }

    _toggleLock(e) {
        if(e)e.preventDefault();
        function unlock(){
            WalletUnlockActions.unlock().then(() => {
                AccountActions.tryToSetCurrentAccount();
            });
        }
        if (WalletDb.isLocked()) {
            unlock()
        } else {
            WalletUnlockActions.lock().then(()=>{
                unlock()
            })
        }
    }

    componentDidMount() {
        this._toggleLock()

        this._start()

    }

    _start() {
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

    componentDidUpdate() {
        //DEBUG console.log('... componentDidUpdate this.props.resolve', this.props.resolve)
        if(this.props.resolve) {
            if (WalletDb.isLocked())
                ZfApi.publish(this.props.modalId, "open")
            else
                this.props.resolve()
        }
    }

    onPasswordEnter(e) {
        const {passwordLogin} = this.props;
        e.preventDefault();
        let devPassword = __DEV__ ? localStorage.getItem("trusty_dev_fast_unlock_password") : null
        const password =  devPassword ? devPassword : this.refs.password_input.value() 
        const account = passwordLogin ? this.state.account && this.state.account.get("name") : null;
        this.setState({password_error: null});
        console.log(password)
        WalletDb.validatePassword(
            password || "",
            true, //unlock
            account
        );
        if (WalletDb.isLocked()) {
            this.setState({password_error: true});
            console.log("!!!!!!!!!!!wallet lock")
            return false;
        } else {
            if (!passwordLogin) {
                this.refs.password_input.clear();
            } else {
                this.refs.password_input.value = "";
                AccountActions.setPasswordAccount(account);
            }
            ZfApi.publish(this.props.modalId, "close");
            this.props.resolve();
            WalletUnlockActions.change()
            __DEV__ && localStorage.setItem("trusty_dev_fast_unlock_password", password)
            this.setState({password_input_reset: Date.now(), password_error: false});
            this.props.router.push(this.props.location.query.back || "/home")
        }
        return false;
    }

    _toggleLoginType() {
        SettingsActions.changeSetting({
            setting: "passwordLogin",
            value: !this.props.passwordLogin
        });
    }

    _onCreateWallet() {
        ZfApi.publish(this.props.modalId, "close");
        this.context.router.push("/create-account/wallet");
    }

    renderWalletLogin() {
        if (!WalletDb.getWallet()) {
            return (
                <div>
                    <Translate content="wallet.no_wallet" component="p" />
                    <div className="button-group">
                        <div className="button" onClick={this._onCreateWallet.bind(this)}><Translate content="wallet.create_wallet" /></div>
                    </div>

                    {/* <div onClick={this._toggleLoginType.bind(this)} className="button small outline float-right"><Translate content="wallet.switch_model_password" /></div> */}
                </div>
            );
        }
        return (
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
                    onEnter={this.onPasswordEnter}
                    key={this.state.password_input_reset}
                    wrongPassword={this.state.password_error}
                    noValidation
                />

                <div>
                    <p className="_tooltip_p" style={{textAlign:"center", marginTop: 0 }}>Before continuing, make sure your device is secure</p>
                    <div className="trusty_full_width_button_colored" onClick={this.onPasswordEnter}>
                        unlock account
                    </div>
                    <div className="_logo_owl" style={{ display: "none" }}><Icon name="trusty_owl_small_logo" /></div>
                    {/* <div onClick={this._toggleLoginType.bind(this)} className="button small outline float-right"><Translate content="wallet.switch_model_password" /></div> */}
                </div>
            </form>
        );
    }

    accountChanged(account_name) {
        if (!account_name) this.setState({account: null});
        this.setState({account_name, error: null});
    }

    onAccountChanged(account) {
        this.setState({account, error: null});
    }

    renderPasswordLogin() {
        let {account_name, from_error} = this.state;
        let tabIndex = 1;

        return (
            <form onSubmit={this.onPasswordEnter} noValidate style={{paddingTop: 20, marginRight: "3.5rem"}}>
                {/* Dummy input to trick Chrome into disabling auto-complete */}
                <input type="text" className="no-padding no-margin" style={{visibility: "hidden", height: 0}}/>

                <div className="content-block">
                    <AccountSelector label="account.name" ref="account_input"
                        accountName={account_name}
                        onChange={this.accountChanged.bind(this)}
                        onAccountChanged={this.onAccountChanged.bind(this)}
                        account={account_name}
                        size={60}
                        error={from_error}
                        tabIndex={tabIndex++}
                    />
                </div>

                <div className="content-block">
                    <div className="account-selector">
                        <div className="content-area">
                            <div className="header-area">
                                <label className="left-label"><Translate content="settings.password" /></label>
                            </div>
                            <div className="input-area" style={{marginLeft: "3.5rem"}}>
                                <input ref="password_input" name="password" id="password" type="password" tabIndex={tabIndex++} />
                            </div>
                            {this.state.password_error ? <div className="error-area">
                                <Translate content="wallet.pass_incorrect" />
                            </div> : null}
                        </div>
                    </div>
                </div>


                <div style={{marginLeft: "3.5rem"}}>
                    <div className="button-group">
                        <button tabIndex={tabIndex++} className="button" type="submit" onClick={this.onPasswordEnter}><Translate content="header.unlock_short" /></button>
                        <Trigger close={this.props.modalId}>
                            <div tabIndex={tabIndex++} className=" button"><Translate content="account.perm.cancel" /></div>
                        </Trigger>
                    </div>
                    {/* <div onClick={this._toggleLoginType.bind(this)} className="button small outline float-right"><Translate content="wallet.switch_model_wallet" /></div> */}
                </div>
            </form>
        );
    }

    render() {
        const {passwordLogin} = this.props;
        // DEBUG console.log('... U N L O C K',this.props)

        // Modal overlayClose must be false pending a fix that allows us to detect
        // this event and clear the password (via this.refs.password_input.clear())
        // https://github.com/akiran/react-foundation-apps/issues/34
        return (
            // U N L O C K
            <div className="trusty_unlock_account">
                {/*passwordLogin ? this.renderPasswordLogin() :*/ this.renderWalletLogin()}
            </div>
        );
    }

}

WalletUnlockModal.defaultProps = {
    modalId: "unlock_wallet_modal2"
};

class WalletUnlockModalContainer extends React.Component {
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
                    },
                    passwordAccount: () => {
                        return AccountStore.getState().passwordAccount || "";
                    }
                }}
            >
                <WalletUnlockModal {...this.props} />
            </AltContainer>
        );
    }
}
export default WalletUnlockModalContainer
