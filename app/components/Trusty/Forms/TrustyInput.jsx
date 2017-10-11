import React from "react"
import listen from 'event-listener'


class TrustyInput extends React.Component {

  static propTypes = {
      label: React.PropTypes.string,
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

	render(){
		let body = document.body
		return (
				<div className="trusty_input_container">
					{ this.state.opened ? <label>{this.props.label}</label> : null }
					<div className="w_input">
						<div className="t_input">
							{ this.props.input || <input onBlur={this.setOpened.bind(this,false)} 
										onFocus={this.setOpened.bind(this,true)}
										type="text" 
										value={this.state.value} 
										onChange={this.handleChange} 
										placeholder={!this.state.opened  ? this.props.label: ""} /> }
						</div>
						<div className="t_right">
							{this.props.right || <span onClick={()=>{this.setState({value:""})}}>X</span>}
						</div>
					</div>
				</div>
			)
	}
}

export default TrustyInput