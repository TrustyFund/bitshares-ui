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


const createMap = (myObj) =>{
     return new Map(
        Object
            .keys(myObj)
            .map(
                key => [key, myObj[key]]
            )
    )
}

let portfolioStorage = new ls("__trusty_portfolio__");

class PortfolioStore extends BaseStore {
	constructor() {
        super();
        this.summValid = false;

        this._export(
            "getPortfolio",
            "getTotalPercentage",
            "isValid",
            "getBalances",
        );

        this.getPortfolio = this.getPortfolio.bind(this);
        this.getTotalPercentage = this.getTotalPercentage.bind(this);
        this.isValid = this.isValid.bind(this);
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
        let storedPortfolio = portfolioStorage.get("portfolio");

        let defaultPortfolio = {
            data:[
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
            map: ["BTC","ETH","DASH","LTC","EOS","STEEM","BTS","TRFND"]
        };

        if (storedPortfolio.data && storedPortfolio.data.length > 0){
            return storedPortfolio;
        }else{
            portfolioStorage.set("portfolio",defaultPortfolio);
            return defaultPortfolio;
        }

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

    getTotalPercentage(){
        let storedPortfolio = portfolioStorage.get("portfolio");
        let result = 0;
        storedPortfolio.data.forEach(current => {
            result = result + current.futureShare;
        });
        this.summValid = result == 100;
        return result;
    }	

    isValid(){
        return this.summValid;
    }

    onUpdatePortfolio(){
        console.log("UPDATE DONE")
    }
}
export default alt.createStore(PortfolioStore, "PortfolioStore");