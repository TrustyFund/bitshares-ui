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

class ManagePortfolio extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
    };

	constructor(){
		super();

		this.state = {
			valid: false,
			initPortfolio: PortfolioStore.getPortfolio()
		}
		this.renderTotalShare = this.renderTotalShare.bind(this);
		this.getButtonClass = this.getButtonClass.bind(this);
		this.updatePortfolio = this.updatePortfolio.bind(this);
	}

	renderManualTab(){
		let portfolio = PortfolioStore.getPortfolio();
		let renderedPortfolio = this.renderPortfolioList(this.props.portfolioData/*portfolio.data*/);	
		let total = PortfolioStore.getTotalPercentage();	
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
						<td>{this.renderTotalShare(this.props.porfolioTotalShare)}</td>
					</tr>
					</tbody>
				</table>
				<br/>
				<h5 style={{textAlign: "center"}}>Structure above is calculated as<br/> average of all Trusty users</h5>
				<div className="trusty_inline_button">
		            <button className={this.getButtonClass()} onClick={this.updatePortfolio}>UPDATE PORTFOLIO</button>                        
		        </div>
			</TabContent>
		);
	}

	updatePortfolio(){
		PortfolioStore.updatePortfolio(this.props.account);
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
		return (PortfolioStore.isValid()) ? "wide" : "disabled wide";
	}

	renderPortfolioList(assetList=[]){
		let portfolio = [];
		let arrow = (
			<span className="trusty_portfolio_arrow">
				<Icon name="trusty_portfolio_arrow_right"/>
			</span>
		)
		if(assetList == null) return null
		//TODO: сделать сдесь ссылку на описание Ассета
		assetList.forEach( (asset, i) => {
			let name = "portfolio_item _" + i
			let assetClass = this.getAssetClass.bind(this,asset);
			portfolio.push(
				<tr key={asset.assetShortName}>
					<td>
						<div className={name}>{asset.assetShortName}{arrow}</div>
					</td>
					<td>
						<div className={cname(name, {"_red": false })}>
							<a  className="_minus" onClick={this._decrementAsset.bind(this, asset)}>- </a>
							{this.renderShare(asset.futureShare,assetClass(asset))}
							<a  className="_plus" onClick={this._incrementAsset.bind(this, asset)}> +</a>
						</div>
					</td>
				</tr>
			)
		});
		return portfolio
	}

	_incrementAsset(asset){
		PortfolioActions.incrementAsset(asset.assetShortName)
		// PortfolioStore.incrementAsset(asset.assetShortName);
		// this.forceUpdate();
	}

	_decrementAsset(asset){
		PortfolioActions.decrementAsset(asset.assetShortName)
		// PortfolioStore.decrementAsset(asset.assetShortName);
		// this.forceUpdate();
	}

	getAssetClass(asset){
		let className = "normal";
		let assetIndex = this.state.initPortfolio.map.indexOf(asset.asset);
		if(this.state.initPortfolio.data[assetIndex]) {
			let loadedShare = this.state.initPortfolio.data[assetIndex].futureShare;
			if (asset.futureShare > loadedShare){
				className = "greater";
			}else if(asset.futureShare < loadedShare){
				className = "less";
			}else{
				className = "normal";
			}
			
		}
		return className;
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
			</div>
        );
	}
}

ManagePortfolio = BindToChainState(ManagePortfolio, {keep_updating: true, show_loader: true});

class ManagePortfolioWrapper extends React.Component {
    render () {
        let account_name = AccountStore.getMyAccounts()[0];
        this.props.params.account_name = account_name;
        return <ManagePortfolio {...this.props} account_name={account_name}/>;
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
            portfolioData: PortfolioStore.getState().data,
            porfolioTotalShare: PortfolioStore.getState().totalPercentageFutureShare,
        };
    }
});