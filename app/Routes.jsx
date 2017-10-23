import React from "react";

import { Route, IndexRoute, Redirect } from "react-router/es";
import willTransitionTo from "./routerTransition";
import App from "./Trusty";

/*
* Electron does not support async loading of components via System.import,
* so we make sure they're bundled already by including them here
*/
if (__ELECTRON__ || __HASH_HISTORY__) {
    require("./electron_imports");
}

class Auth extends React.Component {
    render() {return null; }
}

function loadRoute(cb, moduleName = "default") {
    return (module) => cb(null, module[moduleName]);
}

function errorLoading(err) {
    console.error("Dynamic page loading failed", err);
}

const routes = (
    <Route path="/" component={App} onEnter={willTransitionTo}>
        {/*Trusty Routes*/}

        <Route path="/signup" getComponent={(location, cb) => {
            System.import("components/Trusty/Account/CreateAccount").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/landing" getComponent={(location, cb) => {
            System.import("components/Trusty/Landing/Landing").then(loadRoute(cb)).catch(errorLoading);
        }}/>

        <Route path="/home" getComponent={(location, cb) => {
            System.import("components/Trusty/Account/AccountPage").then(loadRoute(cb)).catch(errorLoading);
        }}>
            <IndexRoute getComponent={(location, cb) => {
                System.import("components/Trusty/Account/AccountOverview").then(loadRoute(cb)).catch(errorLoading);
            }}/>
            <Route path="/overview" getComponent={(location, cb) => {
                System.import("components/Trusty/Account/AccountOverview").then(loadRoute(cb)).catch(errorLoading);
            }}/>
        </Route>

        <Route path="/withdraw" getComponent={(location, cb) => {
            System.import("components/Trusty/Account/Withdraw").then(loadRoute(cb)).catch(errorLoading);
        }}/>

        <Route path="/deposit" getComponent={(location, cb) => {
            System.import("components/Trusty/Account/Deposit").then(loadRoute(cb)).catch(errorLoading);
        }}/>

        <Route path="/create-wallet-brainkey" getComponent={(location, cb) => {
            System.import("components/Trusty/Wallet/WalletCreate").then(loadRoute(cb, "CreateWalletFromBrainkey")).catch(errorLoading);
        }}/>


        <Route path="/terms-of-use" getComponent={(location, cb) => {
            System.import("components/Trusty/Account/TermsOfUse").then(loadRoute(cb)).catch(errorLoading);
        }}/>

        <Route path="/manage" getComponent={(location, cb) => {
            System.import("components/Trusty/Portfolio/Manage").then(loadRoute(cb)).catch(errorLoading);
        }}/>

    </Route>
);

export default routes;
