import React from "react"
import DepositWithdraw from "./Withdraw"
import { Link } from 'react-router'
import ClipboardButton from 'react-clipboard.js'



class Deposit extends React.Component {
		constructor(){
		super()
    this.onSuccess = this.onSuccess.bind(this);
    this.getText = this.getText.bind(this);

  }
 
  onSuccess(a) {
    alert("address copied")
    localStorage.setItem("_trusty_copyed_address", this.getText())
  }
 
  getText() {
  	let el = document.body.querySelector("._clipboard_value")
  	let content = el.textContent
  	let t = "blocktrades with memo "
  	if(content.indexOf(t)!=-1){
  		content = content.split("").splice(t.length).join("")
  	} 
    return content;
  }

    render(){
        return (
        	<div className="trusty_deposit" style={{paddingTop: "10px 2rem 0 2rem"}}>
	        	<DepositWithdraw deposit={true} />
	        	<ClipboardButton option-text={this.getText} onSuccess={this.onSuccess} component="button" className="trusty_wide_btn">
			        copy address
			      </ClipboardButton>
	        	<p className="trusty_help_text _bottom _yellow">Push CONFIRM button as soon as<br/> you complete payment</p>
	        	<div className="trusty_inline_buttons">
	        		<Link to="/home" className="b_left"><button>Confirm</button></Link>
	        		<Link to="/home" className="b_right"><button >Cancel</button></Link>
	        	</div>
            <p className="trusty_ps_text">Payment getaway service is provided by<br/> Openledger.io, at 0% fee</p>
	        </div>
        )
    }
}

export default Deposit