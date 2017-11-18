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
        images: [
            require('./vendor/img_glb_netwk01.png'),
            require('./vendor/img_glb_netwk02.png'),
            require('./vendor/img_glb_netwk03.png'),
            require('./vendor/img_glb_netwk04.png'),
            require('./vendor/img_glb_netwk05.png'),
            require('./vendor/img_glb_netwk06.png'),
            require('./vendor/img_glb_netwk07.png'),
            //require('./vendor/img_glb_netwk08.png'),
            require('./vendor/img_glb_netwk09.png')
        ],
        image: require('./vendor/img_global_network.png'),
        title: "Easy To Create A<br> Decentralized Account",
        text: `
        Click Signup, create password<br> and account will be secured by <br> the immutable BitShares <br> blockchain. You own the private key`
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
        title: "Deposit Fiat<br>Or Cryptocurrencies",
        text: `
        Invest USD, RUB, EUR, CNY or popular cryptocurrencies with minimal commission, at the best exchange rate`
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
        title: "One-Click<br>To Manage Portfolio",
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
        image: require('./vendor/img_wallets_1.png'),
        imageTwo: require('./vendor/img_wallets_2.png'),
        images: [
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
        title: "Withdraw Fiat<br> Or Cryptocurrencies",
        text: `
        Withdraw funds in USD, RUB, EUR, CNY directly to a bank card, payment service account or send cryptocurrencies to crypto wallet
        `
    },

]




class ImageAnimate extends Component {
    constructor(){
        super()
        this.state = {
            current: "",
            currentIndex: 0
        }
    }
    componentDidMount(){
        this.time = setInterval(()=>{
            let i = this.state.currentIndex
            this.setState({current: this.props.images[i]})
            i++
            this.setState({currentIndex: i})
            if(i >= this.props.images.length) this.setState({currentIndex: 0})
        }, 1000)
    }
    componentWillUnmount(){
        clearInterval(this.time)
    }
    render(){
        return <img className={this.props.class} src={this.state.current}/>
    }
}




class Landing extends Component {

    constructor() {
        super();
        this.state = {
            currentFirstSlide: null,
            currentFirstSlideDesk: null,
            currentThirdSlide: null,
            currentLastSlide: null,
            showBalls: false,
            windowHeight: window.innerHeight
        }
        //this.scrollDown = this.scrollDown.bind(this)
    }
    componentWillUnmount() {
        clearInterval(this.timeout)
        this.scroll.remove()
        //this.resize.remove()
        //let viewport = document.querySelector("meta[name=viewport]");
        //viewport.setAttribute('content', 'width=device-width')
    }

    componentDidMount() {

        //let viewport = document.querySelector("meta[name=viewport]");
        //viewport.setAttribute('content', 'width=750px');
        let last = window.innerHeight
        let current = window.innerHeight

        this.scroll = listen(window, "scroll", ()=>{
            let scroll = document.body.scrollTop || window.scrollY 
            let wh = window.innerHeight
            this.setState({
                showBalls: scroll >= wh && scroll < wh * 8
            })
        })

        // this.resize = listen(window, "resize", ()=>{
        //     this.setState({
        //         windowHeight: window.innerHeight
        //     })
        // })

        let index = 0

        this.setState({
            currentFirstSlide: slides[0].images[index],
            currentFirstSlideDesk: slides[0].desk_images[index],
        })

        this.timeout = setInterval(() => {
            if(index >= slides[0].images.length-1) { index=0 } else { index++ }
            this.setState({
                currentFirstSlide: slides[0].images[index],
                currentFirstSlideDesk: slides[0].desk_images[index],
            })
        }, 1000)

    }

    scrollDown(e, index){
        if(e) e.stopPropagation()
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
                <Link to="/signup"><button>INVEST NOW</button></Link>
                <div className="trusty_down_arrow" onClick={this.scrollDown.bind(this, event, null)}><Icon name="trusty_arrow_down_landing" /></div>
            </div>

        let currentFirst = this.state.currentFirstSlide
        let currentFirstDesk = this.state.currentFirstSlideDesk


        let ballsNav = this.state.showBalls ? 
            (<div className="balls_nav _desk">
                {[1,2,3,4,5,6,7].map((i, index) => <span key={i} onClick={ e => scrollDown(e, index)} /> )}
            </div>) : null 

        const list = slides.map((slide, index)=>
            <div className={"land_slide sl_id-"+slide.id} 
                key={slide.id} onClick={this.scrollDown.bind(this, event, index)}
                style={{ height: this.state.windowHeight }}>
                { index==0?<div className="trusty_down_arrow"><Icon name="trusty_arrow_down_landing" /></div>:null}
                <div className="image_area">


                    { index == 0 ? 
                        <div>
                            <img className="_image _mob" src={currentFirst}/>
                            <img className="_image _desk" src={currentFirstDesk}/>
                        </div>

                    : null }

                    { index != 0 ? 
                        <div>
                            <ImageAnimate class={"_image _mob"} images={slide.images}/>
                            {/*<img className="_image _mob" src={this.state["slide_pic_"+index]}/>*/}
                        </div>
                    : null }

                </div>
                <div className="text_area">
                    <h1 dangerouslySetInnerHTML={{__html:slide.title}}/>
                    { slide.text?<div className="_body" dangerouslySetInnerHTML={{__html:slide.text}}/>: null }
                </div>
                { index!= 0 ? <div className="trusty_down_arrow"><Icon name="trusty_arrow_down_landing" /></div>: null }
            </div>
        );

        const top = (
            <div className="logo_starter" style={{height: this.state.windowHeight}}>

                <div className="top_buttons _mob">
                    <Link to="/signup"><span>SignUp</span></Link>
                     <Link to="/terms-of-use"><span>Info</span></Link>
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
                        <Link to="/signup"><button className="_desk">INVEST NOW</button></Link>
                    </div>
                </div>
                {button}
            </div>
        )
        return ( 
            <div>
                { ballsNav }           
                <div className="once_finger" dangerouslySetInnerHTML={{__html:require('components/Trusty/Landing/vendor/fingerprint005.svg')}} /> 
                <div id="landing">
                    {top}
                    <div className="land_slides">
                        {list}
                    </div>
                 
                    <div className="last_text">
                        <p>First time in history<br/> everybody can invest<br/> in a globally disruptive,<br/> yet infant, technology</p>
                        <Link to="/signup"><button>INVEST NOW</button></Link>
                        <p>Depositing into Trusty.Fund<br/> now is like early investing<br/> in internet companies, when 20 million people <br/> used internet</p>
                        <button>FAQ</button>
                    </div>
   
                </div>
                <div className="bottom_info">
                    <section>The above references are for information purposes only.<br/> They are not intended to be investment advices. <br/> Trusty.Fund provides a trustless service for its clients to manage and<br/> store funds on the BitShares Decentralized Exchange.</section>
                    <section>2017 Trusty.Fund</section>
                </div>
            </div>
        );
    }

}

export default Landing;
