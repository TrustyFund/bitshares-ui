import React from 'react'


class Home extends React.Component {

	render(){
		let header = (
			<header className="trusty_header">
				<div  className="trusty_header_logo" dangerouslySetInnerHTML={{__html: require('components/Trusty/Landing/images/trusty_fund_logo.svg')}} />
			</header>
		)

		return (
			<div className="home">
				{ header }
				<div className="trusty_inline_buttons">
					<button>DESPOSIT</button>
					<button>WITHDRAW</button>
				</div>
			</div>
		)
	}

}

export default Home