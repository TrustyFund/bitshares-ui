import React from "react";
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import PortfolioStore from "stores/PortfolioStore";
import './styles.scss';
import cname from "classnames";
import Icon from 'components/Icon/Icon';
import { connect } from "alt-react";
import ChainTypes from "components/Utility/ChainTypes";
import BindToChainState from "components/Utility/BindToChainState";
import AccountStore from "stores/AccountStore";
import {ChainStore} from "bitsharesjs/es";
import PortfolioActions from "actions/PortfolioActions"
import Immutable from "immutable";

import ManageModal from "components/Trusty/ManageModal";


class ManagePortfolio extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
    };


	constructor(){
		super();

		this.state = {
			valid: false,
			initPortfolio: false,
		}
		this.renderTotalShare = this.renderTotalShare.bind(this);
		this.getButtonClass = this.getButtonClass.bind(this);
		this.updatePortfolio = this.updatePortfolio.bind(this);
		this.renderManualTab = this.renderManualTab.bind(this);
		this.renderPortfolioList = this.renderPortfolioList.bind(this);
	}

	renderManualTab(){
		let renderedPortfolio = this.renderPortfolioList(this.props.portfolio.data.slice());
		return (
			<TabContent for="tab1">
				<h5 style={{textAlign: "center"}}>Please select shares of assets<br/> in your portfolio</h5>
				<table className="managePortfolio"> 
					<thead>
						<tr>
							<th>
								Asset
							</th>
							<th>
								Share
							</th>
						</tr>
					</thead>
					<tbody>
					{renderedPortfolio}
					<tr>
						<td></td>
						<td>{this.renderTotalShare(this.props.trustyPortfolio.totalPercentageFutureShare)}</td>
					</tr>
					</tbody>
				</table>
				<br/>
				<div className="trusty_inline_button_reverse">
		            <button className={this.getButtonClass()} onClick={this.suggestPortfolio}>SUGGEST PORTFOLIO</button>                        
		        </div>
		        <br/>
				<div className="trusty_inline_button">
		            <button className={this.getButtonClass()} onClick={this.updatePortfolio}>UPDATE PORTFOLIO</button>                        
		        </div>
			</TabContent>
		);
	}

	updatePortfolio(){
		PortfolioActions.updatePortfolio(this.props.account);
	}

	suggestPortfolio(){
		PortfolioActions.suggestPortfolio();
	}

	renderShare(share,className){
		return (
			<span className={className}>{share}%</span>
		)
	}

	renderTotalShare(total){
		let className = (total != 100) ? "wrong-total" : "";
		return (
			<span className={className}>{total}%</span>
		)
	}

	getButtonClass(){
		return (this.props.porfolioTotalShare == 100) ? "wide" : "disabled wide";
	}

	renderPortfolioList(assetList = [] ){
		let renderPortfolio = [];
		let arrow = (
			<span className="trusty_portfolio_arrow">
				<Icon name="trusty_portfolio_arrow_right"/>
			</span>
		)

		if(assetList == null || !this.state.initPortfolio) return null;


		//TODO: сделать сдесь ссылку на описание Ассета
		assetList.forEach( (asset, i) => {
			let name = "portfolio_item _" + i
			let assetClass = this.getAssetClass.bind(this,asset);
			renderPortfolio.push(
				<tr key={asset.assetShortName}>
					<td>
						<div className={name}>{asset.assetShortName}{arrow}</div>
					</td>
					<td>
						<div className={cname(name, {"_red": false })}>
							<a  className="_minus" onClick={this._decrementAsset.bind(this, asset)}>- </a>
							{this.renderShare(asset.futureShare,assetClass())}
							<a  className="_plus" onClick={this._incrementAsset.bind(this, asset)}> +</a>
						</div>
					</td>
				</tr>
			)
		});
		return renderPortfolio
	}

	componentWillMount(){
		this.state.initPortfolio = this.props.portfolio.data.slice();
	}

	_incrementAsset(asset){
		console.log("INIT",this.state.initPortfolio[0].futureShare);
		console.log("CURRENT",this.props.portfolio.data[0].futureShare);
		PortfolioActions.incrementAsset(asset.assetShortName);
	}

	_decrementAsset(asset){
		PortfolioActions.decrementAsset(asset.assetShortName);
	}

	getAssetClass(asset){
		let initAsset = this.state.initPortfolio.filter((filterAsset)=> filterAsset.assetFullName == asset.assetFullName)[0];
		if (!initAsset) return "normal portfolio_asset";

		let initShare = initAsset.futureShare;

		let className = "normal";
		if (asset.futureShare > initShare){
			className = "greater";
		}else if(asset.futureShare < initShare){
			className = "less";
		}else{
			className = "normal";
		}
		return className + " portfolio_asset";
	}

	render(){

		return (
			<div className="trusty_portfolio_tabs">
				<Tabs>
					<div className="tabs-header-container">
					    <TabLink to="tab1">MANUAL</TabLink>
					    <TabLink to="tab2" className="">INDEX</TabLink>
					    <TabLink to="tab3">MIRROR</TabLink>			 
				    </div>
				    <div className="tabs-content-container">
					    {this.renderManualTab()}
					    <TabContent for="tab2">/* content for tab #2 */</TabContent>
					    <TabContent for="tab3">/* content for tab #3 */</TabContent>
				    </div>
				</Tabs>

				<ManageModal router={this.props.router} id="trusty_manage_modal"/>
			</div>
        );
	}
}

ManagePortfolio = BindToChainState(ManagePortfolio, {keep_updating: true, show_loader: true});

class ManagePortfolioWrapper extends React.Component {
    render () {
        let account_name = AccountStore.getMyAccounts()[0];
        this.props.params.account_name = account_name;
        return <ManagePortfolio {...this.props} portfolio={PortfolioStore.getState()} account_name={account_name}/>;
    }
}

export default connect(ManagePortfolioWrapper, {
    listenTo() {
        return [AccountStore, PortfolioStore];
    },
    getProps() {
        return {
            linkedAccounts: AccountStore.getState().linkedAccounts,
            searchAccounts: AccountStore.getState().searchAccounts,
            myAccounts:  AccountStore.getState().myAccounts,
            trustyPortfolio: PortfolioStore.getState(),
            porfolioTotalShare: PortfolioStore.getState().totalPercentageFutureShare,
        };
    }
});