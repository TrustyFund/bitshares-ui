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

    constructor() {
        super();
        this.onReloadClick = this.onReloadClick.bind(this);
    }

    onReloadClick(e) {
        if (e) {
            e.preventDefault();
        }

        let notCurrent = this.props.apis.filter((elem) => {
            return elem.url != this.props.defaultConnection;
        })[0];


        SettingsActions.changeSetting({setting: "apiServer", value: notCurrent.url});
        Apis.reset(notCurrent.url, true);

        if (window.electron) {
            window.location.hash = "";
            window.remote.getCurrentWindow().reload();
        }else{
            window.location.href = __BASE_URL__; 
        }
    }

    render() {
        //console.log("LAT",this.props.apis);

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
            defaultConnection: SettingsStore.getState().defaultSettings.get("apiServer")
        };
    }
});
