import React from "react";
import { connect } from "alt-react";
import BlockchainStore from "stores/BlockchainStore";
import SettingsStore from "stores/SettingsStore";
import Translate from "react-translate-component";
import WebsocketAddModal from "./Settings/WebsocketAddModal";
import SettingsActions from "actions/SettingsActions";
import {Apis} from "bitsharesjs-ws";
import counterpart from "counterpart";

class InitError extends React.Component {

    triggerModal(e) {
        this.refs.ws_modal.show(e);
    }

    onChangeWS(e) {
        SettingsActions.changeSetting({setting: "apiServer", value: e.target.value });
        Apis.reset(e.target.value, true);
    }

    onReloadClick(e) {
        if (e) {
            e.preventDefault();
        }
        if (window.electron) {
            window.location.hash = "";
            window.remote.getCurrentWindow().reload();
        }
        else window.location.href = __BASE_URL__;
    }

    onReset() {
        SettingsActions.changeSetting({setting: "apiServer", value: this.props.defaultConnection });
        SettingsActions.clearSettings();
    }

    render() {
        let options = this.props.apis.map(entry => {
            let onlyDescription = entry.url.indexOf("fake.automatic-selection") !== -1;
            let {location} = entry;
            if (location && typeof location === "object" && "translate" in location) location = counterpart.translate(location.translate);

            if (entry.url == this.props.apiServer) return null;

            return <option key={entry.url} value={entry.url}>{location || entry.url} {!onlyDescription && location ? `(${entry.url})` : null}</option>;
        });

        return (
            <div className="grid-block page-layout">
                <div className="grid-container">
                    <div className="grid-content no-overflow init-error">
                        <br/>
                        <h3 style={{textAlign: "center"}}>CONNECTION ISSUE</h3>
                        <br/>
                        <h5 style={{textAlign: "center"}}>
                        There seems to be a problem with your connection to the default node 
                        </h5>
                        <br/><br/><br/><br/>
                        <section className="block-list">
                            <header><span>Choose another server</span></header>
                            <ul>
                                <li className="with-dropdown">
                                    <select onChange={this.onChangeWS.bind(this)} value={this.props.apiServer}>
                                        {options}
                                    </select>
                                </li>
                            </ul>
                        </section>
                        <br/>
                        <div className="button-group" style={{paddingLeft: "25%",wodth: "100%"}}>
                            <div className="button outline" href onClick={this.onReloadClick}>TRY DIFFERENT NODE</div>
                        </div>
                        <WebsocketAddModal ref="ws_modal" apis={this.props.apis} />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(InitError, {
    listenTo() {
        return [BlockchainStore, SettingsStore];
    },
    getProps() {
        return {
            rpc_connection_status: BlockchainStore.getState().rpc_connection_status,
            apis: SettingsStore.getState().defaults.apiServer,
            apiServer: SettingsStore.getState().settings.get("apiServer"),
            defaultConnection: SettingsStore.getState().defaultSettings.get("apiServer"),
        };
    }
});
