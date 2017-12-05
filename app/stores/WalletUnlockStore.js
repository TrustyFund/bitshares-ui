import alt from "alt-instance";
import WalletUnlockActions from "actions/WalletUnlockActions";
import SettingsActions from "actions/SettingsActions";
import WalletDb from "stores/WalletDb";
import ls from "common/localStorage";

const STORAGE_KEY = "__graphene__";
let ss = new ls(STORAGE_KEY);

class WalletUnlockStore {

    constructor() {
        this.bindActions(WalletUnlockActions);
        this.state = {
            locked: true,
            passwordLogin: ss.get("settings_v3").passwordLogin || false
        };

        this.walletLockTimeout = this._getTimeout(); // seconds (10 minutes)
        this.timeout = null;

        this.bindListeners({
            onChangeSetting: SettingsActions.changeSetting
        });
    }

    onUnlock({resolve, reject}) {
        //DEBUG console.log('... onUnlock setState', WalletDb.isLocked())
        //
        if( ! WalletDb.isLocked()) {
            this.setState({locked: false});
            resolve();
            return;
        }

        this.setState({resolve, reject, locked: WalletDb.isLocked()});
    }

    onLock({resolve}) {
        //DEBUG console.log('... WalletUnlockStore\tprogramatic lock', WalletDb.isLocked())
        if(WalletDb.isLocked()) {
            resolve()
            return
        }
        WalletDb.onLock()
        this.setState({resolve:null, reject:null, locked: WalletDb.isLocked()})
        resolve()
    }

    onCancel() {
        //this.state.reject();
        this.setState({resolve:null, reject:null});
    }

    onChange() {
        this.setState({locked: WalletDb.isLocked()})
    }


    onChangeSetting(payload) {
        if (payload.setting === "walletLockTimeout") {
            this.walletLockTimeout = payload.value;
            this._clearLockTimeout();
        } else if (payload.setting === "passwordLogin") {
            this.setState({
                passwordLogin: payload.value
            });
        }
    }


    _clearLockTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    _getTimeout() {
        return 60000;
    }

    onCheckLock() {
        this.setState({locked: WalletDb.isLocked()});
    }
}

export default alt.createStore(WalletUnlockStore, 'WalletUnlockStore')
