import React from 'react';
import PropTypes from 'prop-types'
import $ from 'jquery'
import Icon from "components/Icon/Icon"

export default class ResizingSelect extends React.Component {
	  static propTypes = {
	    value: PropTypes.string,
	    onChange: PropTypes.func,
	  };

	  constructor(props) {
	    super(props);
	  }
  	_resize(){
  		if($(this.refs.option).width() == 0 ) {
  			setTimeout(()=>{
  				this._resize()
  			},100)
  		} else {
        $(this.refs.select).width($(this.refs.option).width() * 1.1);  
  		}
  	}

  	componentDidMount() {
  		this._resize()
    	$(this.refs.select).change(this._resize())
  	}
  

  	render() {
  	let fakeWidth = <span ref="option" style={{ display: "none", fontFamily: "Gotham_Pro_Bold", fontSize: "6.6vw"}}>{this.props.value}</span>
    return (
        <div>
        	<select ref="select"  value={this.props.value} onChange={this.props.onChange}>
          	{this.props.children}
        	</select>
        	{fakeWidth}
        	<Icon name="trusty_arrow_down"/>
        </div>
    );
  }
}
