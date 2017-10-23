import React from "react"
import listen from 'event-listener'
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import cname from "classnames";


class TrustyInput extends React.Component {

  static propTypes = {
      label: React.PropTypes.string,
      teaxtArea: React.PropTypes.bool
  };

  static defaultProps = {
      label: "label here",
  };


  constructor(){
  		super()
  		this.state = {
  			value: "",
  			opened: false
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
		if(this.blur) this.blur.remove()

		this.blur = listen(input,"blur", e=>{
			//this.setOpened(false)
		})

		if(this.focus) this.focus.remove()
		this.focus = listen( input,"focus",e=>{
			this.setOpened(true)
		})

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
							{this.props.right || <span onClick={()=>{ this.refs.inputWrap.querySelector("input").value = ""}}>X</span>}
						</div>
					</div>
				</div>
			)
	}
}

export default TrustyInput