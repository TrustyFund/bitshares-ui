import React from "react";
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import PortfolioStore from "stores/PortfolioStore";
import './styles.css';

class ManagePortfolio extends React.Component {
	constructor(props){
		super();
        this.state = {
            test: 123
        };
	}

	renderManualTab(){
		let test = PortfolioStore.test();
		return (
			<TabContent for="tab1">
				<h5 style={{textAlign: "center"}}>Please select shares of assets in your portfolio</h5>
				{test}
			</TabContent>
		);
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