import React from "react"
import listen from 'event-listener'
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import cname from "classnames";
import Icon from 'components/Icon/Icon'


class TrustyInput extends React.Component {

  static propTypes = {
      label: React.PropTypes.string,
      textArea: React.PropTypes.bool
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
		console.log(input)
		if(this.focus) this.focus.remove()

		this.focus = listen( input,"focus",e=>{
			this.setOpened(true)
		})

		//let value = this.props.textArea ? input.textContent : input.value
		//console.log(value)
		//if(!value) { this.setState({showClose: false}) } else { this.setState({showClose: true}) }

	}

	render(){

		let body = document.body
		let newLabel = this.props.label != "label here" 
		return (
				<div className="trusty_input_container">
					<CSSTransitionGroup transitionName="example" transitionEnterTimeout={700} transitionLeaveTimeout={700}>
						{ this.state.opened ? <label>{this.props.label}</label> : null }
					</CSSTransitionGroup>
					<div className="w_input">
						<div ref="inputWrap" className={cname("t_input", {"active_input": this.state.opened})}>

							{ this.props.input && this.state.opened ? this.props.input : null 
								|| <input 
										onBlur={this.setOpened.bind(this,false)}
										onFocus={this.setOpened.bind(this,true)}
										type="text" 
										value={this.state.value} 
										onChange={this.handleChange} 
										placeholder={!this.state.opened  ? this.props.label: ""} /> }

						</div>
						<div className="t_right">
							{this.props.right || this.state.opened ? <Icon name="trusty_input_close" /> : null }
						</div>
					</div>
				</div>
			)
	}
}

export default TrustyInput