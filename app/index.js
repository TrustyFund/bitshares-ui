import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Router, browserHistory, hashHistory } from "react-router/es";

import initReactFastclick from 'react-fastclick';
initReactFastclick();
/*
* Routes-dev is only needed for react hot reload, as this does not work with
* the async routes defined in Routes.jsx. Any changes to the routes must be kept
* synchronized between the two files
*/

import jquery from 'jquery'

jquery('head').append('<style>._trusty_hide_input {display: none;}</style>')

import routes from "./Routes";

require("./components/Utility/Prototypes"); // Adds a .equals method to Array for use in shouldComponentUpdate

/*
* Electron does not support browserHistory, so we need to use hashHistory.
* The same is true for servers without configuration options, such as Github Pages
*/
const history = __HASH_HISTORY__ ? hashHistory : browserHistory;

if(localStorage.getItem("_trusty_username")) {
   history.push("/home")
}

const rootEl = document.getElementById("content");
const render = () => {
    ReactDOM.render(
        <AppContainer>
            <Router history={history} routes={routes} />
        </AppContainer>,
        rootEl
    );
};
render();
