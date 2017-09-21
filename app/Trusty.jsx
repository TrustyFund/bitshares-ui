import {ChainStore} from "bitsharesjs/es";
import {Apis} from "bitsharesjs-ws";
import React from "react";
import IntlStore from "stores/IntlStore";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import IntlActions from "actions/IntlActions";
import NotificationStore from "stores/NotificationStore";
import intlData from "./components/Utility/intlData";
import alt from "alt-instance";
import { connect, supplyFluxContext } from "alt-react";
import {IntlProvider} from "react-intl";
import SyncError from "./components/SyncError";
import LoadingIndicator from "./components/LoadingIndicator";
import Header from "components/Trusty/Layout/Header";
import MobileMenu from "components/Layout/MobileMenu";
import Chat from "./components/Chat/ChatWrapper";
import ReactTooltip from "react-tooltip";
import NotificationSystem from "react-notification-system";
import TransactionConfirm from "./components/Blockchain/TransactionConfirm";
import WalletUnlockModal from "./components/Trusty/Wallet/WalletUnlockModal";
import CreateAccount from "./components/Trusty/Account/CreateAccount";
import Footer from "./components/Layout/Footer";


import {dispatcher} from 'components/Trusty/utils'

class Trusty extends React.Component {

    constructor() {
        super();

        // Check for mobile device to disable chat
        const user_agent = navigator.userAgent.toLowerCase();
        let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        let syncFail = ChainStore.subError && (ChainStore.subError.message === "ChainStore sync error, please check your system clock") ? true : false;
        this.state = {
            loading: true,
            synced: ChainStore.subscribed,
            syncFail,
            theme: SettingsStore.getState().settings.get("themes"),
            disableChat: SettingsStore.getState().settings.get("disableChat", true),
            showChat: SettingsStore.getState().viewSettings.get("showChat", false),
            dockedChat: SettingsStore.getState().viewSettings.get("dockedChat", false),
            isMobile: !!(/android|ipad|ios|iphone|windows phone/i.test(user_agent) || isSafari)
        };

        this._rebuildTooltips = this._rebuildTooltips.bind(this);
    }

    componentWillUnmount() {
        NotificationStore.unlisten(this._onNotificationChange);
        SettingsStore.unlisten(this._onSettingsChange);
    }

    componentDidMount() {
        
        try {
            NotificationStore.listen(this._onNotificationChange.bind(this));
            SettingsStore.listen(this._onSettingsChange.bind(this));

            ChainStore.init().then(() => {
                this.setState({synced: true});
                Promise.all([
                    AccountStore.loadDbData(Apis.instance().chainId)
                ]).then(() => {
                    AccountStore.tryToSetCurrentAccount();
                    this.setState({loading: false});
                }).catch(error => {
                    console.log("[Trusty.jsx] ----- ERROR ----->", error);
                    this.setState({loading: false});
                });
            }).then(()=>{
                let i = localStorage.getItem("_pswd_unlock")
                i && dispatcher.dispatch({type:"background-unlock", data: i})
            }).catch(error => {
                console.log("[Trusty.jsx] ----- ChainStore.init error ----->", error);
                let syncFail = ChainStore.subError && (ChainStore.subError.message === "ChainStore sync error, please check your system clock") ? true : false;

                this.setState({loading: false, synced: false, syncFail});
            });
        } catch(e) {
            console.error("e:", e);
        }

        this.props.router.listen(this._rebuildTooltips);

        this._rebuildTooltips();

        dispatcher.register( dispatch => {
          if ( dispatch.type === 'show-loader' ) {
            this.setState({ loading: true })
          }
        })
    }

    _rebuildTooltips() {
        ReactTooltip.hide();

        setTimeout(() => {
            if (this.refs.tooltip) {
                this.refs.tooltip.globalRebuild();
            }
        }, 1500);
    }

    /** Usage: NotificationActions.[success,error,warning,info] */
    _onNotificationChange() {
        let notification = NotificationStore.getState().notification;
        if (notification.autoDismiss === void 0) {
            notification.autoDismiss = 10;
        }
        if (this.refs.notificationSystem) this.refs.notificationSystem.addNotification(notification);
    }

    _onSettingsChange() {
        let {settings, viewSettings} = SettingsStore.getState();
        if (settings.get("themes") !== this.state.theme) {
            this.setState({
                theme: settings.get("themes")
            });
        }
        if (settings.get("disableChat") !== this.state.disableChat) {
            this.setState({
                disableChat: settings.get("disableChat")
            });
        }

        if (viewSettings.get("showChat") !== this.state.showChat) {
            this.setState({
                showChat: viewSettings.get("showChat")
            });
        }

        if (viewSettings.get("dockedChat") !== this.state.dockedChat) {
            this.setState({
                dockedChat: viewSettings.get("dockedChat")
            });
        }

    }

    // /** Non-static, used by passing notificationSystem via react Component refs */
    // _addNotification(params) {
    //     console.log("add notification:", this.refs, params);
    //     this.refs.notificationSystem.addNotification(params);
    // }
    componentWillReceiveProps(nextProps, nextState){
        if(this.state.loading && AccountStore.getMyAccounts().length > 0){
            console.log(this.state)
            this.setState({loading: false})
        }
    }
    render() {
        let {disableChat, isMobile, showChat, dockedChat, theme} = this.state;
        let content = null;
        let pathname = this.props.location.pathname;

        let showFooter = pathname.indexOf("market") === -1;
        let isAuthPage = pathname.indexOf("brainkey") !== -1;
        let myAccounts = AccountStore.getMyAccounts();
        let myAccountCount = myAccounts.length;
        let isRestoreProcess = pathname.indexOf("dashboard") !== -1 && myAccountCount == 0 

        if (this.state.syncFail) {
            content = (
                <SyncError />
            );
        } else if (this.state.loading) {
            content = <div className="grid-frame vertical"><LoadingIndicator /></div>;
        } else if (this.props.location.pathname === "/init-error") {
            content = <div className="grid-frame vertical">{this.props.children}</div>;
        } else if (this.props.location.pathname === '/landing') {
            content = this.props.children
        } else {
            let inside = (myAccountCount == 0 && !isAuthPage) ? (<CreateAccount/>) : this.props.children;
            content = (
                <div className="grid-frame vertical">
                    <Header />
                    <MobileMenu isUnlocked={this.state.isUnlocked} id="mobile-menu"/>
                    <div className="grid-block">
                        <div className="grid-block vertical">
                            {inside}                           
                        </div>
                    </div>
                    <ReactTooltip ref="tooltip" place="top" type={theme === "lightTheme" ? "dark" : "light"} effect="solid"/>
                </div>
            );
        }

        return (
            <div style={{backgroundColor: !this.state.theme ? "#2a2a2a" : null}} className={this.state.theme}>
                <div id="content-wrapper">
                    {content}
                    <NotificationSystem
                        ref="notificationSystem"
                        allowHTML={true}
                        style={{
                            Containers: {
                                DefaultStyle: {
                                    width: "425px"
                                }
                            }
                        }}
                    />
                    <TransactionConfirm/>
                    <WalletUnlockModal/>
                </div>
            </div>
        );

    }
}

class RootIntl extends React.Component {
    componentWillMount() {
        IntlActions.switchLocale(this.props.locale);
    }

    render() {
        return (
            <IntlProvider
                locale={this.props.locale.replace(/cn/, "zh")}
                formats={intlData.formats}
                initialNow={Date.now()}
            >
                <Trusty {...this.props}/>
            </IntlProvider>
        );
    }
}

RootIntl = connect(RootIntl, {
    listenTo() {
        return [AccountStore,IntlStore];
    },
    getProps() {
        return {
            locale: IntlStore.getState().currentLocale
        };
    }
});

class Root extends React.Component {
    static childContextTypes = {
        router: React.PropTypes.object,
        location: React.PropTypes.object
    }

    componentDidMount(){
        //Detect OS for platform specific fixes
        if(navigator.platform.indexOf('Win') > -1){
            var main = document.getElementById('content');
            var windowsClass = 'windows';
            if(main.className.indexOf('windows') === -1){
                main.className = main.className + (main.className.length ? ' ' : '') + windowsClass;
            }
        }
    }

    getChildContext() {
        return {
            router: this.props.router,
            location: this.props.location
        };
    }

    render() {
        return <RootIntl {...this.props} />;
    }
}

export default supplyFluxContext(alt)(Root);
