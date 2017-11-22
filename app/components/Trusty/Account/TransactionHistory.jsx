import React from 'react';
import {RecentTransactions} from "./RecentTransactions"
import Immutable from "immutable"
import ChainTypes from "components/Utility/ChainTypes"
import AccountStore from "stores/AccountStore"

import BindToChainState from "components/Utility/BindToChainState";

class TransactionHistory extends React.Component {

  static propTypes = {
    account: ChainTypes.ChainAccount.isRequired
  };

  static defaultProps = {
        account: localStorage.getItem("_trusty_username")
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="trusty_main_padding">
        <RecentTransactions
            accountsList={Immutable.fromJS([this.props.account.get("id")])}
            compactView={false}
            showMore={false}
            fullHeight={true}
            limit={300}
            showFilters={true}
            dashboard
            noTitle={true}
        />
      </div>
    );
  }
}

let TransactionHistoryChainWrapper = BindToChainState(TransactionHistory);


export default class TransactionHistoryWrapper extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let account_name = AccountStore.getMyAccounts()[0];
    return (
      <TransactionHistoryChainWrapper account={account_name} />
    );
  }
}


