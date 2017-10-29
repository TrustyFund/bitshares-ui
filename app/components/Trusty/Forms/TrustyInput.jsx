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
  			showClose: false
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

	componentDidUpdate(){
		let input = this.refs.inputWrap.querySelector(this.props.textArea ? 'textarea':'input')
		if(input!==null)input.focus()
		if(this.focus) this.focus.remove()

		if( input )  {
			this.focus = listen( input,"focus",e=>{
				this.setOpened(true)
			})
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
				<div className={cname("trusty_input_container",{ "text_area": this.props.textArea })}>
					{/*<CSSTransitionGroup transitionName="example" transitionEnterTimeout={700} transitionLeaveTimeout={700}>*/}
						{/* this.state.opened ? <label>{this.props.label}</label> : null*/ }
					{/*</CSSTransitionGroup>*/}
					<div className="w_input">
						<div ref="inputWrap" className={cname("t_input", {"active_input": this.state.opened})}>

							<label onClick={()=>this.setState({ opened: !this.state.opened})} className={cname("trusty_place_holder", {"no_opened":!this.state.opened})}>{this.props.label}</label>
							{ this.props.input && this.state.opened ? this.props.input : null } 
							{ !this.state.opened ? input : null }

						</div>
						<div className="t_right" onClick={this.props.closeAction ? this.props.closeAction : ()=>{return}}>
							{this.props.right }
						</div>
					</div>
				</div>
			)
	}
}

export default TrustyInput