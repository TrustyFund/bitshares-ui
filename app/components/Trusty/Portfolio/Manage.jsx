import React from "react";
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import PortfolioStore from "stores/PortfolioStore";
import './styles.scss';
import cname from "classnames";
import Icon from 'components/Icon/Icon'

class ManagePortfolio extends React.Component {
	constructor(props){
		super();
	}

	renderManualTab(){
		let portfolio = PortfolioStore.getPortfolio();
		let renderedPortfolio = this.renderPortfolioList(portfolio.data);		
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
						<td>{this.renderShare(PortfolioStore.getTotalPercentage())}</td>
					</tr>
					</tbody>
				</table>
				<br/>
				<h5 style={{textAlign: "center"}}>Structure above is calculated as<br/> average of all Trusty users</h5>
				<div className="trusty_inline_button">
		            <button className="wide">UPDATE PORTFOLIO</button>                        
		        </div>
			</TabContent>
		);
	}

	renderShare(share){
		return (
			<span>{share}%</span>
		)
	}

	renderPortfolioList(assetList){
		let portfolio = [];
		let arrow = (
			<span className="trusty_portfolio_arrow">
				<Icon name="trusty_portfolio_arrow_right"/>
				{/*<i className="arrowright"></i>*/}
			</span>
		)
		
		//TODO: сделать сдесь ссылку на описание Ассета
		assetList.forEach( (asset, i) => {
			let name = "portfolio_item _" + i
			portfolio.push(
				<tr key={asset.asset}>
					<td>
						<div className={name}>{asset.asset}{arrow}</div>
					</td>
					<td>
						<div className={cname(name, {"_red": false })}>
							<a  className="_minus" onClick={this._decrementAsset.bind(this, asset.asset)}>- </a>
							{this.renderShare(asset.share)}
							<a  className="_plus" onClick={this._incrementAsset.bind(this, asset.asset)}> +</a>
						</div>
					</td>
				</tr>
			)
		});
		return portfolio
	}

	_incrementAsset(asset){
		PortfolioStore.incrementAsset(asset);
		this.forceUpdate();
	}

	_decrementAsset(asset){
		PortfolioStore.decrementAsset(asset);
		this.forceUpdate();
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

export default ManagePortfolio;