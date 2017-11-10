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
import PortfolioStore from "stores/PortfolioStore"


class PortfolioActions {

	concatPortfolio(account){
        portfolioStorage.set("portfolio",{});
        let balances  = PortfolioStore.getBalances(account)
        let activeBalaces = []
        //balances list Map { _root: { entries:[["1.3.0": "2.5.1315326" ]]} }

        let portfolioData = PortfolioStore.getPortfolio().data.slice()

        balances.forEach(b=> {

            let balance = ChainStore.getObject(b)
            let balanceAsset = ChainStore.getObject(balance.get("asset_type"))

            if (balanceAsset) {

                let data = portfolioData.filter(p=>{
                    return p.assetShortName==balanceAsset.get("symbol") || p.assetFullName==balanceAsset.get("symbol")
                })
                let futureShare
                if(data.length){
                   futureShare = portfolioData.splice(portfolioData.findIndex(i=>i.assetFullName==data[0].assetFullName), 1)[0].futureShare 
                } 
             
                let asset_type = balance.get("asset_type");
                let asset = ChainStore.getObject(asset_type);
                if(asset) {
                    let s = asset.get("symbol")
                    let amount = Number(balance.get("balance"))
                    activeBalaces.push({
                        balanceID: b,
                        balanceMap: balance,
                        assetShortName: ~s.search(/open/i)?s.substring(5):s,
                        assetFullName: asset.get("symbol"), 
                        futureShare: futureShare || 0, 
                        currentShare: +countShares(amount, asset_type, true), 
                        bitUSDShare: +countShares(amount, asset_type),
                        amount,
                    })    
                } 
            
            }
           
        })

        let data = activeBalaces.concat(portfolioData)

        let port = {
            data,
            map: data.map(b=>b.assetShortName)
        }
		return dispatch =>{
	        return new Promise((resolve, reject)=>{
	            Promise.resolve().then(()=>{
	                port.data.forEach((item, index)=>{
	                    Apis.instance().db_api().exec("list_assets", [
	                        item.assetShortName, 1
	                    ]).then(assets => {
	                        let bal = port.data[index]
	                        bal.assetMap = createMap(assets[0])
	                        if(!bal.balanceMap) {
	                            bal.balanceID = null;
	                            bal.balanceMap = createMap({
	                                id:"0",
	                                owner: "0",
	                                asset_type: "0",
	                                balance: "0"
	                            })
	                            bal.amount = 0
	                            bal.currentShare =  0
	                            bal.bitUSDShare = 0
	                        }
	                        if(!bal.futureShare) bal.futureShare = 0
	                    })  
	                })
	                
	            }).then(()=>{
	                portfolioStorage.set("portfolio",port);
	                resolve(port)
	                dispatch(port)
	            })
	        })
		}
    }
}

//H E L P S
let portfolioStorage = new ls("__trusty_portfolio__");

const createMap = (myObj) =>{
     return new Map(
        Object
            .keys(myObj)
            .map(
                key => [key, myObj[key]]
            )
    )
}

const countShares = (amount, fromAsset, percentage=false) => {

    fromAsset = ChainStore.getObject(fromAsset)
    let toAsset = ChainStore.getAsset("USD")

    if(!toAsset) return 0

    let marketStats = MarketsStore.getState().allMarketStats

    let coreAsset = ChainStore.getAsset("1.3.0");
    let toStats, fromStats;
    let toID = toAsset.get("id");
    let toSymbol = toAsset.get("symbol");
    let fromID = fromAsset.get("id");
    let fromSymbol = fromAsset.get("symbol");

    if (coreAsset && marketStats) {
        let coreSymbol = coreAsset.get("symbol");
        toStats = marketStats.get(toSymbol + "_" + coreSymbol);
        fromStats = marketStats.get(fromSymbol + "_" + coreSymbol);
    }

    let price = utils.convertPrice(fromStats && fromStats.close ? fromStats.close :
                                    fromID === "1.3.0" || fromAsset.has("bitasset") ? fromAsset : null,
                                    toStats && toStats.close ? toStats.close :
                                    (toID === "1.3.0" || toAsset.has("bitasset")) ? toAsset : null,
                                    fromID,
                                    toID);

    let eqValue = price ? utils.convertValue(price, amount, fromAsset, toAsset) : 0;


    let TRFNDPrice = 0

    if(fromAsset.get("symbol") == "TRFND") {

        let { combinedBids, highestBid } = MarketsStore.getState().marketData

        TRFNDPrice = combinedBids.map(order=>order.getPrice())[0]

        let asset = fromAsset.toJS()
        let precision = utils.get_asset_precision(asset.precision);
        let p = (TRFNDPrice * (amount / precision))
        let totalBts = localStorage.getItem("_trusty_bts_total_value")

        if(!totalBts) return 0

        let percent = ((p/totalBts)*100)
        if(percentage) return percent.toFixed(0) 

        let totalAmount = +localStorage.getItem("_trusty_total_value")
        if(!totalAmount) return 0

        return (totalAmount/100*percent).toFixed(0)  

    } 

    if(percentage) {
        let totalAmount = +localStorage.getItem("_trusty_total_value")
        if(!totalAmount) return 0
        let percent = eqValue.toFixed(2) / totalAmount.toFixed(2) * 100
        return percent.toFixed(0) 
    } else {
        let asset = toAsset.toJS()
        let precision = utils.get_asset_precision(asset.precision);
        return (eqValue / precision).toFixed(0)
    }
}

export default alt.createActions(PortfolioActions)