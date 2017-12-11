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
        if(!window.isMobile || this.state.showLoader) return <LoadingIndicator type={"trusty-owl"}/>
		return (<div>{this.props.children}</div>);
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
                <AppContainer {...this.props}/>
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

export default Root;