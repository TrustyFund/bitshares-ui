import React from 'react';
import PropTypes from 'prop-types'
import TrustyInput from 'components/Trusty/Forms/TrustyInput'
import coinDefinition from 'components/Trusty/definition'
import ResizingSelect from 'components/Trusty/ResizingSelect'
import CoinActions from 'actions/CoinActions'
import CoinStore from 'stores/CoinStore'
import {connect} from "alt-react"

class InputTest extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  };

  constructor(props) {

	    super(props);

	    this.state = {
	    	coinType: "BTC",
	    	coinValue: "0",
	    	trustyServices: [ "Openledger (OPEN.X)","BlockTrades (TRADE.X)"],
	    }
	 }


	componentDidMount(){

		this.onCoinNameChange({target:{value:this.props.changedCoinName}})

	}

    onCoinNameChange(e) {

        if(e && e.preventDefault) e.preventDefault()
        let coin = coinDefinition.find(i=>i.name==e.target.value)
        this.setState({coinType: coin.name})
        
        switch (window.location.pathname) {
        	case '/deposit':
        		CoinActions.setCoinPayload({type: coin.name, value: this.state.coinValue, deposit: true})
        	break;
        	case '/withdraw':
        		CoinActions.setCoinPayload({type: coin.name, value: this.state.coinValue, deposit: false})
        	break;
        }

    }


    onCoinValueChange(e) {

        e.preventDefault()
        let value = e.target.value
        this.setState({coinValue: value})

        switch (window.location.pathname) {
        	case '/deposit':
        		CoinActions.setCoinPayload({value, type: this.state.coinType, deposit: true})
        	break;
        	case '/withdraw':
        		CoinActions.setCoinPayload({value, type: this.state.coinType, deposit: false})
        	break;
        }

    }

  	render() {

	  	let coinInput = <input type="text" value={this.state.coinValue} onChange={this.onCoinValueChange.bind(this)}/>
	    
	    let services = this.state.trustyServices.map((s, index)=><option key={index}>{s}</option>)
	    let selectService = <select>{services}</select>

	   	let coins = coinDefinition.map((coin, index)=><option key={index}>{coin.name}</option>)
	    let selectCoin = <ResizingSelect value={this.props.changedCoinName} id="coin_dipatcher" onChange={this.onCoinNameChange.bind(this)}>{coins}</ResizingSelect>
	    
	    return (
	    	<div className="trusty_deposit_withdraw_top_inputs">
	    		
	    		{ this.props.isTrustyDepositOrder ? null : <div>
	    			<TrustyInput 
	                    isOpen={true}
	                    input={coinInput}
	                    right={selectCoin}
	                    label={"send any sum"}/>
	            </div> }

{/*	            <div>
	                <TrustyInput
	                    label={"select service"}
	                    isOpen={true}
	                    input={selectService}
	                    type="select"/>
	           </div>*/}

	    	</div>
	    );
	  }

}


export default connect(InputTest, {
    listenTo() {
        return [CoinStore];
    },
    getProps() {
        return {
            isTrustyDepositOrder: CoinStore.getState().isTrustyDepositOrder,
            changedCoinValue: CoinStore.getState().coinValue,
            changedCoinName: CoinStore.getState().coinType,
        };
    }
});

