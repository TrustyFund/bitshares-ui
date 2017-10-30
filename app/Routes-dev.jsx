import React from "react";

import { Router, Route, IndexRoute, browserHistory, hashHistory, Redirect } from "react-router/es";
import willTransitionTo from "./routerTransition";
import App from "./Trusty";

// Components imported here for react hot loader (does not work with async route loading)
import DashboardContainer from "./components/Dashboard/DashboardContainer";
import AccountPage from "./components/Trusty/Account/AccountPage";
import AccountOverview from "./components/Trusty/Account/AccountOverview";
import TermsOfUse from "./components/Trusty/Account/TermsOfUse";
import CreateAccount from "./components/Trusty/Account/CreateAccount";
import { WalletCreate , CreateWalletFromBrainkey } from "./components/Trusty/Wallet/WalletCreate";
import Landing from "components/Trusty/Landing/Landing"
import Withdraw from "components/Trusty/Account/Withdraw"
import Deposit from "components/Trusty/Account/Deposit"
import ManagePortfolio from "components/Trusty/Portfolio/Manage"


const history = __HASH_HISTORY__ ? hashHistory : browserHistory;

class Auth extends React.Component {
    render() {return null; }
}

const routes = (
    <Route path="/" component={App} onEnter={willTransitionTo}>
        <Route path="/signup" component={CreateAccount}/>
        <Route path="/landing" component={Landing}/>
        <Route path="/home" component={AccountPage}>
            <IndexRoute component={AccountOverview}/>
            <Route path="overview" component={AccountOverview} />
        </Route>
        <Route path="/manage" component={ManagePortfolio} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/deposit" component={Deposit} />
        <Route path="/terms-of-use" component={TermsOfUse} />
        <Route path="/dashboard" component={AccountOverview}/>
        <Route path="create-wallet-brainkey" component={CreateWalletFromBrainkey} />
    </Route>
);

export default class Routes extends React.Component {
    render() {
        return <Router history={history} routes={routes} />;
    }
}
