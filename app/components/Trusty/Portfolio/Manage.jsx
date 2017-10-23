import React from "react";
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import PortfolioStore from "stores/PortfolioStore";
import './styles.css';

class ManagePortfolio extends React.Component {
	constructor(props){
		super();
	}

	renderManualTab(){
		let portfolio = PortfolioStore.getPortfolio();
		let renderedPortfolio = this.renderPortfolioList(portfolio);
		
		return (
			<TabContent for="tab1">
				<h5 style={{textAlign: "center"}}>Please select shares of assets in your portfolio</h5>
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
						<td>100%</td>
					</tr>
					</tbody>
				</table>
				<div className="bottomBlock">
					<h5 style={{textAlign: "center"}}>Structure above is calculated as average of all Trusty users</h5>
					<div className="trusty_inline_button">
                            <button>UPDATE PORTFOLIO</button>                        
                    </div>
				</div>
			</TabContent>
		);
	}

	renderShare(share){
		return (
			<span>{share*100}%</span>
		)
	}

	renderPortfolioList(assetList){
		let portfolio = [];
		assetList.forEach( asset => {
			portfolio.push(
				<tr key={asset.asset}>
					<td>
						{asset.asset}
					</td>
					<td>
						{this.renderShare(asset.share)}
					</td>
				</tr>
			)
		});
		return portfolio
	}

	render(){
		return (
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
        );
	}
}

export default ManagePortfolio;