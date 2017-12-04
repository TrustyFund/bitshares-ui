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
import BaseModal from "components/Modal/BaseModal"
import ZfApi from "react-foundation-apps/src/utils/foundation-api";
import Hammer from "react-hammerjs";

class ManagePortfolio extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired,
    };


	constructor(){
		super();

		this.state = {
			valid: false
		}
		this.renderTotalShare = this.renderTotalShare.bind(this);
		this.getButtonClass = this.getButtonClass.bind(this);
		this.updatePortfolio = this.updatePortfolio.bind(this);
		this.renderManualTab = this.renderManualTab.bind(this);
		this.renderPortfolioList = this.renderPortfolioList.bind(this);
		this.suggestPortfolio = this.suggestPortfolio.bind(this);
		this.onPressUp = this.onPressUp.bind(this)
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
					</tbody>
				</table>
				<div className="_total_future_share">{this.renderTotalShare(this.props.portfolio.totalPercentageFutureShare)}</div>
				<div className="trusty_inline_button_reverse" style={{marginBottom:".8rem"}}>
		            <button className="wide" onClick={this.suggestPortfolio}>SUGGEST PORTFOLIO</button>                        
		        </div>
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

	onPress(asset, way, faster){
		if(this.timeID)clearInterval(this.timeID)
		this.timeID = setInterval(()=>{
			let up = this._decrementAsset.bind(this, asset)
			let down = this._incrementAsset.bind(this, asset)
			way ? up() : down()
		}, 150)
	}
	onPressUp(){
		if(this.timeID)clearInterval(this.timeID)
	}

	renderPortfolioList(assetList = [] ){
		let renderPortfolio = [];
		let arrow = (
			<span className="trusty_portfolio_arrow">
				<Icon name="trusty_portfolio_arrow_right"/>
			</span>
		)

		if(assetList == null || !this.props.portfolioInit) return null;


		//TODO: сделать сдесь ссылку на описание Ассета
		assetList.forEach( (asset, i) => {
			let name = "portfolio_item _" + i
			let assetClass = this.getAssetClass.bind(this,asset);
			renderPortfolio.push(
				<tr key={asset.assetShortName}>
					<td>
						<div className={name}>
							<div className="fake_line_height" />
							<span>{asset.assetShortName}</span>	
							{arrow}
						</div>
					</td>
					<td>
						<div className={cname(name, {"_red": false })}>
							<div className="fake_line_height" />
							<Hammer onPressUp={this.onPressUp} onMouseUp={this.onPressUp} onPress={this.onPress.bind(this, asset,true)}>
								<a  className={cname("_minus",assetClass())} onClick={this._decrementAsset.bind(this, asset)}><Icon name="trusty_minus"/></a>
							</Hammer>
							
							{this.renderShare(asset.futureShare,assetClass())}
							<Hammer onPressUp={this.onPressUp} onMouseUp={this.onPressUp} onPress={this.onPress.bind(this, asset,false)}>
								<a  className={cname("_plus",assetClass())} onClick={this._incrementAsset.bind(this, asset)}><Icon name="trusty_plus"/></a>
							</Hammer>
						</div>
					</td>
				</tr>
			)
		});
		return renderPortfolio
	}

	_incrementAsset(asset){
		PortfolioActions.incrementAsset(asset.assetShortName);
	}

	_decrementAsset(asset){

		switch(asset.assetShortName) {
			case "BTS": 
				if(asset.futureShare == 1) {
					this.setState({
						modalText: `
							You are required to keep at least 1% of total fund in BTS tokens, in order to pay transaction fees of BitShares blockchain. You can sell all of the BTS upon full withdrawal of the fund
						`	
					})
					ZfApi.publish("trusty_manage_oops", "open");
				} else {
					PortfolioActions.decrementAsset(asset.assetShortName);
				}
				break;
			case "TRFND": 
				if(asset.futureShare == 3 ) {
					this.setState({
						modalText: `
							You are required to keep at least 3% of total fund in TRFND tokens, in order to pay for wealth management solutions. You can sell all of the TRFND upon full withdrawal of the fund
						`	
					})
					ZfApi.publish("trusty_manage_oops", "open");
				} else {
					PortfolioActions.decrementAsset(asset.assetShortName);
				}
				break;
			default: PortfolioActions.decrementAsset(asset.assetShortName);
	
		}

		
	}

	getAssetClass(asset){
		let initAsset = this.props.portfolioInit.filter((filterAsset)=> filterAsset.assetFullName == asset.assetFullName)[0];
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
		let secondTab = 
			<div className="manage_second_tab">
				<img src={require("./imgs/manage_fund_index_blank.png")}/>
				<p>Soon you will be able to<br/> automatically rebalance<br/>fund to index of top-20,<br/> 10 or 5 cryptos</p>
			</div>


		let thirdTab = 
			<div className="manage_third_tab">
				<img src={require("./imgs/manage_fund_mirror_blank.png")}/>
				<p>Soon you will be able to<br/> automatically mirror<br/>trade of ranked<br/>fund managers</p>
			</div>

		return (
			<div className="trusty_portfolio_tabs trusty_bottom_fix_space">
				<Tabs>
					<div className="tabs-header-container">
					    <TabLink to="tab1">MANUAL</TabLink>
					    <TabLink to="tab2" className="">INDEX</TabLink>
					    <TabLink to="tab3">MIRROR</TabLink>			 
				    </div>
				    <div className="tabs-content-container">
					    {this.renderManualTab()}
					    <TabContent for="tab2">{secondTab}</TabContent>
					    <TabContent for="tab3">{thirdTab}</TabContent>
				    </div>
				</Tabs>

				<ManageModal router={this.props.router} id="trusty_manage_modal"/>

				<BaseModal id={"trusty_manage_oops"}>
					<p>{this.state.modalText}</p>
				</BaseModal>
			</div>
        );
	}
}

ManagePortfolio = BindToChainState(ManagePortfolio, {keep_updating: true, show_loader: true});

class ManagePortfolioWrapper extends React.Component {
    render () {
        let account_name = AccountStore.getMyAccounts()[0];
        this.props.params.account_name = account_name;
        return <ManagePortfolio {...this.props} portfolio={PortfolioStore.getState()} portfolioInit={this.portfolioInit} account_name={account_name}/>;
    }

    componentWillMount(){
    	let initPortfolio = PortfolioStore.getState().data.slice();
    	let initOnce = [];
    	initPortfolio.forEach(a=>initOnce.push({
    		assetFullName: a.assetFullName,
    		futureShare: a.futureShare
    	}));

    	this.portfolioInit = initOnce;
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