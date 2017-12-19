import React from "react";
import {PropTypes, Component} from "react";
import {Link} from 'react-router';
import Icon from 'components/Icon/Icon'
import JQuery from 'jquery'
import Hammer from 'react-hammerjs';



let slides = [
    {         
        id:1,
        image: require('./vendor/how.gif'),
        title: "How To Use",
        text: null
    },

    {
        id:2,
        image: require('./vendor/network.gif'),
        title: "Easy To Create A<br> Decentralized Account",
        text: `
        Click Signup, create password<br> and your account will be secured <br> by the BitShares.org blockchain. <br> You own the private key`
    },
    {
        id:3,

        image: require('./vendor/wallet1.gif'),
        title: "Deposit Fiat<br>Or Cryptocurrencies",
        text: `
        Invest USD, RUB, EUR, CNY at the best exchange rate or pay 0% commission to deposit cryptocurrencies directly `
    },

    {
        id:4,
        images: [require('./vendor/img_1click_to_invest.png')],
        image: require('./vendor/img_1click_to_invest.png'),
        title: "One-Click To<br> Buy A Portfolio Of Cryptos",
        text: `
        After deposit, you are a click<br> away from your own customized<br>portfolio of crypto assets.<br> Forget the hassle of buying<br> assets separately
        `
    },
    {   
        id:5,
        images: [require('./vendor/img_chng_portfolio.png')],
        image: require('./vendor/img_chng_portfolio.png'),
        title: "One-Click<br>To Manage Your Portfolio",
        text: `
        Manage your portfolio by mirroring<br> trades of ranked portfolio<br> managers, applying index rules or<br> using the portfolio rebalancing tool
        `
    },
    {
        id:6,
        images: [require('./vendor/img_index.png')],
        image: require('./vendor/img_index.png'),
        title: "One-Click<br>To Fix Your Income In USD",
        text: `
        Fix your income to wait out price<br> hyper volatility. Just click to<br> transfer your funds in<br> USD, EUR, CNY, Gold, etc.
        `
    },
    {
        id:7,
        image: require('./vendor/wallet2.gif'),
        title: "Withdraw Fiat<br> Or Cryptocurrencies",
        text: `
        Withdraw funds in USD, RUB, EUR, CNY directly to a bank card, payment service account or send cryptocurrencies to a crypto wallet
        `
    },

]



class Landing extends Component {

    constructor() {
        super();
        this.state = {
            windowHeight: window.innerHeight
        }
    }

    render() {
        let scrollDown = (e, index) =>{
            let target_index = index + 1;
            let target = "#sl_id_" + target_index;
            let target_element = JQuery(target);

            if (!target_element.length){
                target_element = JQuery("#last_screen");
            }

            let target_offset = target_element.offset();
            let target_top = target_offset.top;
            JQuery('html,body').animate({scrollTop: target_top},450);
        }

        let self = this
        let trusty_username = localStorage.getItem("_trusty_username");
        let isAuth = !!trusty_username
        let currentLinkAdress = isAuth ? "/home" : "/signup" 
        let button = 
            <div className="fixed_bottom _mob">
                <Link to={currentLinkAdress}><button>INVEST NOW</button></Link>
                <div className="trusty_down_arrow" onClick={ e => scrollDown(e, 0) }><Icon name="trusty_arrow_down_landing" /></div>
            </div>

        const list = slides.map((slide, index)=> {
            return(
                <Hammer onTap={e => scrollDown(e, index+1)} key={slide.id} >
                    <div className={"land_slide sl_id-"+slide.id} id={"sl_id_"+slide.id} style={{ height: this.state.windowHeight }}>

                        { index==0?<div className="trusty_down_arrow"><Icon name="trusty_arrow_down_landing" /></div>:null}
                        
                        <div className="image_area">
                            <div>
                                <img src={slide.image} className="_image _mob"/>
                            </div>
                        </div>
                        <div className="text_area">
                            <h1 dangerouslySetInnerHTML={{__html:slide.title}}/>
                            { slide.text?<div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>: null }
                        </div>
                        { index!= 0 ? <div className="trusty_down_arrow"><Icon name="trusty_arrow_down_landing" /></div>: null }
                    </div>
                </Hammer>
            )

        });

        const top = (
            <div className="logo_starter" style={{height: this.state.windowHeight}}>

                <div className="top_buttons _mob">
                    <Link to={ currentLinkAdress }><span>SignUp</span></Link>
                    <Link to="/terms-of-use"><span>Info</span></Link>
                    <Link to={ isAuth ? "home" : "/login" }><span>LogIn</span></Link>
                </div>
                <div className="bottom_content">
                    <div className="_logo_text _mob" dangerouslySetInnerHTML={{__html:require('./vendor/img_trusty_logo_last.svg')}}/>
                    {/*<div className="_logo _mob" dangerouslySetInnerHTML={{__html:require('./vendor/logo.svg')}}/>*/}
                    <div className="wrap_img_profile _desk">
                        <img src={require("./vendor/img_user_page.png")} />
                    </div>
                    <div className="_desk_right">
                        <div className="_logo _desk" dangerouslySetInnerHTML={{__html:require('./vendor/logo.svg')}}/>
                        <div className="_logo_text _desk" dangerouslySetInnerHTML={{__html:require('./vendor/img_trusty_logo_last.svg')}}/>
                        <p className="_slogan">Investment Wallet</p>
                        <p className="_description">One-Click To Invest In<br/> Crypto Economy</p>
                        <Link to={currentLinkAdress}><button className="_desk">INVEST NOW</button></Link>
                    </div>
                </div>
                {button}
            </div>
        )
        return ( 
            <div>  
                <div className="trusty_fixed_background_div _mob"/>      
                <div className="once_finger" dangerouslySetInnerHTML={{__html:require('components/Trusty/Landing/vendor/fingerprint005.svg')}} /> 
                <div id="landing">
                    {top}
                    <div className="land_slides">
                        {list}
                    </div>
                 
                    <div className="last_text" id="last_screen">
                        <p>First time in history<br/> everybody can invest<br/> in a globally disruptive,<br/> yet infant, technology</p>
                        <Link to={currentLinkAdress}><button>INVEST NOW</button></Link>
                        <p>Depositing into Trusty.Fund<br/> now is like early investing<br/> in internet companies, when 20 million people <br/> used internet</p>
                        <button>FAQ</button>
                    </div>
   
                </div>
                <div className="bottom_info">
                    <section>The above references are for information purposes only.<br/> They are not intended to be investment advices. <br/> Trusty.Fund provides a trustless service for its clients to manage and<br/> store funds on the BitShares blockchain via trusted gateways.</section>
                    <section>2017 Trusty.Fund</section>
                </div>
            </div>
        );
    }

}

export default Landing;
