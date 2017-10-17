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

        image: require('./vendor/img_how_use_m_1.png'),
        images: [
            require('./vendor/img_how_use_m_0.png'),
            require('./vendor/img_how_use_m_1.png'),
            require('./vendor/img_how_use_m_2.png'),
            require('./vendor/img_how_use_m_3.png'),
            require('./vendor/img_how_use_m_4.png'),
            require('./vendor/img_how_use_m_5.png'),
        ],
        desk_images: [
            require('./vendor/img_how_use_0.png'),
            require('./vendor/img_how_use_1.png'),
            require('./vendor/img_how_use_2.png'),
            require('./vendor/img_how_use_3.png'),
            require('./vendor/img_how_use_4.png'),
            require('./vendor/img_how_use_5.png'),
        ],
        title: "How to use",
        text: null
    },

    {
        id:2,

        image: require('./vendor/img_global_network.png'),
        title: "3 Min. To Create<br> Decentralized Account",
        text: `
        Sign up, enter password<br> and your account will be secured<br> by immutable BitShares public<br> blockchain. Only you have the<br> private key`
    },
    {
        id:3,

        image: require('./vendor/img_wallets_1.png'),
        images: [
            //require('./vendor/img_wallets_1.png'),
            require('./vendor/img_wallets_1a.png'),
            require('./vendor/img_wallets_1b.png'),
            require('./vendor/img_wallets_1c.png'),
            require('./vendor/img_wallets_1d.png'),
            require('./vendor/img_wallets_1e.png'),
            require('./vendor/img_wallets_1f.png'),
            require('./vendor/img_wallets_1g.png'),
            require('./vendor/img_wallets_1h.png'),
        ],
        desk_images: [
            //require('./vendor/img_wallets_2.png'),
            require('./vendor/img_wallets_2a.png'),
            require('./vendor/img_wallets_2b.png'),
            require('./vendor/img_wallets_2c.png'),
            require('./vendor/img_wallets_2d.png'),
            require('./vendor/img_wallets_2e.png'),
            require('./vendor/img_wallets_2f.png'),
            require('./vendor/img_wallets_2g.png'),
            require('./vendor/img_wallets_2h.png'),
        ],
        title: "Many Methods To<br>Deposit Any Currency",
        text: `
        Invest USD, RUB, EUR, CNY or popular cryptocurrencies with minimal commission, at best exchange rate`
    },

    {
        id:4,
        image: require('./vendor/img_1click_to_invest.png'),
        title: "One-Click To<br> Buy Crypto Portfolio",
        text: `
        Deposit and you already<br> own the selected portfolio of<br> cryptocurrencies and assets.<br> Forget the hassle of buying<br> assets separately
        `
    },
    {   
        id:5,
        image: require('./vendor/img_chng_portfolio.png'),
        title: "One-Click<br> Portfolio Management",
        text: `
        Manage portfolio by mirroring<br> trades of ranked portfolio<br> managers, applying index rules<br> or using portfolio rebalancing tool
        `
    },
    {
        id:6,
        image: require('./vendor/img_index.png'),
        title: "One-Click To<br> Fix Income, 0% free",
        text: `
        Fix income to wait our prices hyper<br> volatility. One-Click and our funds<br> are all in USD, UER, CNY, Gold, etc.
        `
    },
    {
        id:7,
        image: require('./vendor/img_wallets_1.png'),
        imageTwo: require('./vendor/img_wallets_2.png'),
        title: "Withdraw Fiat<br> Or Cryptocurrencies",
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
            currentThirdSlide: null,
            currentThirdSlideDesk: null,
            showBalls: false,
            windowHeight: window.innerHeight
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
        let indexTwo = 0

        this.setState({
            currentFirstSlide: slides[0].images[index],
            currentFirstSlideDesk: slides[0].desk_images[index],
            currentThirdSlide: slides[2].images[index],
            currentThirdSlideDesk: slides[2].desk_images[index]
        })




        this.timeout = setInterval(() => {
            if(index >= slides[0].images.length-1) { index=0 } else { index++ }
            this.setState({
                currentFirstSlide: slides[0].images[index],
                currentFirstSlideDesk: slides[0].desk_images[index],
            })
            if(indexTwo >= slides[2].images.length-1) { indexTwo=0 } else { indexTwo++ }
            this.setState({
                currentThirdSlide: slides[2].images[indexTwo],
                currentThirdSlideDesk: slides[2].desk_images[indexTwo]
            })
        }, 1000)

    }

    scrollDown(e, index){
        
        let item = index==null?document.body.querySelector(".sl_id-1"):document.body.querySelector(".sl_id-"+(index+2))

        JQuery('html, body').animate({
            scrollTop: index==6 ? JQuery(".last_text").offset().top :JQuery(item).offset().top
        }, 450);

        // console.log(item.getBoundingClientRect().top)
        // if(e) e.stopPropagation()
        // if(index==null) { JQuery('html,body').animate({scrollTop:window.innerHeight},450); } else {
        //     JQuery('html,body').animate({scrollTop: window.innerHeight * (index+2)},450);
        // }
    }

    render() {
        let scrollDown = (e, index) =>{
            e.stopPropagation()
            JQuery('html,body').animate({scrollTop: window.innerHeight * (index+1)},450);
        }

        let self = this
        let button = 
            <div className="fixed_bottom _mob">
                <button>INVEST NOW</button>
                <div className="land_button trusty_arrow_down" onClick={this.scrollDown.bind(this, event, null)}><Icon name="trusty_arrow" /></div>
            </div>

        let currentFirst = this.state.currentFirstSlide
        let currentFirstDesk = this.state.currentFirstSlideDesk
        let currentThird = this.state.currentThirdSlide
        let currentThirdDesk = this.state.currentThirdSlideDesk

        let ballsNav = this.state.showBalls ? 
            (<div className="balls_nav _desk">
                {[1,2,3,4,5,6,7].map((i, index) => <span key={i} onClick={ e => scrollDown(e, index)} /> )}
            </div>) : null 

        const list = slides.map((slide, index)=>
            <div className={"land_slide sl_id-"+slide.id} 
                key={slide.id} onClick={this.scrollDown.bind(this, event, index)}
                style={{ height: this.state.windowHeight }}>
                <div className="image_area">
                    { index == 0 ? 
                        <div>
                            <img className="_image _mob" src={currentFirst}/>
                            <img className="_image _desk" src={currentFirstDesk}/>
                        </div>

                    : null }

                    { index == 2 || index == 6 ? 
                         <div>
                            <img className="_image _mob" src={currentThird}/>
                            <img className="_image _desk" src={currentThird}/>
                        </div>
                    : null }

                    { index != 0 && index !=2 && index != 6 ? 
                        <img className="_image" src={slide.image}/>
                        
                    : null }



                </div>
                <div className="text_area">
                    <h1 dangerouslySetInnerHTML={{__html:slide.title}}/>
                    { slide.text?<div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>: null }
                </div>
                <div className="trusty_arrow_down"><Icon name="trusty_arrow" /></div>
            </div>
        );

        const top = (
            <div className="logo_starter" style={{height: this.state.windowHeight}}>
                <div className="top_buttons _mob">
                    <Link to="/signup"><span>SignUp</span></Link>
                     <Link to="/home"><span>Info</span></Link>
                    <Link to="/create-wallet-brainkey"><span>LogIn</span></Link>
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
                        <button className="land_button _desk">INVEST NOW</button>
                    </div>
                </div>
                {button}
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
                        <p>First time in history<br className="_desk _mob"/> everybody can invest<br className="_desk _mob"/> in a globally disruptive,<br className="_desk _mob"/> yet infant, technology</p>
                        <button className="land_button">INVEST NOW</button>
                        <p>Depositing into Trusty.Fund<br className="_desk _mob"/> now is like early investing<br className="_desk _mob"/> in index of internet<br className="_desk _mob"/> companies, when 20 million<br className="_desk _mob"/> people used internet</p>
                        <button className="land_button">FAQ</button>
                    </div>
   
                </div>
                <div className="bottom_info">
                    <section>The above references are for information purposes only. They are not intended to be investment advices. <br className="_desk _mob"/> Trusty.Fund provides a trustless service for its clients to manage and store funds on the BitShares Decentralised Exchange.</section>
                    <section>2017 Trusty.Fund</section>
                </div>
            </section>
        );
    }

}

export default Landing;
