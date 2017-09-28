import React from "react"
import DepositWithdraw from "./Withdraw"

class Deposit extends React.Component {
    render(){
        return <DepositWithdraw deposit={true} />
    }
}

export default Deposit