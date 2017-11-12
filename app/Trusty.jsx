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
import ReactTooltip from "react-tooltip";
import NotificationSystem from "react-notification-system";
import TransactionConfirm from "./components/Blockchain/TransactionConfirm";
import CreateAccount from "./components/Trusty/Account/CreateAccount";
import Footer from "./components/Layout/Footer";
import Landing from "components/Trusty/Landing/Landing";
import {Link} from 'react-router';
import Icon from "components/Icon/Icon"
import PortfolioStore from "stores/PortfolioStore";

import WalletDb from "stores/WalletDb";
import WalletUnlockStore from "stores/WalletUnlockStore";

import Immutable from "immutable";
import TotalBalanceValue from "components/Utility/Trusty/TotalBalanceValue";

import PortfolioActions from "actions/PortfolioActions"



/* pixel perfect helper */
// import 'components/Trusty/pixel-glass'
// import 'assets/stylesheets/trusty/components/pixel-glass.scss'

import {dispatcher} from 'components/Trusty/utils'
const user_agent = navigator.userAgent.toLowerCase();
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
window.isMobile = !!(/android|ipad|ios|iphone|windows phone/i.test(user_agent) || isSafari)
class Trusty extends React.Component {

    constructor() {
        super();

        // Check for mobile device to disable chat
        const user_agent = navigator.userAgent.toLowerCase();
        let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        let syncFail = ChainStore.subError && (ChainStore.subError.message === "ChainStore sync error, please check your system clock") ? true : false;
        this.state = {
            firstEnteredApp: false,
            loading: this._syncStatus(),
            synced: this._syncStatus(),
            syncFail,
            theme: SettingsStore.getState().settings.get("themes"),
            isMobile: !!(/android|ipad|ios|iphone|windows phone/i.test(user_agent) || isSafari)
        };
        this._chainStoreSub = this._chainStoreSub.bind(this);
        this._syncStatus = this._syncStatus.bind(this);
        this._rebuildTooltips = this._rebuildTooltips.bind(this);
    }

    _syncStatus(setState = false) {
        let synced = true;
        let dynGlobalObject = ChainStore.getObject("2.1.0");
        if (dynGlobalObject) {
            let block_time = dynGlobalObject.get("time");
            if (!/Z$/.test(block_time)) {
                block_time += "Z";
            }

            let bt = (new Date(block_time).getTime() + ChainStore.getEstimatedChainTimeOffset()) / 1000;
            let now = new Date().getTime() / 1000;
            synced = Math.abs(now - bt) < 5;
        }
        if (setState && synced !== this.state.synced) {
            this.setState({synced});
            this.setState({loading: !synced});
        }
        return synced;
    }

    componentWillUnmount() {
        NotificationStore.unlisten(this._onNotificationChange);
        SettingsStore.unlisten(this._onSettingsChange);
        ChainStore.unsubscribe(this._chainStoreSub);
    }

    componentDidMount() {
        this._setListeners();
        this.syncCheckInterval = setInterval(this._syncStatus, 5000);
    }

    shouldComponentUpdate(nextProps, nextState) {
        dispatcher.register( dispatch => {
          if ( dispatch.type === 'show-loader' ) {
            this.setState({ loading: true })
          }
        })
        return true

    }

    _setListeners() {
        try {
            NotificationStore.listen(this._onNotificationChange.bind(this));
            SettingsStore.listen(this._onSettingsChange);
            ChainStore.subscribe(this._chainStoreSub);
            AccountStore.tryToSetCurrentAccount();
        } catch(e) {
            console.error("e:", e);
        }
    }

    _rebuildTooltips() {
        ReactTooltip.hide();

        setTimeout(() => {
            if (this.refs.tooltip) {
                this.refs.tooltip.globalRebuild();
            }
        }, 1500);
    }

    _chainStoreSub() {
        let synced = this._syncStatus();
        if (synced !== this.state.synced) {
            this.setState({synced});
        }
        if (ChainStore.subscribed !== this.state.synced || ChainStore.subError) {
            let syncFail = ChainStore.subError && (ChainStore.subError.message === "ChainStore sync error, please check your system clock") ? true : false;
            this.setState({
                syncFail
            });
        }
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

    }

    // /** Non-static, used by passing notificationSystem via react Component refs */
    // _addNotification(params) {
    //     console.log("add notification:", this.refs, params);
    //     this.refs.notificationSystem.addNotification(params);
    // }
    componentWillReceiveProps(nextProps, nextState){

        //update portfolio
        let { account } = this._getBalancesData()

        PortfolioActions.concatPortfolio.defer(account)

        //console.log(PortfolioStore.getState().data)
      
        // account && PortfolioStore.concatPortfolio(account).then(portfolio=>{
        //     console.log(portfolio)
        // })

        let check = path => ~this.props.location.pathname.indexOf(path)
        if(!check("unlock") && this.props.walletLocked && AccountStore.getMyAccounts().length) {
            //this.props.router.push("/unlock")
           //return 
        } 

        // if(AccountStore.getMyAccounts().length && !this.state.firstEnteredApp) {
        //     this.setState({firstEnteredApp: true})
        //     this.props.router.push(`/home`)
        //     return
        // }

        if(this.state.loading && AccountStore.getMyAccounts().length > 0){
            this.setState({loading: false})
        }

        if(AccountStore.getMyAccounts().length) {
            localStorage.setItem("_trusty_username",AccountStore.getMyAccounts()[0])  
        }
 
    }

    _navigateBackAction(){
       let path = AccountStore.getMyAccounts().length ? "/home": "/"
       this.props.router.push(path)
    }

    _getBalancesData(){
        let account = ChainStore.getAccount(localStorage.getItem("_trusty_username"))
        return {
            account,
            accountBalances: account ? PortfolioStore.getBalances(account) : Immutable.List(),
            accountOrders: account ? account.get("orders", null) : Immutable.List(),
            accountDebt: {},
            accountCollateral: 0
        }
    }
    render() {

        let { accountBalances, accountOrders, accountDebt, accountCollateral } = this._getBalancesData()
        
        let {theme} = this.state;
        let content = null;
        let pathname = this.props.location.pathname;
        let showFooter = pathname.indexOf("market") === -1;
        let isAuthPage = pathname.indexOf("brainkey") !== -1;
        let isLanding = pathname.indexOf("landing") !== -1;
        let myAccounts = AccountStore.getMyAccounts();
        let myAccountCount = myAccounts.length;
        let isRestoreProcess = pathname.indexOf("dashboard") !== -1 && myAccountCount == 0 


        function getHeaderTitle(){
            let  headerTitles = {
                "signup": "signup",
                "login": "create-wallet-brainkey", 
                "deposit details": "deposit",
                "withdraw": "withdraw",
                "manage fund": "manage",
                "terms of use": "terms-of-use",
                "unlock account": "unlock"
            }
            let title = ""
            for ( let k in headerTitles) {
                if( pathname.indexOf(headerTitles[k]) != -1 ){title = k} 
            }
            return title
        }  
     
        let isProfilePage = AccountStore.getMyAccounts().length && this.props.location.pathname.indexOf("home") != -1
        let header = (
            <div className="trusty_header">
                { ~this.props.location.pathname.indexOf("unlock") ? null : isProfilePage 
                    ? <div  className="trusty_header_logo" onClick={()=> { this.props.router.push(`/landing`)}} dangerouslySetInnerHTML={{__html: require('components/Trusty/Landing/vendor/trusty_fund_logo.svg')}} />
                    : (<span className="_back" onClick={this._navigateBackAction.bind(this)}>
                        <Icon name="trusty_arrow_back"/>
                      </span>)
                }
                { isProfilePage ? <Link to="/backup"> <Icon name="trusty_options"/> </Link> : null }
                <span className="header_title">{getHeaderTitle()}</span>
            </div>
        )

        function grid(inside){
            return (
                <div className="grid-frame vertical">
                    {/*<Header />*/}
                    { header }
                    <div className="trusty_header_fake">{header}</div>
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
        grid = grid.bind(this)

        function authFreeRoutes(){
            return [
            '/test-home',
            '/signup',
            '/create-wallet-brainkey',
            "/terms-of-use",
            "/unlock"
            ].some(i=>i==this.props.location.pathname)
        }
        authFreeRoutes = authFreeRoutes.bind(this)

        if(!window.isMobile) return <LoadingIndicator type={"trusty-owl"}/>


        if (this.state.syncFail) {
            content = (
                <SyncError />
            );
        } else if (this.props.location.pathname === "/init-error") {
            content = <div className="grid-frame vertical">{this.props.children}</div>;
        } else if (myAccountCount == 0 && authFreeRoutes()) {
            content = grid(this.props.children)
        } else if (myAccountCount == 0 && !authFreeRoutes()) {
            content = <Landing type={"trusty-owl"} />
        } else {
            content = isLanding ? this.props.children : grid(this.props.children)
        }

        return (
            <div style={{backgroundColor: !this.state.theme ? "#2a2a2a" : null}} className={this.state.theme}>
                
                {/*<img src={ require("assets/stylesheets/trusty/texture_mob_bgr.png")} className="trusty_fixed_background _mob"/>*/}
                
                <div className="trusty_fixed_background_div _mob"/>

                <div id="content-wrapper" className="trusty-wrapper">
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
                    {<div style={{display: "none"}}><TotalBalanceValue
                        balances={accountBalances}
                        oreders={accountOrders}
                        debt={accountDebt}
                        toAsset={"1.3.0"}
                        collateral={accountCollateral}
                    /></div>}
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
        return [AccountStore,IntlStore,WalletUnlockStore];
    },
    getProps() {
        return {
            locale: IntlStore.getState().currentLocale,
            walletLocked: WalletUnlockStore.getState().locked,
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
