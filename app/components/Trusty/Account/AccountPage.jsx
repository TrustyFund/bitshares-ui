import {Link} from 'react-router';
import React from "react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import WalletUnlockStore from "stores/WalletUnlockStore";
import GatewayStore from "stores/GatewayStore";
import AccountLeftPanel from "components/Account/AccountLeftPanel";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import { connect } from "alt-react";
import accountUtils from "common/account_utils";
import AccountOverview from "./AccountOverview";
import MarketsStore from "stores/MarketsStore";

class AccountPage extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        account: "props.params.account_name"
    };

    componentDidMount() {
        if (this.props.account && AccountStore.isMyAccount(this.props.account)) {
            AccountActions.setCurrentAccount.defer(this.props.account.get("name"));
        }

        // Fetch possible fee assets here to avoid async issues later (will resolve assets)
        accountUtils.getPossibleFees(this.props.account, "transfer");
    }

    render() {
        let {myAccounts, linkedAccounts, account_name, searchAccounts, settings, wallet_locked, account, hiddenAssets} = this.props;

        let isMyAccount = AccountStore.isMyAccount(account);

        return (
            <div className="grid-block page-layout">
                <div className="show-for-medium grid-block shrink left-column no-padding" style={{minWidth: 250}}>
                    <AccountLeftPanel
                        account={account}
                        isMyAccount={isMyAccount}
                        linkedAccounts={linkedAccounts}
                        myAccounts={myAccounts}
                        viewSettings={this.props.viewSettings}
                    />
                </div>
                <div className="grid-block main-content" style={{paddingTop: "0px"}}>
                    <div className="grid-container">
                        <div className="trusty_inline_buttons">
                            <Link to="/deposit" style={{marginRight: "7px"}}><button>DEPOSIT</button></Link>
                            <Link to="/withdraw" style={{marginLeft: "7px"}}><button>WITHDRAW</button></Link>
                        </div>
                    {this.props.children}
                    {React.cloneElement(
                        React.Children.only(this.props.children),
                        {
                            account_name,
                            linkedAccounts,
                            searchAccounts,
                            settings,
                            wallet_locked,
                            account,
                            isMyAccount,
                            hiddenAssets,
                            contained: true,
                            balances: account.get("balances", null),
                            orders: account.get("orders", null),
                            backedCoins: this.props.backedCoins,
                            bridgeCoins: this.props.bridgeCoins
                        }
                    )}
                    </div>
                </div>
            </div>
        );
    }
}
AccountPage = BindToChainState(AccountPage, {keep_updating: true, show_loader: true});

class AccountPageStoreWrapper extends React.Component {
    render () {
        let account_name = AccountStore.getMyAccounts()[0];
        this.props.params.account_name = account_name;
        return <AccountPage {...this.props} account_name={account_name}/>;
    }
}

export default connect(AccountPageStoreWrapper, {
    listenTo() {
        return [AccountStore, SettingsStore, WalletUnlockStore, GatewayStore,MarketsStore];
    },
    getProps() {
        return {
            linkedAccounts: AccountStore.getState().linkedAccounts,
            searchAccounts: AccountStore.getState().searchAccounts,
            settings: SettingsStore.getState().settings,
            hiddenAssets: SettingsStore.getState().hiddenAssets,
            wallet_locked: WalletUnlockStore.getState().locked,
            myAccounts:  AccountStore.getState().myAccounts,
            viewSettings: SettingsStore.getState().viewSettings,
            backedCoins: GatewayStore.getState().backedCoins,
            bridgeCoins: GatewayStore.getState().bridgeCoins, 
            marketData: MarketsStore.getState().marketData,
        };
    }
});





// import AltContainer from "alt-container";
// import ChainTypes from "../Utility/ChainTypes";
// import LoadingIndicator from "../LoadingIndicator";
// import { EmitterInstance } from "bitsharesjs/es";
// import BindToChainState from "../Utility/BindToChainState";
// import MarketsActions from "actions/MarketsActions";

// class ExchangeContainer extends React.Component {

//     render() {
//         let symbols = this.props.params.marketID.split("_");

//         return (
//                 <AltContainer
//                     stores={[MarketsStore]}
//                     inject={{
//                         marketData: () => {
//                             return MarketsStore.getState().marketData;
//                         },
//                         linkedAccounts: AccountStore.getState().linkedAccounts,
//                          searchAccounts: AccountStore.getState().searchAccounts,
//                          settings: SettingsStore.getState().settings,
//                          hiddenAssets: SettingsStore.getState().hiddenAssets,
//                          wallet_locked: WalletUnlockStore.getState().locked,
//                          myAccounts:  AccountStore.getState().myAccounts,
//                          viewSettings: SettingsStore.getState().viewSettings,
//                          backedCoins: GatewayStore.getState().backedCoins,
//                          bridgeCoins: GatewayStore.getState().bridgeCoins
//                     }}
//                   >
//                     <ExchangeSubscriber router={this.props.router} quoteAsset={symbols[0]} baseAsset={symbols[1]} />
//                 </AltContainer>
//         );
//     }
// }

// let emitter = EmitterInstance();
// let callListener, limitListener, newCallListener, feedUpdateListener, settleOrderListener;

// class ExchangeSubscriber extends React.Component {
//     static propTypes = {
//         currentAccount: ChainTypes.ChainAccount.isRequired,
//         quoteAsset: ChainTypes.ChainAsset.isRequired,
//         baseAsset: ChainTypes.ChainAsset.isRequired,
//         coreAsset: ChainTypes.ChainAsset.isRequired
//     };

//     static defaultProps = {
//         currentAccount: "1.2.3",
//         coreAsset: "1.3.0"
//     };

//     constructor() {
//         super();
//         this.state = {sub: null};

//         this._subToMarket = this._subToMarket.bind(this);
//     }

//     componentWillMount() {
//         if (this.props.quoteAsset.toJS && this.props.baseAsset.toJS) {
//             this._subToMarket(this.props);
//             // this._addMarket(this.props.quoteAsset.get("symbol"), this.props.baseAsset.get("symbol"));
//         }

//         emitter.on("cancel-order", limitListener = MarketsActions.cancelLimitOrderSuccess);
//         emitter.on("close-call", callListener = MarketsActions.closeCallOrderSuccess);
//         emitter.on("call-order-update", newCallListener = MarketsActions.callOrderUpdate);
//         emitter.on("bitasset-update", feedUpdateListener = MarketsActions.feedUpdate);
//         emitter.on("settle-order-update", settleOrderListener = (object) => {
//             let {isMarketAsset, marketAsset} = market_utils.isMarketAsset(this.props.quoteAsset, this.props.baseAsset);
//             console.log("settle-order-update:", object, "isMarketAsset:", isMarketAsset, "marketAsset:", marketAsset);

//             if (isMarketAsset && marketAsset.id === object.balance.asset_id) {
//                 MarketsActions.settleOrderUpdate(marketAsset.id);
//             }
//         });
//     }

//     componentWillReceiveProps(nextProps) {
//         /* Prediction markets should only be shown in one direction, if the link goes to the wrong one we flip it */
//         if (nextProps.baseAsset && nextProps.baseAsset.getIn(["bitasset", "is_prediction_market"])) {
//             this.props.router.push(`/market/${nextProps.baseAsset.get("symbol")}_${nextProps.quoteAsset.get("symbol")}`);
//         }

//         if (nextProps.quoteAsset && nextProps.baseAsset) {
//             if (!this.state.sub) {
//                 return this._subToMarket(nextProps);
//             }
//         }

//         if (nextProps.quoteAsset.get("symbol") !== this.props.quoteAsset.get("symbol") || nextProps.baseAsset.get("symbol") !== this.props.baseAsset.get("symbol")) {
//             let currentSub = this.state.sub.split("_");
//             MarketsActions.unSubscribeMarket(currentSub[0], currentSub[1]);
//             return this._subToMarket(nextProps);
//         }
//     }

//     componentWillUnmount() {
//         let { quoteAsset, baseAsset } = this.props;
//         MarketsActions.unSubscribeMarket(quoteAsset.get("id"), baseAsset.get("id"));
//         if (emitter) {
//             emitter.off("cancel-order", limitListener);
//             emitter.off("close-call", callListener);
//             emitter.off("call-order-update", newCallListener);
//             emitter.off("bitasset-update", feedUpdateListener);
//             emitter.off("settle-order-update", settleOrderListener);
//         }
//     }

//     _subToMarket(props, newBucketSize) {
//         let { quoteAsset, baseAsset, bucketSize } = props;
//         if (newBucketSize) {
//             bucketSize = newBucketSize;
//         }
//         if (quoteAsset.get("id") && baseAsset.get("id")) {
//             MarketsActions.subscribeMarket.defer(baseAsset, quoteAsset, bucketSize);
//             this.setState({ sub: `${quoteAsset.get("id")}_${baseAsset.get("id")}` });
//         }
//     }

//     render() {
//         return <div className="grid-block vertical">
//             {!this.props.marketReady ? <LoadingIndicator /> : null}
//             <AccountOverview {..this.props}>
//         </div>;
//     }
// }

// ExchangeSubscriber = BindToChainState(ExchangeSubscriber, {keep_updating: true, show_loader: true});

// export default ExchangeContainer;
