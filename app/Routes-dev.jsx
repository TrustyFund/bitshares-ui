import React from "react";

import { Router, Route, IndexRoute, browserHistory, hashHistory, Redirect } from "react-router/es";
import willTransitionTo from "./routerTransition";
import App from "./AppContainer";
import Trusty from "./Trusty";

// Components imported here for react hot loader (does not work with async route loading)
import DashboardContainer from "./components/Dashboard/DashboardContainer";
import AccountPage from "./components/Trusty/Account/AccountPage";

import TermsOfUse from "./components/Trusty/Account/TermsOfUse";
import CreateAccount from "./components/Trusty/Account/CreateAccount";
import { WalletCreate , CreateWalletFromBrainkey } from "./components/Trusty/Wallet/WalletCreate";
import Landing from "components/Trusty/Landing/Landing"
import Withdraw from "components/Trusty/Account/Withdraw"
import Deposit from "components/Trusty/Account/Deposit"
import ManagePortfolio from "components/Trusty/Portfolio/Manage"
import Backup from "components/Trusty/Wallet/BackupBrainkey"
import UnlockAccount from "components/Trusty/UnlockAccount"
import InitError from "./components/InitError";

const history = __HASH_HISTORY__ ? hashHistory : browserHistory;

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Landing}/>
        <Route path="/home" component={Trusty} onEnter={willTransitionTo}>
            <IndexRoute component={AccountPage} />
            <Route path="/backup" component={Backup} />
            <Route path="/manage" component={ManagePortfolio} />
            <Route path="/withdraw" component={Withdraw} />
            <Route path="/deposit" component={Deposit} />
            <Route path="/unlock" component={UnlockAccount} />
            <Route path="/init-error" component={InitError} />
            <Route path="/signup" component={CreateAccount}/>
            <Route path="/login" component={CreateWalletFromBrainkey} />
            <Route path="/terms-of-use" component={TermsOfUse} />
        </Route>
    </Route>
);

export default class Routes extends React.Component {
    render() {
        return <Router history={history} routes={routes} />;
    }
}
