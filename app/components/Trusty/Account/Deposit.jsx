import React from "react"
import DepositWithdraw from "./Withdraw"
import DepositFiat from "../Cryptobot/Deposit";

class Deposit extends React.Component {
	constructor(){
		super()
  }

  render(){
      return (
        <div className="trusty_deposit" style={{paddingTop: "10px 2rem 0 2rem"}}>
          <DepositWithdraw router={this.props.router} location={this.props.location} deposit={true} />
          {/*<DepositFiat currency="RUB" method="SBERBANK" />*/} 
        </div>
      )
  }
}

export default Deposit