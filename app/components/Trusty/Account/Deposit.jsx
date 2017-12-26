import React from "react"
import DepositWithdraw from "./Withdraw"

class Deposit extends React.Component {
	constructor(){
		super()
  }

  render(){
      return (
        <div className="trusty_deposit" style={{paddingTop: "10px 2rem 0 2rem"}}>
          <DepositWithdraw router={this.props.router} location={this.props.location} deposit={true} />
        </div>
      )
  }
}

export default Deposit