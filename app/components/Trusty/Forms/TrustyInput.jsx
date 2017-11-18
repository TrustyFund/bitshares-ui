import React from "react"
import listen from 'event-listener'
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import cname from "classnames";
import Icon from 'components/Icon/Icon'


class TrustyInput extends React.Component {

  static propTypes = {
      label: React.PropTypes.string,
      textArea: React.PropTypes.bool,
      closeAction: React.PropTypes.func  
  };

  static defaultProps = {
      label: "label here",
  };


  constructor(){
  		super()
  		this.state = {
  			value: "",
  			opened: false,
  			showClose: false,
  			focused: false,
  			isEmpty: true
  		}
  		this.handleChange = this.handleChange.bind(this)
  		this.setOpened = this.setOpened.bind(this)
  }

  	handleChange(event) {
	  this.setState({
	    value: event.target.value
	  });

	  this.props.editValue(this.state.value)
	}

	setOpened(opened){
		this.setState({opened})
	}

	labelClick(){
		this.setState({ opened: !this.state.opened})
		//if(~this.props.label.indexOf("enter amount"))document.body.querySelector(".grid-container .trusty_input_container .exchange_fee").click()
	}

	componentDidMount(){
	  	if(this.props.isOpen) this.setOpened(true)
	  	if(this.onchange) this.onchange.remove()
	}

	_nullField(){
		let input = this.refs.inputWrap.querySelector(this.props.textArea ? 'textarea':'input')
		if(input) { input.value = ""; input.focus() }
	}
	componentWillUnmount(){
		if(this.blur) this.blur.remove()
	}

	componentDidUpdate(){
		
		let input = this.refs.inputWrap.querySelector(this.props.textArea ? 'textarea':'input')

		if(input!==null && this.state.opened){
			if(this.state.focused) return 
			this.setState({focused: true})

			input.focus()

			if(!this.blur) {
				this.blur = listen( input,"blur",e=>{
					if(!input.value) {
						this.setOpened(false)
						this.setState({focused: false })
						this.blur.remove()
						this.blur = null
					} 
				})
			}

			// this.onchange = listen(input, "keydown",()=>{
			// 	this.setState({isEmpty: input.value.length == 0})
			// })
		}

		//let value = this.props.textArea ? input.textContent : input.value
		//console.log(value)
		//if(!value) { this.setState({showClose: false}) } else { this.setState({showClose: true}) }
	}

	render(){
		let input = <input 
										id="_id_trusty_input"
										style={{display: "none"}}
										onBlur={this.setOpened.bind(this,false)}
										onFocus={this.setOpened.bind(this,true)}
										type="text" 
										value={this.state.value} 
										onChange={this.handleChange} 
										placeholder={!this.state.opened  ? this.props.label: ""} />



		let body = document.body
		let newLabel = this.props.label != "label here" 
		
		return (
				<div className={cname("trusty_input_container",{ "text_area": this.props.textArea, "opened_text_area": this.state.opened && this.props.textArea })}>
					{/*<CSSTransitionGroup transitionName="example" transitionEnterTimeout={700} transitionLeaveTimeout={700}>*/}
						{/* this.state.opened ? <label>{this.props.label}</label> : null*/ }
					{/*</CSSTransitionGroup>*/}
					<div className="w_input">
						<div ref="inputWrap" className={cname("t_input", {"active_input": this.state.opened})}>

							<label onClick={this.labelClick.bind(this)} className={cname("trusty_place_holder", this.props.label.split(" ").join("_"), {"no_opened":!this.state.opened})}>{this.props.label}</label>
							{ this.props.input && this.state.opened ? this.props.input : null } 
							{ !this.state.opened ? input : null }

						</div>
						<div className="t_right" onClick={this.props.closeAction ? this.props.closeAction : ()=>{return}}>
							{this.props.right ?  this.props.right : !this.state.isEmpty ? <span className="close_icon" onClick={this._nullField.bind(this)}><Icon name={"trusty_input_close"} /></span> : null }
						</div>
					</div>
				</div>
			)
	}
}

export default TrustyInput