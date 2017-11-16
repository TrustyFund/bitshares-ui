import BaseStore from "./BaseStore";
import alt from "alt-instance";
import ls from "common/localStorage";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import MarketsActions from "actions/MarketsActions";
import MarketsStore from "stores/MarketsStore";
import Immutable from "immutable";
import AssetActions from 'actions/AssetActions';
import { dispatcher } from 'components/Trusty/utils';
import {Apis} from "bitsharesjs-ws";
import utils from "common/utils";
import PortfolioActions from "actions/PortfolioActions"


let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {
	constructor() {
        super();
        this.summValid = false;

        this._export(
            "getPortfolio",
            "getBalances",
        );

        this.getPortfolio = this.getPortfolio.bind(this);
        this.getBalances = this.getBalances.bind(this);

        this.state = {
            data: null,
            totalPercentageFutureShare: 0
        }

        this.bindListeners({
            onConcatPortfolio: PortfolioActions.concatPortfolio,
            onIncrementAsset: PortfolioActions.incrementAsset,
            onDecrementAsset: PortfolioActions.decrementAsset,
            onUpdatePortfolio: PortfolioActions.updatePortfolio,
        })
    }

    getBalances(account){
        let account_balances = account.get("balances");
        let orders = account.get("orders", null);
        if (account_balances) {
            // Filter out balance objects that have 0 balance or are not included in open orders
            account_balances = account_balances.filter((a, index) => {
                let balanceObject = ChainStore.getObject(a);
                if (balanceObject && (!balanceObject.get("balance") && !orders[index])) {
                    return false;
                } else {
                    return true;
                }
            })
        }
        return account_balances;
    }

    getPortfolio(){
        return {
          data: [
                { assetShortName: "BTC",
                  futureShare: 60,
                  currentShare:0,
                  assetFullName: "OPEN.BTC"},
                { assetShortName: "ETH",
                  futureShare: 10,
                  currentShare:0,
                  assetFullName: "OPEN.ETH"},
                { assetShortName: "DASH",
                  futureShare: 5,
                  currentShare:0,
                  assetFullName: "OPEN.DASH"},
                { assetShortName: "LTC",
                  futureShare: 10,
                  currentShare:0,
                  assetFullName: "OPEN.LTC"},
                { assetShortName: "EOS",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "OPEN.EOS"},
                { assetShortName: "STEEM",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "OPEN.STEEM"},
                { assetShortName: "BTS",
                  futureShare: 4,
                  currentShare:0,
                  assetFullName: "BTS"},
                { assetShortName: "TRFND",
                  futureShare: 3,
                  currentshare:0,
                  assetFullName: "TRFND"}
            ],
            map:["BTC","ETH","DASH","LTC","EOS","STEEM","BTS","TRFND"]};
    }

    onConcatPortfolio(portfolio){
        this.setState({
            data: portfolio.data,
            totalPercentageFutureShare: portfolio.totalFutureShare
        })
    }

    onIncrementAsset({asset}) {
        let data = this.state.data.slice()
        let totalPercentageFutureShare = 0
        data.forEach(i=>{
            if(i.assetShortName==asset) i.futureShare++
            totalPercentageFutureShare+= i.futureShare
        })
        this.setState({data, totalPercentageFutureShare })
    }

    onDecrementAsset({asset}) {
        let data = this.state.data.slice()
        let totalPercentageFutureShare = 0
        data.forEach(i=>{
            if(i.assetShortName==asset) i.futureShare--
            totalPercentageFutureShare+= i.futureShare
        })
        this.setState({data, totalPercentageFutureShare })
    }

    onUpdatePortfolio(){
        console.log("UPDATE DONE")
    }
}
export default alt.createStore(PortfolioStore, "PortfolioStore");