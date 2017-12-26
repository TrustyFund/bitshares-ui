import React from "react"
import Icon from 'components/Icon/Icon';
import TrustyInput from 'components/Trusty/Forms/TrustyInput';
import SoSo from './soso'
import * as states from './states';
import Timer from './timer';
import { browserHistory } from 'react-router/es';
import './styles.scss';
import Header from "components/Trusty/Layout/Header";

class DepositFiat extends React.Component {

  static defaultProps = {
      currency: "RUB",
      method: "",
      amount: 0,
      name: "",
      connected: false,
      soso: null,
      order: null
  };

  componentWillUpdate(nextProps, nextState) {
    //Order state update
    if (nextState.order && this.state.order){
      if (nextState.order.Status != this.state.order.Status){
        console.log("Change order status from ",this.state.order.Status, " to ", nextState.order.Status);
      }
    }

    //New order or loaded one
    if (nextState.order && !this.state.order){
      console.log("SET ORDER",nextState.order);
    }
  }

  constructor(props){
    super();
    this.socketConnected = this.socketConnected.bind(this);
    this.socketDisconnected = this.socketDisconnected.bind(this);
    this.createOrder = this.createOrder.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.clearOrder = this.clearOrder.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.setPayedStatus = this.setPayedStatus.bind(this);
    this.receiveMessage = this.receiveMessage.bind(this);
    this.state = props;
  }

  componentWillMount(){
    console.log("STORED ORDER ID",this.getCurrentOrderId());

    let server = "https://trusty.fund/channel/";
    let soso = new SoSo(server);
    soso.onmsg = this.receiveMessage;
    soso.onopen = this.socketConnected;
    soso.onclose = this.socketDisconnected;

    this.setState({soso});
  }

  receiveMessage(data){    
    if (data.action_str == "GET"){
      let order = data.response_map;
      if (order && order.ID){
        this.setState({order: order});

        if (this.inFinalStatus(order.Status)){
          this.clearOrder();
        }
      }
    }

    if (data.action_str == "EVENT"){
      let new_order = data.response_map.order;
      if (new_order){
        if (this.state.order){
          if (this.state.order.ID == new_order.ID && this.state.order.Status != new_order.Status){
            //We scip accepted status becouse of same screen with timer
            if (new_order.Status != states.ORDER_ACCEPTED && new_order.Status != states.ORDER_LINKED){
              this.setState({order: new_order});
            }

            if (this.inFinalStatus(new_order.Status)){
              this.clearOrder();
              browserHistory.push(`/home`);
            }
          }
        }else{
          this.setState({order: new_order});
          this.setCurrentOrderId(new_order.ID);
        }
      }
    }
    
  }

  setCurrentOrderId(id){
    localStorage.setItem("_trusty_current_deposit_id",id);
  }

  getCurrentOrderId(){
    return localStorage.getItem("_trusty_current_deposit_id");
  }

  clearCurrentOrderId(){
    localStorage.removeItem("_trusty_current_deposit_id");
  }

  socketConnected(){
    this.setState({connected: true});

    let current_order_id = this.getCurrentOrderId();

    if (current_order_id){
      this.getOrder(current_order_id);
    }
  }

  socketDisconnected(){
    this.setState({connected: false});
  }

  onInputChange(type,e){
    let value = e.target.value;
    let new_state = {};
    new_state[type] = value;
    this.setState(new_state);
  }

  getOrder(order_id){
    console.log("GET ORDER",order_id);
    let address = localStorage.getItem("_trusty_username");
    this.state.soso.request("get","order",{order_id: parseInt(order_id),address});
  }

  createOrder(){

    let address = localStorage.getItem("_trusty_username");
    let client_name = this.state.name;
    let payment_method =  this.state.method;
    let currency = this.props.currency/*this.state.currency*/;
    let fiat_amount = parseInt(this.props.amount/*this.state.amount*/);
    this.state.soso.request("create","order",{client_name,address,payment_method,currency,fiat_amount});

  }

  clearOrder(){
    this.clearCurrentOrderId();
    this.setState({order: null});
  }

  cancelOrder(){
    let current_order_id = this.getCurrentOrderId();
    console.log("CURRENT ORDER ID",current_order_id);
    let address = localStorage.getItem("_trusty_username");
    this.state.soso.request("cancel","order",{order_id: parseInt(current_order_id),address}).then(()=>{
      this.clearOrder();
    });
  }

  setPayedStatus(){
     let current_order_id = this.getCurrentOrderId();
     let address = localStorage.getItem("_trusty_username");
     this.state.soso.request("mark_payed","order",{order_id: parseInt(current_order_id),address});
  }

  inFinalStatus(Status){
    return (Status == states.ORDER_CONFIRMATION || 
            Status == states.ORDER_TRANSFER ||
            Status == states.ORDER_FINISHED);
  }

  _navigateBackAction(){
     browserHistory.push(`/home`);
  }

  drawPaymentState(){
    let mark_payed_button = (
      <button type="button" className="trusty_wide_btn" onClick={this.setPayedStatus}>
        I JUST PAYD
      </button>
    );

    let cancel_button = (
      <button type="button" className="trusty_wide_btn" onClick={this.cancelOrder}>
        CANCEL ORDER
      </button>
    );

    let header = (
        <div className="trusty_header">
            <span className="_back" onClick={this._navigateBackAction}>
              <Icon name="trusty_arrow_back"/>
            </span>
            <span className="header_title">DEPOSIT PAYMENT</span>
        </div>
    )

    return (
      <div className="trusty_deposit_fiat_fullscreen">
        {header}
        {this.state.order.PaymentRequisites}
        {mark_payed_button}
        {cancel_button}
      </div>
    );
  }

  drawTimerState(){
    let cancel_button = (
      <button type="button" className="trusty_wide_btn" onClick={this.cancelOrder}>
        CANCEL ORDER
      </button>
    );

    return (
      <div className="trusty_deposit_fiat_fullscreen">
        <Timer text="YOU WILL GET DEPOSIT DETAILS IN UNDER 3 MINUTES"/>
        {cancel_button}
      </div>
    );
  }

  drawNewOrderFields(){
    let fakeWidth = <span style={{ display: "none", fontFamily: "Gotham_Pro_Bold", fontSize: "6.6vw"}} id="width_tmp_option"/>

    let deposit_input_amount_edit_box = (
        <input 
          value={this.state.amount}
          style={{width: "11rem"}} 
          type="text"
          placeholder="SEND ANY SUM"
          onChange={this.onInputChange.bind(this,"amount")}
        />
      )

      let deposit_input_coin_type_select = (
        <div>
          <select id="resizing_select"  value={this.state.currency} onChange={this.onInputChange.bind(this,"currency")}>
            <option value="RUB">RUB</option>
            <option value="USD">USD</option>
          </select>
          {fakeWidth}
          <Icon name="trusty_arrow_down"/>
        </div>
      );

      let payment_methods = (
          <select value={this.state.method} onChange={this.onInputChange.bind(this,"method")}>
            <option value="SBERBANK">SBERBANK</option>
            <option value="ALIPAY">ALIPAY</option>
            <option value="TINKOFF">TINKOFF</option>
          </select>
      );

      let name_input = (
          <input type="text" value={this.state.name} onChange={this.onInputChange.bind(this,"name")} />
      );

      return (
        <div className="trusty_deposit_fiat" style={{paddingTop: "10px 2rem 0 2rem"}}>
          <TrustyInput 
            input={payment_methods} 
            right={<div className="only_right_arrow"><Icon name="trusty_arrow_down"/></div>} 
            isOpen={true} 
            label={"payment method"}
            type="select"
          />
          <TrustyInput
            input={name_input}
            label="NAME AND SURNAME OF PAYER"
          />
          <button style={{marginBottom: 0}} type="button" className="trusty_wide_btn" onClick={this.createOrder}>
            CONFIRM
          </button>
          <p className="trusty_ps_text">Payment gateway service is provided by users of <br/> Localbitcoins.com</p>
        </div>
      );
  }

  
  render(){
      let try_again_button = (
        <button type="button" className="trusty_wide_btn" onClick={this.clearOrder}>
          TRY AGAIN
        </button>
      );
      
      if (!this.state.connected){
        return (<span>Loading...</span>);
      }

      if (this.state.order){
        switch(this.state.order.Status){
          case states.ORDER_NEW: 
            return this.drawTimerState();
          break;

          case states.ORDER_DROPPED: 
            return (<div>order dropped by operator{try_again_button}</div>);
          break;

          case states.ORDER_REJECTED:
            return (<span>No operators availble{try_again_button}</span>);
          break;

          case states.ORDER_ACCEPTED:
            return (<span>Operator just tooked order</span>);
          break;

          case states.ORDER_PAYMENT:
            return this.drawPaymentState();
          break;

          case states.ORDER_CANCELED:
            return (<span>You canceled the order</span>);
          break;

          case states.ORDER_TIMEOUT:
            return (<span>You failed to pay in time</span>);
          break;

          case states.ORDER_CONFIRMATION:
            return (<span>We are w8ing for bitcoins to come on lb</span>);
          break;

          case states.ORDER_TRANSFER:
            reutrn (<span>It seemd to be ready 1</span>);
          break;

          case states.ORDER_FINISHED:
            return (<span>It seemd to be ready 2</span>);
          break;
        }

      }else{
        return this.drawNewOrderFields();
      }
  }
}




export default DepositFiat
      
