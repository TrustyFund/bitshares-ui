import React from "react";
import {PropTypes, Component} from "react";
import cname from "classnames";
import {Link} from 'react-router';
import "./style.scss"


let slides = [

    {
        id:1,
        image: require('./images/landing_slide_1.png'),
        title: "1-click To Buy Crypto Portfolio",
        text: `
        Sign-up, click deposit and<br class="desk"> you already own top-5 liquid<br class="desk"> and steady growing cryptocurrencies.<br class="desk"> It’s never been easier
        `
    },
    {
        id:2,
        image: require('./images/landing_slide_2.png'),
        title: "Deposit Any Currency",
        text: `
        Invest USD, RUB, EUR, CNY<br class="desk"> or any cryptocurrency with<br class="desk"> minimal commission, at best<br class="desk"> exchange rate
        `
    },
    {
        id:3,
        image: require('./images/landing_slide_3.png'),
        title: "Uncrackable Like Bitcoin",
        text: `
        Your funds are held decentralized<br class="desk"> and secured by immutable<br class="desk"> BitShares blockchain. Only you<br class="desk"> hold the private key
        `
    },
    {
        id:4,
        image: require('./images/landing_slide_4.png'),
        title: "Fast Withdrawal Guaranteed",
        text: `
        Anytime and anywhere you<br class="desk"> can immediately withdraw<br class="desk"> funds to any account, wallet<br class="desk"> or bank card
        `
    },
    {
        id:5,
        image: require('./images/landing_slide_5.png'),
        title: "1-Click To Fix Income",
        text: `
        Fix income to wait out hyper volatility<br class="desk"> on the market. Just one click to move<br class="desk"> funds from crypto to traditional assets,<br class="desk"> e.g. Gold, USD, EUR or CNY
        `
    }

]



class Landing extends Component {

    constructor() {
        super();
    }

    render() {

        const button = <button className="land_button">INVEST NOW</button>

        const list = slides.map((slide, index)=>
            <div className="land_slide" key={slide.id}>
                <div className="image_area">
                    <img className="_image" src={slide.image}/>
                </div>
                <div className="text_area">
                    <h1>{slide.title}</h1>
                    <div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>
                </div>
            </div>
        );
        const top = (
            <div className="logo_starter">
                <div className="top_buttons">
                    <Link to="/dashboard"><span>Sign-Up</span></Link>
                    <Link to="/create-wallet-brainkey"><span>Log In</span></Link>
                </div>
                <div className="_logo_text" dangerouslySetInnerHTML={{__html:require('./images/trusty_fund_logo.svg')}}/>
                <div className="_logo" dangerouslySetInnerHTML={{__html:require('./images/owl_logo_small.svg')}}/>
                <p>Single-click to invest in crypto economy</p>
                {button}
            </div>
        )
        return (            
            <div id="landing">
                {top}
                <div className="land_slides">
                    {list}
                </div>
                <div className="last_text">
                    <p>First time in history every person on earth can invest in a globally disruptive, yet infant, technology</p>
                    <p>Depositing into Trusty.Fund now is like investing in index of Internet companies of 90s, when 20 million people used Internet</p>
                    {button}
                </div>
            </div>
        );
    }

}

export default Landing;
