import React from "react";
import {PropTypes, Component} from "react";
import cname from "classnames";
import {Link} from 'react-router';
import Icon from 'components/Icon/Icon'
import JQuery from 'jquery'
import listen from 'event-listener'


let slides = [
    {         
        id:1,

        image: require('./imgs/img_how_use_m_1.png'),
        images: [
            require('./imgs/img_how_use_m_0.png'),
            require('./imgs/img_how_use_m_1.png'),
            require('./imgs/img_how_use_m_2.png'),
            require('./imgs/img_how_use_m_3.png'),
            require('./imgs/img_how_use_m_4.png'),
            require('./imgs/img_how_use_m_5.png'),
        ],
        desk_images: [
            require('./imgs/img_how_use_0.png'),
            require('./imgs/img_how_use_1.png'),
            require('./imgs/img_how_use_2.png'),
            require('./imgs/img_how_use_3.png'),
            require('./imgs/img_how_use_4.png'),
            require('./imgs/img_how_use_5.png'),
        ],
        title: "How to use",
        text: null
    },

    {
        id:2,

        image: require('./imgs/img_global_network.png'),
        title: "3 Min. To Create<br> Decentralized Account",
        text: `
        Sign up, create password and your account will be secured by immutable BitShares public blockchain. Only you have the private key`
    },
    {
        id:3,

        image: require('./imgs/img_wallets_1.png'),
        imageTwo: require('./imgs/img_wallets_2.png'),
        title: "Many Methods To<br>Deposit Any Currency",
        text: `
        Invest USD, RUB, EUR, CNY or popular cryptocurrencies with minimal commission, at best exchange rate`
    },

    {
        id:4,
        image: require('./imgs/img_1click_to_invest.png'),
        title: "One-Click To<br> Buy Crypto Portfolio",
        text: `
        Deposit and you already own the selected portfolio of cryptocurrencies and assets. Forget the hassle of buying assets separately
        `
    },
    {   
        id:5,
        image: require('./imgs/img_chng_portfolio.png'),
        title: "One-Click<br> Portfolio Management",
        text: `
        Manage your portfolio by following 1-click hints from recognized investors and community
        `
    },
    {
        id:6,
        image: require('./imgs/img_index.png'),
        title: "One-Click To<br> Fix Income, 0% free",
        text: `
        Fix income to wait out hyper volatility on the market. Just one click to move funds from crypto to traditional assets, e. g. Gold, USD, EUR or CNY
        `
    },
    {
        id:7,
        image: require('./imgs/img_wallets_1.png'),
        imageTwo: require('./imgs/img_wallets_2.png'),
        title: "Fiat and Crypto Withdrawal",
        text: `
        Withdraw funds in USD, RUB, EUR, CNY directly to a bank card, payment service account or send cryptocurrencies to any wallet
        `
    },

]



class Landing extends Component {

    constructor() {
        super();
        this.state = {
            currentFirstSlide: null,
            currentFirstSlideDesk: null,
            showBalls: false,
        }
        //this.scrollDown = this.scrollDown.bind(this)
    }
    componentWillUnmount() {
        clearInterval(this.timeout)
        this.scroll.remove()
        //let viewport = document.querySelector("meta[name=viewport]");
        //viewport.setAttribute('content', 'width=device-width')
    }

    componentDidMount() {

        //let viewport = document.querySelector("meta[name=viewport]");
        //viewport.setAttribute('content', 'width=750px');

        this.scroll = listen(window, "scroll", ()=>{
            let scroll = document.body.scrollTop || window.scrollY 
            let wh = window.innerHeight
            this.setState({
                showBalls: scroll >= wh && scroll < wh * 8
            })
        })

        let index = 0

        this.setState({
            currentFirstSlide: slides[0].images[index]
        })

        this.setState({
            currentFirstSlideDesk: slides[0].desk_images[index]
        })


        this.timeout = setInterval(() => {

            if(index >= slides[0].images.length-1) { index=0 } else { index++ }

            this.setState({
                currentFirstSlide: slides[0].images[index]
            })

            this.setState({
                currentFirstSlideDesk: slides[0].desk_images[index]
            })

        }, 1000)

    }

    scrollDown(e, index){
        if(e) e.stopPropagation()
        if(index==null) { JQuery('html,body').animate({scrollTop:window.innerHeight},450); } else {
            JQuery('html,body').animate({scrollTop: window.innerHeight * (index+2)},450);
        }
    }

    render() {
        let scrollDown = (e, index) =>{
            e.stopPropagation()
            JQuery('html,body').animate({scrollTop: window.innerHeight * (index+1)},450);
        }

        let self = this
        let button = (fixed, mob) => { 
            return fixed ? (
                    <div className="fixed_bottom _mob">
                        <button>INVEST NOW</button>
                        <div className="land_button trusty_arrow_down" onClick={this.scrollDown.bind(this, event, null)}><Icon name="trusty_arrow" /></div>
                    </div>
                    )
                : <button className="land_button">INVEST NOW</button>
        };
        let currentFirst = this.state.currentFirstSlide
        let currentFirstDesk = this.state.currentFirstSlideDesk

        let ballsNav = this.state.showBalls ? 
            (<div className="balls_nav">
                {[1,2,3,4,5,6,7].map((i, index) => <span key={i} onClick={ e => scrollDown(e, index)} /> )}
            </div>) : null 


        const list = slides.map((slide, index)=>
            <div className={"land_slide sl_id-"+slide.id} key={slide.id} onClick={this.scrollDown.bind(this, event, index)}>
                <div className="image_area">
                    <img className="_image _mob" src={slide.images ? currentFirst : slide.image}/>
                    <img className="_image _desk" src={slide.images ? currentFirstDesk : slide.image}/>
                </div>
                <div className="text_area">
                    <h1 dangerouslySetInnerHTML={{__html:slide.title}}/>
                    { slide.text?<div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>: null }
                </div>
                <div className="trusty_arrow_down"><Icon name="trusty_arrow" /></div>
            </div>
        );

        const top = (
            <div className="logo_starter">
                <div className="top_buttons _mob">
                    <Link to="/signup"><span>Sign-Up</span></Link>
                    <Link to="/create-wallet-brainkey"><span>Log In</span></Link>
                </div>
                <div className="bottom_content">
                    <div className="_logo_text _mob" dangerouslySetInnerHTML={{__html:require('./images/trusty_fund_logo.svg')}}/>
                    <div className="_logo _mob" dangerouslySetInnerHTML={{__html:require('./img/logo.svg')}}/>
                    <div className="wrap_img_profile _desk">
                        <img src={require("./img/img_user_page.png")} />
                    </div>
                    <div className="_desk_right">
                        <div className="_logo _desk" dangerouslySetInnerHTML={{__html:require('./img/logo.svg')}}/>
                        <div className="_logo_text _desk" dangerouslySetInnerHTML={{__html:require('./images/trusty_fund_logo.svg')}}/>
                        <p className="_slogan">Crypto<br/> Investment Wallet</p>
                        <p className="_description">Single-click to invest in<br/> crypto economy</p>
                        <button className="land_button _desk">INVEST NOW</button>
                    </div>
                </div>
                {button(true)}
            </div>
        )
        return ( 
            <section>
                { ballsNav }           
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
                    <section>The above references are for information purposes only. They are not intended to be investment advices. <br/> Trusty.Fund provides a trustless service for its clients to manage and store funds on the BitShares Decentralised Exchange.</section>
                    <section>2017 Trusty.Fund</section>
                </div>
            </section>
        );
    }

}

export default Landing;
