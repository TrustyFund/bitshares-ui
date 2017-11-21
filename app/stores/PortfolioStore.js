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

const defaultLoading = {update: true};

class PortfolioStore extends BaseStore {
	constructor() {
        super();
        this.summValid = false;

        this._export(
            "getDefaultPortfolio",
            "setLoading"
        );

        this.getDefaultPortfolio = this.getDefaultPortfolio.bind(this);
        this.setLoading = this.setLoading.bind(this);

        this.state = {
            data: null,
            totalPercentageFutureShare: 0,
            loading: defaultLoading,
            totalBaseValue: 0,
            orders: [],
            totalBuyOrdersPrice: 0,
            buyOrders: []
        }

        this.bindListeners({
            onCompilePortfolio: PortfolioActions.suggestPortfolio,
            onCompilePortfolio: PortfolioActions.compilePortfolio,
            onIncrementAsset: PortfolioActions.incrementAsset,
            onDecrementAsset: PortfolioActions.decrementAsset,
            onUpdatePortfolio: PortfolioActions.updatePortfolio,
        })
    }

    getDefaultPortfolio(){
        return {
          base: "BTS",
          data: [
            {
              assetShortName: "BTC",
              assetFullName: "OPEN.BTC",
              futureShare: 60,
            },
            {
              assetShortName: "ETH",
              assetFullName: "OPEN.ETH",
              futureShare: 10,
            },
            {
              assetShortName: "DASH",
              assetFullName: "OPEN.DASH",
              futureShare: 5,
            },
            {
              assetShortName: "LTC",
              assetFullName: "OPEN.LTC",
              futureShare: 10,
            },
            {
              assetShortName: "EOS",
              assetFullName: "OPEN.EOS",
              futureShare: 4,
            },
            {
              assetShortName: "STEEM",
              assetFullName: "OPEN.STEEM",
              futureShare: 4,
            },
            {
              assetShortName: "BTS",
              assetFullName: "BTS",
              futureShare: 4,
            },
            {
              assetShortName: "TRFND",
              assetFullName: "TRFND",
              futureShare: 3,
            },

          ]
        }
    }


    onCompilePortfolio(portfolio){
        this.setState({
            data: portfolio.data,
            totalPercentageFutureShare: portfolio.totalFutureShare,
            loading: defaultLoading,
            totalBaseValue: portfolio.totalBaseValue,
            totalUSDShare: portfolio.totalUSDShare
        })
    }

    onIncrementAsset({asset}) {
        let data = this.state.data.slice()
        let totalPercentageFutureShare = 0
        let loading = defaultLoading
        data.forEach(i=>{
            if(i.assetShortName==asset && i.futureShare < 100){
              i.futureShare++
            } 
            totalPercentageFutureShare+= i.futureShare
        })
        this.setState({data, totalPercentageFutureShare, loading})
    }

    onDecrementAsset({asset}) {
        let data = this.state.data.slice()
        let totalPercentageFutureShare = 0
        let loading = defaultLoading
        data.forEach(i=>{
            if(i.assetShortName==asset && i.futureShare > 1){
              i.futureShare--
            }
            totalPercentageFutureShare+= i.futureShare
        })
        this.setState({data, totalPercentageFutureShare, loading})
    }

    setLoading(){
      this.state.loading = {update: true};
    }

    onUpdatePortfolio(payload){
      console.log("on-update-portfolio-->", payload)

      let { orders, totalBuyOrdersPrice, buyOrdersProcess, clearBuyOrders } = payload

      orders && this.setState({orders})
      totalBuyOrdersPrice && this.setState({totalBuyOrdersPrice})
      clearBuyOrders && this.setState({buyOrders: []})
      if(buyOrdersProcess) {
        let  orders = this.state.buyOrders.slice()
        orders.push(buyOrdersProcess)
        this.setState({buyOrders: orders})
      } 

      this.state.loading.update = false;
    }

}
export default alt.createStore(PortfolioStore, "PortfolioStore");