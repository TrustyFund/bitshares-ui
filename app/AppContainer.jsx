import React from "react";
import { connect } from "alt-react";
import IntlStore from "stores/IntlStore";
import IntlActions from "actions/IntlActions";
import WalletUnlockStore from "stores/WalletUnlockStore";
import {IntlProvider} from "react-intl";
import intlData from "./components/Utility/intlData";
import AccountStore from "stores/AccountStore";


class AppContainer extends React.Component {
	render() {
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

    componentWillMount(){
        if(localStorage.getItem("_trusty_username")) {
            this.props.router.push("/home");
        }
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