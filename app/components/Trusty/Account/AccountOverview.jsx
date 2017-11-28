import React from "react";
import Immutable from "immutable";
import Translate from "react-translate-component";
import BalanceComponent from "components/Utility/Trusty/BalanceComponent";
import TotalBalanceValue from "components/Utility/Trusty/TotalBalanceValue";
import SettleModal from "components/Modal/SettleModal";
import {BalanceValueComponent, EquivalentValueComponent} from "components/Utility/Trusty/EquivalentValueComponent";
import AssetName from "components/Utility/Trusty/AssetName";
import { RecentTransactions } from "components/Trusty/Account/RecentTransactions";
import Proposals from "components/Account/Proposals";
import {ChainStore} from "bitsharesjs/es";
import SettingsActions from "actions/SettingsActions";
import assetUtils from "common/asset_utils";
import counterpart from "counterpart";
import Icon from "components/Icon/Icon";
import {Link} from "react-router";
import ChainTypes from "components/Utility/ChainTypes";
import FormattedAsset from "components/Utility/Trusty/FormattedAsset";
import BindToChainState from "components/Utility/BindToChainState";
import utils from "common/utils";

import BorrowModal from "components/Modal/BorrowModal";

import ReactTooltip from "react-tooltip";
import { Apis } from "bitsharesjs-ws";
import GatewayActions from "actions/GatewayActions";
import MarketCard from "components/Trusty/Dashboard/MarketCard";
import PortfolioStore from "stores/PortfolioStore";
import { connect } from "alt-react";



class AccountOverview extends React.Component {
    static propTypes = {
        balanceAssets: ChainTypes.ChainAssetsList,
    };

    constructor() {
        super();
        this.state = {
            settleAsset: "1.3.0",
            showHidden: false,
            depositAsset: null,
            withdrawAsset: null,
            bridgeAsset: null,
            balances: null
        };
    }

    _onSettleAsset(id, e) {
        e.preventDefault();
        this.setState({
            settleAsset: id
        });

        this.refs.settlement_modal.show();
    }

    _hideAsset(asset, status) {
        SettingsActions.hideAsset(asset, status);
    }

    _getSeparator(render) {
        return render ? <span>&nbsp;|&nbsp;</span> : null;

    }

    _onNavigate(route, e) {
        e.preventDefault();
        this.props.router.push(route);
    }

    _managePortfolio(){
        return () => {
            this.props.router.push(`/manage`)
        }
    }


    _renderTrustyBalaces() {
        let balances = []
        if(this.props.trustyPortfolio.data && this.props.trustyPortfolio.data.length) {
            this.props.trustyPortfolio.data.forEach(p=>{
                let preferredUnit = "USD";
                let pair = ["BTS", p.assetFullName];
                balances.push(
                    <tr key={p.assetShortName} style={{maxWidth: "100rem"}}>
                        <td style={{textAlign: "left"}}>
                            {p.assetShortName}
                        </td>
                        <td style={{textAlign: "right"}}>
                            { p.balanceID != null ? <span>{p.currentShare}%</span> : "0%"}
                        </td>
                        <td style={{textAlign: "right"}}>
                            { p.balanceID != null ? <span>{p.bitUSDShare}</span> : 0 }
                        </td>
                        <td>
                            <MarketCard
                                key={pair[0] + "_" + pair[1]}
                                marketId={pair[1] + "_" + pair[0]}
                                new={false}
                                quote={pair[0]}
                                base={pair[1]}
                                invert={pair[2]}
                                hide={false}
                            />
                        </td>
                    </tr>
                );
            })
            
        }

        return balances
    }

    _toggleHiddenAssets() {
        this.setState({
            showHidden: !this.state.showHidden
        });
    }

    render() {
        let {account, hiddenAssets, settings, orders, trustyPortfolio: portfolio } = this.props;
        let {showHidden} = this.state;

        if (!account) {
            return null;
        }

        let includedOrders;


        let totalBalance = (<span>${this.props.trustyPortfolio.totalUSDShare}</span>)


        return (
            <div className="grid-content trusty_profile_info trusty_bottom_fix_space" style={{overflowX: "hidden"}}>
                <div className="content-block small-12">
                    <div className="generic-bordered-box">
                        <br/>
                        <div className="trusty_total_funds">
                            <div>
                                <p>{this.props.account_name} TOTAL FUNDS</p>
                                <h3 style={{textAlign: "center"}}>{totalBalance}</h3>
                            </div>
                        </div> 
                        {
                            this.props.trustyPortfolio.totalUSDShare ? (
                                <div onClick={()=>this.props.router.push("/transactions")}>
                                    <RecentTransactions
                                        accountsList={Immutable.fromJS([account.get("id")])}
                                        compactView={true}
                                        showMore={false}
                                        fullHeight={true}
                                        limit={3}
                                        showFilters={true}
                                        dashboard
                                    />
                                </div>
                            ) : null
                        }
                        <button className="trusty_full_width_button" onClick={this._managePortfolio()}>MANAGE FUND</button>
                        <table className="table trusty_table">
                            <thead>
                                <tr>
                                    <th style={{textAlign: "left"}}><Translate component="span" content="account.asset" /></th>
                                    <th style={{textAlign: "right"}}><Translate component="span" content="account.share" /></th>
                                    <th style={{textAlign: "right"}}><span>$VALUE</span></th>
                                    <th style={{textAlign: "right"}}><Translate component="span" content="account.chng" /></th>   
                                </tr>
                            </thead>
                            <tbody>
                                {this._renderTrustyBalaces()}
                                {includedOrders}
                            </tbody>
                        </table>
                        <SettleModal ref="settlement_modal" asset={this.state.settleAsset} account={account.get("name")}/>
                    </div>
                </div>
            </div>

        );
    }
}


let AccountOverviewConnect  = connect(AccountOverview, {
    listenTo() {
        return [PortfolioStore];
    },
    getProps() {
        return {
            trustyPortfolio: PortfolioStore.getState()
        };
    }
});


AccountOverview = BindToChainState(AccountOverviewConnect);

class BalanceWrapper extends React.Component {

    static propTypes = {
        balances: ChainTypes.ChainObjectsList,
        orders: ChainTypes.ChainObjectsList,
    };

    static defaultProps = {
        balances: Immutable.List(),
        orders: Immutable.List(),
    };
    
    render() {
        let balanceAssets = this.props.balances.map(b => {
            return b && b.get("asset_type");
        }).filter(b => !!b);

        let ordersByAsset = this.props.orders.reduce((orders, o) => {
            let asset_id = o.getIn(["sell_price", "base", "asset_id"]);
            if (!orders[asset_id]) orders[asset_id] = 0;
            orders[asset_id] += parseInt(o.get("for_sale"), 10);
            return orders;
        }, {});

        for (let id in ordersByAsset) {
            if (balanceAssets.indexOf(id) === -1) {
                balanceAssets.push(id);
            }
        }

        return (
            <AccountOverview {...this.state} {...this.props} orders={ordersByAsset} balanceAssets={Immutable.List(balanceAssets)} />
        );
    };
}


export default BindToChainState(BalanceWrapper);



