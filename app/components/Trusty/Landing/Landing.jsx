import React from "react";
import {PropTypes, Component} from "react";
import cname from "classnames";
import {Link} from 'react-router';
import Icon from 'components/Icon/Icon'
import JQuery from 'jquery'


let slides = [
    {         
        id:1,
        image: require('./img/img_how_use_m_1.png'),
        title: "How to use",
        text: null
    },

    {
        id:2,
        image: require('./img/img_global_network.png'),
        title: "Create Decentralized Account",
        text: `
        Sign up, create password and your account will be secured by immutable BitShares public blockchain. Only you have the private key`
    },
    {
        id:3,
        image: require('./img/img_wallets_1.png'),
        imageTwo: require('./img/img_wallets_2.png'),
        title: "Deposit Any Currency",
        text: `
        Invest USD, RUB, EUR, CNY or popular cryptocurrencies with minimal commission, at best exchange rate`
    },

    {
        id:4,
        image: require('./img/img_1click_to_invest.png'),
        title: "1-click To Buy Crypto Portfolio",
        text: `
        Deposit and you already own the selected portfolio of cryptocurrencies and assets. Forget the hassle of buying assets separately
        `
    },
    {   
        id:5,
        image: require('./img/img_chng_portfolio.png'),
        title: "1-Click Portfolio Management",
        text: `
        Manage your portfolio by following 1-click hints from recognized investors and community
        `
    },
    {
        id:6,
        image: require('./img/img_index.png'),
        title: "1-Click To Fix Income,<br>0% free",
        text: `
        Fix income to wait out hyper volatility on the market. Just one click to move funds from crypto to traditional assets, e. g. Gold, USD, EUR or CN
        `
    },
    {
        id:7,
        image: require('./img/img_wallets_1.png'),
        imageTwo: require('./img/img_wallets_2.png'),
        title: "Fiat and Crypto Withdrawal",
        text: `
        Withdraw funds in USD, RUB, EUR, CNY directly to a bank card, payment service account or send cryptocurrencies to any wallet
        `
    },

]



class Landing extends Component {

    constructor() {
        super();
    }

    scrollDown(e, index){
        if(index==null) { JQuery('html,body').animate({scrollTop:window.innerHeight},450); } else {
            JQuery('html,body').animate({scrollTop: window.innerHeight * (index+2)},450);
        }
    }
    render() {

        let button = (fixed) => { 


            return fixed ? (
                    <div className="fixed_bottom">
                        <button>INVEST NOW</button>
                        <div className="trusty_arrow_down" onClick={this.scrollDown.bind(this, event, null)}><Icon name="trusty_arrow" /></div>
                    </div>
                    )
                : <button className="land_button">INVEST NOW</button>
            
        };

        const list = slides.map((slide, index)=>
            <div className={"land_slide sl_id-"+slide.id} key={slide.id}>
                <div className="image_area">
                    <img className="_image" src={slide.image}/>
                </div>
                <div className="text_area">
                    <h1 dangerouslySetInnerHTML={{__html:slide.title}}/>
                    { slide.text?<div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>: null }
                </div>
                <div className="trusty_arrow_down" onClick={this.scrollDown.bind(this, event, index)} ><Icon name="trusty_arrow" /></div>
            </div>
        );
        const top = (
            <div className="logo_starter">
                <div className="top_buttons">
                    <Link to="/signup"><span>Sign-Up</span></Link>
                    <Link to="/create-wallet-brainkey"><span>Log In</span></Link>
                </div>
                <div className="bottom_content">
                    <div className="_logo_text" dangerouslySetInnerHTML={{__html:require('./images/trusty_fund_logo.svg')}}/>
                    <div className="_logo" dangerouslySetInnerHTML={{__html:require('./img/logo.svg')}}/>

                    <div>
                        <p className="_slogan">Crypto Investment Wallet</p>
                        <p className="_description">Single-click to invest in crypto economy</p>
                    </div>
                </div>
                {button(true)}
            </div>
        )
        return ( 
            <section>           
                <div id="landing">
                    {top}
                    <div className="land_slides">
                        {list}
                    </div>
                 
                    <div className="last_text">
                        <p>First time in history every person on earth can invest in a globally disruptive, yet infant, technology</p>
                        {button(false)}
                        <p>Depositing into Trusty.Fund now is like investing in index of Internet companies of 90s, when 20 million people used Internet</p>
                    </div>
   
                </div>
                <div className="bottom_info">
                    <section>The above references are for information purposes only. They are not intended to be investment advices. Trusty.Fund provides a trustless service for its clients to manage and store funds on the BitShares Decentralised Exchange.</section>
                    <section>©2017 Trusty.Fund. All right reserved</section>
                </div>
            </section>
        );
    }

}

export default Landing;
