import React from "react";
import { connect } from "alt-react";
import IntlStore from "stores/IntlStore";
import IntlActions from "actions/IntlActions";
import WalletUnlockStore from "stores/WalletUnlockStore";
import {IntlProvider} from "react-intl";
import intlData from "./components/Utility/intlData";
import AccountStore from "stores/AccountStore";
import LoadingIndicator from "components/LoadingIndicator";
import { dispatcher } from "components/Trusty/utils"
/* pixel perfect helper */
// import 'components/Trusty/pixel-glass'
// import 'assets/stylesheets/trusty/components/pixel-glass.scss'

const user_agent = navigator.userAgent.toLowerCase();
let isExtension = (window.innerHeight == 590 && window.innerWidth == 400);
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
window.isMobile = !!(/android|ipad|ios|iphone|windows phone/i.test(user_agent) || isSafari || isExtension)

import jquery from 'jquery'

jquery.fn.nodoubletapzoom = function() {
    jquery(this).bind('touchstart', function preventZoom(e) {
        var t2 = e.timeStamp;
        var t1 = jquery(this).data('lastTouch') || t2;
        var dt = t2 - t1;
        var fingers = e.originalEvent.touches.length;
        jquery(this).data('lastTouch', t2);
        if (!dt || dt > 500 || fingers > 1) {
            return; // not double-tap
        }
        e.preventDefault(); // double tap - prevent the zoom
        // also synthesize click events we just swallowed up
        jquery(e.target).trigger('click');
    });
};

jquery('body').nodoubletapzoom();

class AppContainer extends React.Component {
    constructor(){
        super()
        this.state = {showLoader: false}
        dispatcher.register(dispatch => {
            if ( dispatch.type === 'show-trusty-loader') {
                this.setState({showLoader: dispatch.show})
            }
        })
    }
    render() {
        if(!window.isMobile || this.state.showLoader)  {
            return <LoadingIndicator type={"trusty-owl"}/>
        } else {
            return (<div>{this.props.children}</div>);
        }
	}
}

export default AppContainer;