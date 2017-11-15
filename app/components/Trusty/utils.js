import { Dispatcher } from "flux";
import WalletUnlockStore from "stores/WalletUnlockStore"

export const dispatcher = new Dispatcher()

export const unlockAction = (router, path) => {
	if(WalletUnlockStore.getState().locked) {
	    router.push(`/unlock?back=${path}`)
	} 
}
