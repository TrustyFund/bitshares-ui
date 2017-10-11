import React from "react"
import DepositWithdraw from "./Withdraw"
import { Link } from 'react-router'

//import Clipboard from 'components/Trusty/clipboard.min.js'

class Deposit extends React.Component {

		_copyAction(){
			  var clipboard = new Clipboard('[data-clipboard]');
		    clipboard.on('success', function(e) {
		        console.log(e);
		    });
		    clipboard.on('error', function(e) {
		        console.log(e);
		    });
		}

    render(){
        return (
        	<div className="trusty_deposit" style={{paddingTop: "10px 2rem 0 2rem"}}>
	        	<DepositWithdraw deposit={true} />
	        	<button className="trusty_wide_btn" onClick={this._copyAction}>copy adress</button>
	        	<p className="trusty_help_text" style={{ color: 'yellow' }}>Push CONFIRM button as soon as you complete payment</p>
	        	<div className="trusty_inline_buttons">
	        		<Link to="/home" className="b_left"><button>Confirm</button></Link>
	        		<Link to="/home" className="b_right"><button >Cancel</button></Link>
	        	</div>
	        </div>
        )
    }
}

export default Deposit