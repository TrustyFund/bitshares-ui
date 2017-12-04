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
import PortfolioActions from "actions/PortfolioActions"

import {ChainStore} from "bitsharesjs/es";


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
        this.update = this.update.bind(this);
    }

    update(data){
        let balances = this.props.account.get("balances", null);
        PortfolioActions.compilePortfolio.defer(balances);
        PortfolioActions.execBuyOrders()
    }

    componentWillUnmount() {
        ChainStore.unsubscribe(this.update);
    }

    componentWillMount(){
        if (this.props.quoteAsset.toJS && this.props.baseAsset.toJS) {
            this._subToMarket(this.props);  
        } 
        ChainStore.subscribe(this.update);
    }
    componentDidMount() {
        if (this.props.account && AccountStore.isMyAccount(this.props.account)) {
            AccountActions.setCurrentAccount.defer(this.props.account.get("name"));
        }

        // Fetch possible fee assets here to avoid async issues later (will resolve assets)
        accountUtils.getPossibleFees(this.props.account, "transfer");
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.quoteAsset && nextProps.baseAsset) {
            return this._subToMarket(nextProps);
        }

    }

    _subToMarket(props, newBucketSize) {
        let { quoteAsset, bucketSize, baseAsset } = props;
        if (newBucketSize) {
            bucketSize = newBucketSize;
        }
    }


    render() {
        let {myAccounts, linkedAccounts, account_name, searchAccounts, settings, wallet_locked, account, hiddenAssets} = this.props;

        let isMyAccount = AccountStore.isMyAccount(account);

        let balances = account.get("balances", null);
        let orders = account.get("orders", null);

        balances.forEach((balance)=>{
            let balanceObject = ChainStore.getObject(balance)
            let asset_type = balanceObject.get("asset_type");
            let balanceAsset = ChainStore.getObject(asset_type);
        });

        return (
            <div className="grid-container">
                <div className="trusty_inline_buttons">
                    <Link to="/deposit"><button>DEPOSIT</button></Link>
                    <Link to="/withdraw"><button>WITHDRAW</button></Link>
                </div>
                <AccountOverview balances={balances} orders={orders} {...this.props}/>
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
        if (typeof account_name != "undefined"){
            this.props.params.account_name = account_name;
            return <AccountPage {...this.props} quoteAsset={quoteAsset} baseAsset={baseAsset} account_name={account_name}/>;
        }else{
            return null
        }
        
        
    }
}

export default connect(AccountPageStoreWrapper, {
    listenTo() {
        return [AccountStore, SettingsStore, WalletUnlockStore, MarketsStore];
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
            marketData: MarketsStore.getState().marketData,
        };
    }
});



