import React from "react";
import Immutable from "immutable";
import Translate from "react-translate-component";
import BalanceComponent from "components/Utility/BalanceComponent";
import TotalBalanceValue from "components/Utility/TotalBalanceValue";
import SettleModal from "components/Modal/SettleModal";
import {BalanceValueComponent, EquivalentValueComponent} from "components/Utility/EquivalentValueComponent";
import AssetName from "components/Utility/AssetName";
import CollateralPosition from "components/Blockchain/CollateralPosition";
import { RecentTransactions } from "components/Account/RecentTransactions";
import Proposals from "components/Account/Proposals";
import {ChainStore} from "bitsharesjs/es";
import SettingsActions from "actions/SettingsActions";
import assetUtils from "common/asset_utils";
import counterpart from "counterpart";
import Icon from "components/Icon/Icon";
import {Link} from "react-router";
import ChainTypes from "components/Utility/ChainTypes";
import FormattedAsset from "components/Utility/FormattedAsset";
import BindToChainState from "components/Utility/BindToChainState";
import utils from "common/utils";
import ReactTooltip from "react-tooltip";
import SimpleDepositWithdraw from "components/Dashboard/SimpleDepositWithdraw";
import SimpleDepositBlocktradesBridge from "components/Dashboard/SimpleDepositBlocktradesBridge";
import { Apis } from "bitsharesjs-ws";
import GatewayActions from "actions/GatewayActions";

class AccountOverview extends React.Component {

    static propTypes = {
        balanceAssets: ChainTypes.ChainAssetsList
    };

    constructor() {
        super();
        this.state = {
            settleAsset: "1.3.0",
            showHidden: false,
            depositAsset: null,
            withdrawAsset: null,
            bridgeAsset: null,
            alwaysShowAssets: [
                "BTS",
                "USD",
                "CNY",
                "OPEN.BTC",
                "OPEN.USDT",
                "OPEN.ETH",
                "OPEN.DASH",
                "OPEN.LTC",
                "OPEN.GOLD",
                "TRFND"                
            ]
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !utils.are_equal_shallow(nextProps.balanceAssets, this.props.balanceAssets) ||
            !utils.are_equal_shallow(nextProps.backedCoins, this.props.backedCoins) ||
            !utils.are_equal_shallow(nextProps.balances, this.props.balances) ||
            nextProps.account !== this.props.account ||
            nextProps.settings !== this.props.settings ||
            nextProps.hiddenAssets !== this.props.hiddenAssets ||
            !utils.are_equal_shallow(nextState, this.state)
        );
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

    _showDepositWithdraw(action, asset, fiatModal, e) {
        e.preventDefault();
        this.setState({
            [action === "bridge_modal" ? "bridgeAsset" : action === "deposit_modal" ? "depositAsset" : "withdrawAsset"]: asset,
            fiatModal
        }, () => {
            this.refs[action].show();
        });
    }

    _getSeparator(render) {
        return render ? <span>&nbsp;|&nbsp;</span> : null;
    }

    _onNavigate(route, e) {
        e.preventDefault();
        this.props.router.push(route);
    }

    _renderBalances(balanceList, optionalAssets, visible) {
        const core_asset = ChainStore.getAsset("1.3.0");
        let {settings, hiddenAssets, orders} = this.props;

        let preferredUnit = settings.get("unit") || "1.3.0";
        let showAssetPercent = settings.get("showAssetPercent", true);

        let balances = [], openOrders = [];
        balanceList.forEach( balance => {
            let balanceObject = ChainStore.getObject(balance);
            let asset_type = balanceObject.get("asset_type");
            let asset = ChainStore.getObject(asset_type);


            let assetInfoLinks;
            let marketLink, directMarketLink;
            let symbol = "";
            if (!asset) return null;

            const assetName = asset.get("symbol");
            const notCore = asset.get("id") !== "1.3.0";
            let {market} = assetUtils.parseDescription(asset.getIn(["options", "description"]));
            symbol = asset.get("symbol");

            if (this.state.alwaysShowAssets.indexOf(symbol) == -1) return;

            console.log(symbol)


            if (symbol.indexOf("OPEN.") !== -1 && !market) market = "USD";
            let preferredMarket = market ? market : core_asset ? core_asset.get("symbol") : "BTS";

            /* Table content */
            const assetDetailURL = `/asset/${asset.get("symbol")}`;
            const marketURL = `/market/${asset.get("symbol")}_${preferredMarket}`;

            marketLink = notCore ? <a href={marketURL} onClick={this._onNavigate.bind(this, marketURL)}><AssetName name={asset.get("symbol")} /> : <AssetName name={preferredMarket} /></a> : null;
            directMarketLink = notCore ? <Link to={`/market/${asset.get("symbol")}_${preferredMarket}`}><Translate content="account.trade" /></Link> : null;
            
            const includeAsset = !hiddenAssets.includes(asset_type);
            const hasBalance = !!balanceObject.get("balance");
            const hasOnOrder = !!orders[asset_type];
            const canDepositWithdraw = !!this.props.backedCoins.get("OPEN", []).find(a => a.symbol === asset.get("symbol"));
            const canWithdraw = canDepositWithdraw && (hasBalance && balanceObject.get("balance") != 0);
            const canBuy = !!this.props.bridgeCoins.get(symbol);

            let onOrders = hasOnOrder ? <FormattedAsset amount={orders[asset_type]} asset={asset_type} /> : null;

            if (hasOnOrder) {
                let goToLink = <Link to={`/account/${this.props.account.get("name")}/orders`}><Translate content="account.see_open" /></Link>;
                openOrders.push(
                    <tr key={asset.get("symbol")} style={{maxWidth: "100rem"}}>
                        <td style={{textAlign: "right"}}>
                            <div className="tooltip" data-place="bottom" data-tip={counterpart.translate("account.in_open", {asset: symbol})} style={{paddingTop: 8}}>{onOrders}</div>
                        </td>
                        <td style={{textAlign: "right"}} className="column-hide-small">
                            <div className="tooltip" data-place="bottom" data-tip={counterpart.translate("account.in_open_value", {asset: symbol})} style={{paddingTop: 8}}>
                                <EquivalentValueComponent amount={orders[asset_type]} fromAsset={asset_type} noDecimals={true} toAsset={preferredUnit}/>
                            </div>
                        </td>
                        <td colSpan="3" style={{textAlign: "center"}}>
                            {directMarketLink}
                            {directMarketLink ? <span> | </span> : null}
                            {goToLink}
                        </td>
                    </tr>
                );
            }
            balances.push(
                <tr key={asset.get("symbol")} style={{maxWidth: "100rem"}}>
                    <td style={{textAlign: "right"}}>
                        {hasBalance || hasOnOrder ? <BalanceComponent balance={balance} assetInfo={assetInfoLinks}/> : null}
                    </td>
                    <td style={{textAlign: "right"}} className="column-hide-small">
                        {hasBalance || hasOnOrder ? <BalanceValueComponent balance={balance} toAsset={preferredUnit}/> : null}
                    </td>
                    {showAssetPercent ? <td style={{textAlign: "right"}}>
                        {hasBalance ? <BalanceComponent balance={balance} asPercentage={true}/> : null}
                    </td> : null}
                    <td style={{textAlign: "center"}}>
                        {directMarketLink}
                    </td>
                </tr>
            );
        });

        const currentIndex = balances.length;

        if (optionalAssets) {
            optionalAssets.filter(asset => {
                let isAvailable = false;
                this.props.backedCoins.get("OPEN", []).forEach(coin => {
                    if (coin && (coin.symbol === asset)) {
                        isAvailable = true;
                    }
                });
                if (!!this.props.bridgeCoins.get(asset)) {
                    isAvailable = true;
                }
                let keep = true;
                balances.forEach(a => {
                    if (a.key === asset) keep = false;
                });

                return keep && isAvailable;
            }).forEach(a => {
                let asset = ChainStore.getAsset(a);


                if (asset && this.props.isMyAccount) {
                    const includeAsset = !hiddenAssets.includes(asset.get("id"));

                    const canDepositWithdraw = !!this.props.backedCoins.get("OPEN", []).find(a => a.symbol === asset.get("symbol"));
                    const canBuy = !!this.props.bridgeCoins.get(asset.get("symbol"));

                    const notCore = asset.get("id") !== "1.3.0";
                    let {market} = assetUtils.parseDescription(asset.getIn(["options", "description"]));
                    if (asset.get("symbol").indexOf("OPEN.") !== -1 && !market) market = "USD";
                    let preferredMarket = market ? market : core_asset ? core_asset.get("symbol") : "BTS";
                    let directMarketLink = notCore ? <Link to={`/market/${asset.get("symbol")}_${preferredMarket}`}><Translate content="account.trade" /></Link> : null;
                    if (includeAsset && visible || !includeAsset && !visible) balances.push(
                        <tr key={"zz" + a} style={{maxWidth: "100rem"}}>
                            <td style={{textAlign: "right"}}>
                                <AssetName name={a} />
                            </td>
                            <td style={{textAlign: "center"}}>
                                {directMarketLink}
                            </td>
                            <td style={{textAlign: "center"}} className="column-hide-small" data-place="bottom" data-tip={counterpart.translate("tooltip." + (includeAsset ? "hide_asset" : "show_asset"))}>
                                <a style={{marginRight: 0}} className={includeAsset ? "order-cancel" : "action-plus"} onClick={this._hideAsset.bind(this, asset.get("id"), includeAsset)}>
                                    <Icon name={includeAsset ? "cross-circle" : "plus-circle"} className="icon-14px" />
                                </a>
                            </td>
                        </tr>
                    );
                }
            });
        }

        function sortAlphabetic(a, b) {
            if (a.key > b.key) return 1;
            if (a.key < b.key) return -1;
            return 0;
        };

        balances.sort(sortAlphabetic);
        openOrders.sort(sortAlphabetic);
        return {balances, openOrders};
    }

    _toggleHiddenAssets() {
        this.setState({
            showHidden: !this.state.showHidden
        });
    }

    render() {
        let {account, hiddenAssets, settings, orders} = this.props;
        let {showHidden} = this.state;

        if (!account) {
            return null;
        }

        let call_orders = [], collateral = 0, debt = {};

        if (account.toJS && account.has("call_orders")) call_orders = account.get("call_orders").toJS();
        let includedBalances, hiddenBalances, includedOrders, hiddenOrders, hasOpenOrders = false;
        let account_balances = account.get("balances");

        let includedBalancesList = Immutable.List(), hiddenBalancesList = Immutable.List();
        call_orders.forEach( (callID) => {
            let position = ChainStore.getObject(callID);
            if (position) {
                collateral += parseInt(position.get("collateral"), 10);

                let debtAsset = position.getIn(["call_price", "quote", "asset_id"]);
                if (!debt[debtAsset]) {
                    debt[debtAsset] = parseInt(position.get("debt"), 10);
                } else {
                    debt[debtAsset] += parseInt(position.get("debt"), 10);
                }
            }
        });

        if (account_balances) {
            // Filter out balance objects that have 0 balance or are not included in open orders
            account_balances = account_balances.filter((a, index) => {
                let balanceObject = ChainStore.getObject(a);
                if (balanceObject && (!balanceObject.get("balance") && !orders[index])) {
                    return false;
                } else {
                    return true;
                }
            });

            // Separate balances into hidden and included
            account_balances.forEach((a, asset_type) => {
                if (hiddenAssets.includes(asset_type)) {
                    hiddenBalancesList = hiddenBalancesList.push(a);
                } else {
                    includedBalancesList = includedBalancesList.push(a);
                }
            });

            console.log("SHOW",this.state.alwaysShowAssets)

            let included = this._renderBalances(includedBalancesList, this.state.alwaysShowAssets, true);
            includedBalances = included.balances;
            includedOrders = included.openOrders;
            let hidden = this._renderBalances(hiddenBalancesList, this.state.alwaysShowAssets);
            hiddenBalances = hidden.balances;
            hiddenOrders = hidden.openOrders;

            hasOpenOrders = hiddenOrders.length || includedOrders.length;
        }

        if (hiddenBalances) {
            hiddenBalances.unshift(<tr style={{backgroundColor: "transparent"}} key="hidden"><td style={{height: 20}} colSpan="4"></td></tr>);
        }

        let totalBalanceList = includedBalancesList.concat(hiddenBalancesList);
        let label = 'TOTAL FUNDS'

        let totalBalance = totalBalanceList.size ?
            <TotalBalanceValue
                balances={totalBalanceList}
                openOrders={orders}
                debt={debt}
                collateral={collateral}
            /> : null;

        let showAssetPercent = settings.get("showAssetPercent", false);

        // Find the current Openledger coins
        const currentDepositAsset = this.props.backedCoins.get("OPEN", []).find(c => {
            return c.symbol === this.state.depositAsset;
        }) || {};
        const currentWithdrawAsset = this.props.backedCoins.get("OPEN", []).find(c => {
            return c.symbol === this.state.withdrawAsset;
        }) || {};
        const currentBridges = this.props.bridgeCoins.get(this.state.bridgeAsset) || null;

        return (
            <div className="grid-content" style={{overflowX: "hidden"}}>
                <div className="content-block small-12">
                    <div className="generic-bordered-box">
                        <h3>{totalBalance}</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    {/*<th><Translate component="span" content="modal.settle.submit" /></th>*/}
                                    <th style={{textAlign: "right"}}><Translate component="span" content="account.asset" /></th>
                                    {/*<<th style={{textAlign: "right"}}><Translate component="span" content="account.bts_market" /></th>*/}
                                    <th style={{textAlign: "right"}} className="column-hide-small"><Translate component="span" content="account.eq_value" /></th>
                                    {showAssetPercent ? <th style={{textAlign: "right"}}><Translate component="span" content="account.percent" /></th> : null}
                                    <th style={{textAlign: "center"}}>
                                        <Translate content="account.market_actions" />
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {includedBalances}

                                {/* Open orders */}
                                {hasOpenOrders ? <tr style={{backgroundColor: "transparent"}}><td style={{height: 20}} colSpan="4"></td></tr> : null}
                                {hasOpenOrders ? <tr style={{backgroundColor: "transparent"}}>
                                    <td colSpan="5" className="no-padding">
                                        <div className="block-content-header">
                                            <Translate content="account.open_orders" />
                                        </div>
                                    </td>
                                </tr>  : null}
                                {includedOrders}
                                {hiddenOrders}
                            </tbody>
                        </table>
                        <SettleModal ref="settlement_modal" asset={this.state.settleAsset} account={account.get("name")}/>
                    </div>
                </div>

                {call_orders.length > 0 ? (

                <div className="content-block">
                    <div className="generic-bordered-box">
                        <div className="block-content-header">
                            <Translate content="account.collaterals" />
                        </div>
                        <CollateralPosition callOrders={call_orders} account={account} />
                    </div>
                </div>) : null}

                {account.get("proposals") && account.get("proposals").size ?
                <div className="content-block">
                    <div className="block-content-header">
                        <Translate content="explorer.proposals.title" account={account.get("id")} />
                    </div>
                    <Proposals account={account.get("id")}/>
                </div> : null}

                <div className="content-block">
                    <RecentTransactions
                        accountsList={Immutable.fromJS([account.get("id")])}
                        compactView={false}
                        showMore={true}
                        fullHeight={true}
                        limit={10}
                        showFilters={true}
                    />
                </div>

                {/* Deposit Modal */}
                <SimpleDepositWithdraw
                    ref="deposit_modal"
                    action="deposit"
                    fiatModal={this.state.fiatModal}
                    account={this.props.account.get("name")}
                    sender={this.props.account.get("id")}
                    asset={this.state.depositAsset}
                    modalId="simple_deposit_modal"
                    balances={this.props.balances}
                    {...currentDepositAsset}
                />

                {/* Withdraw Modal */}
                <SimpleDepositWithdraw
                    ref="withdraw_modal"
                    action="withdraw"
                    fiatModal={this.state.fiatModal}
                    account={this.props.account.get("name")}
                    sender={this.props.account.get("id")}
                    asset={this.state.withdrawAsset}
                    modalId="simple_withdraw_modal"
                    balances={this.props.balances}
                    {...currentWithdrawAsset}
                />

                {/* Bridge modal */}
                <SimpleDepositBlocktradesBridge
                    ref="bridge_modal"
                    action="deposit"
                    account={this.props.account.get("name")}
                    sender={this.props.account.get("id")}
                    asset={this.state.bridgeAsset}
                    modalId="simple_bridge_modal"
                    balances={this.props.balances}
                    bridges={currentBridges}
                />
            </div>

        );
    }
}

AccountOverview = BindToChainState(AccountOverview);

class BalanceWrapper extends React.Component {

    static propTypes = {
        balances: ChainTypes.ChainObjectsList,
        orders: ChainTypes.ChainObjectsList
    };

    static defaultProps = {
        balances: Immutable.List(),
        orders: Immutable.List()
    };

    componentWillMount() {
        if (Apis.instance().chain_id.substr(0, 8) === "4018d784") { // Only fetch this when on BTS main net
            GatewayActions.fetchCoins();
            GatewayActions.fetchBridgeCoins();
        }
    }

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
