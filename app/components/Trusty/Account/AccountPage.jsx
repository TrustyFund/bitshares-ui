import {Link} from 'react-router';
import React from "react";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import WalletUnlockStore from "stores/WalletUnlockStore";
import GatewayStore from "stores/GatewayStore";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import { connect } from "alt-react";
import accountUtils from "common/account_utils";
import AccountOverview from "./AccountOverview";
import MarketsStore from "stores/MarketsStore";
import MarketsActions from "actions/MarketsActions";
import PortfolioStore from "stores/PortfolioStore";

class AccountPage extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
        quoteAsset: ChainTypes.ChainAsset.isRequired,
        baseAsset: ChainTypes.ChainAsset.isRequired,
    };

    static defaultProps = {
        account: "props.params.account_name"
    };

    constructor() {

        super();

        this._subToMarket = this._subToMarket.bind(this);
        this.state = {portfolio: null}
    }

    componentWillMount(){
        if (this.props.quoteAsset.toJS && this.props.baseAsset.toJS) {
            this._subToMarket(this.props);  
        } 
    }
    componentDidMount() {
        if (this.props.account && AccountStore.isMyAccount(this.props.account)) {
            AccountActions.setCurrentAccount.defer(this.props.account.get("name"));
        }

        // Fetch possible fee assets here to avoid async issues later (will resolve assets)
        accountUtils.getPossibleFees(this.props.account, "transfer");
    }

    componentWillReceiveProps(nextProps) {

        this.setState({portfolio: PortfolioStore.getLocalPortfolio()})
        
        if (nextProps.quoteAsset && nextProps.baseAsset) {
            return this._subToMarket(nextProps);
        }
        
    }

    _subToMarket(props, newBucketSize) {
        let { quoteAsset, bucketSize, baseAsset } = props;
        if (newBucketSize) {
            bucketSize = newBucketSize;
        }
        if (quoteAsset.get("id") && baseAsset.get("id")) {
            MarketsActions.subscribeMarket.defer(baseAsset, quoteAsset, bucketSize);
        }
    }


    render() {
        let {myAccounts, linkedAccounts, account_name, searchAccounts, settings, wallet_locked, account, hiddenAssets} = this.props;

        let isMyAccount = AccountStore.isMyAccount(account);

        return (
            <div className="grid-block page-layout">
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
                            bridgeCoins: this.props.bridgeCoins,
                            marketData: this.props.marketData,
                            portfolioData: this.props.portfolioData
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
        let quoteAsset = "TRFND"
        let baseAsset = "BTS"
        let account_name = AccountStore.getMyAccounts()[0];
        this.props.params.account_name = account_name;
        return <AccountPage {...this.props} quoteAsset={quoteAsset} baseAsset={baseAsset} account_name={account_name}/>;
    }
}

export default connect(AccountPageStoreWrapper, {
    listenTo() {
        return [AccountStore, SettingsStore, WalletUnlockStore, GatewayStore,MarketsStore];
    },
    getProps() {
        return {
            bucketSize: MarketsStore.getState().bucketSize,
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
            portfolioData: PortfolioStore.getState().data
        };
    }
});



