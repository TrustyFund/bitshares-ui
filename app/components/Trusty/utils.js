import { Dispatcher } from "flux";
import WalletUnlockStore from "stores/WalletUnlockStore"

export const dispatcher = new Dispatcher()

export const unlockAction = (router, from,to) => {
	if(WalletUnlockStore.getState().locked) {
	    router.push(`/unlock?from=${from}&to=${to}`)
	} 
}
