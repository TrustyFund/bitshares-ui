import React from "react"


class Timer extends React.Component{
  static defaultProps = {
      secondsRemaining: 59,
      minutesRemaining: 2,
      text: "YOU WILL GET SMTH"
  };

  constructor(props){
  	super();
  	this.state = props;
  	this.tick = this.tick.bind(this);
  }

  tick() {
  	let newMinutes = this.state.minutesRemaining;
  	let newSeconds = this.state.secondsRemaining - 1;

  	if (newSeconds % 60 == 0 && newMinutes != 0){
  		newMinutes = this.state.minutesRemaining - 1;

  		if (newMinutes >= 0){
  			newSeconds = 60;
  		}
  	}
    this.setState({secondsRemaining: newSeconds, minutesRemaining: newMinutes});

    if (this.state.secondsRemaining <= 0 && this.state.minutesRemaining <= 0) {
      clearInterval(this.interval);
    }
  }

  componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {  	
  	let seconds = this.state.secondsRemaining;
  	let seconds_string = (this.state.secondsRemaining < 10) ? "0" + seconds : seconds;

    return (
	    <div>
	    	<h1>{this.state.text}</h1>
	      	<h2>0{this.state.minutesRemaining} {seconds_string}</h2>
		</div>
    );
  }
};

export default Timer