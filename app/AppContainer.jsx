import React from "react";
import { connect } from "alt-react";
import IntlStore from "stores/IntlStore";
import IntlActions from "actions/IntlActions";
import WalletUnlockStore from "stores/WalletUnlockStore";
import {IntlProvider} from "react-intl";
import intlData from "./components/Utility/intlData";
import AccountStore from "stores/AccountStore";
import LoadingIndicator from "components/LoadingIndicator";
import { dispatcher } from "components/Trusty/utils"
/* pixel perfect helper */
// import 'components/Trusty/pixel-glass'
// import 'assets/stylesheets/trusty/components/pixel-glass.scss'

const user_agent = navigator.userAgent.toLowerCase();
let isExtension = (window.innerHeight == 590 && window.innerWidth == 400);
window.isMobile = function() {
  if (isExtension) return true;
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

class AppContainer extends React.Component {
    constructor(){
        super();
        this.state = {showLoader: false,isPrivate: false};
        dispatcher.register(dispatch => {
            if ( dispatch.type === 'show-trusty-loader') {
                this.setState({showLoader: dispatch.show})
            }
        });
    }
    componentWillMount(){
        isPrivateMode().then(isPrivate => this.setState({isPrivate}));
    }
    render() {
        if (this.state.isPrivate && window.isMobile()){
            return (<div>{this.props.children}</div>);
        }
        if(!window.isMobile() || this.state.showLoader)  {
            let loader = (this.state.showLoader) ? "YES" : "NO";
            let mobile = (window.isMobile()) ? "YES" : "NO";
            let sprivate = (this.state.isPrivate) ? "YES" : "NO";
            return (
                <div>
                    <h1 style={{color: 'white'}}>Loader - {loader}, Mobile - {mobile}, Private - {sprivate}</h1>
                    <LoadingIndicator type={"trusty-owl"}/>
                </div>
            )
        } else {
            return (<div>{this.props.children}</div>);
        }
	}
}

function isPrivateMode() {
  return new Promise((resolve) => {
    const on = () => resolve(true); // is in private mode
    const off = () => resolve(false); // not private mode
    const testLocalStorage = () => {
      try {
        if (localStorage.length) off();
        else {
          localStorage.x = 1;
          localStorage.removeItem('x');
          off();
        }
      } catch (e) {
        // Safari only enables cookie in private mode
        // if cookie is disabled then all client side storage is disabled
        // if all client side storage is disabled, then there is no point
        // in using private mode
        navigator.cookieEnabled ? on() : off();
      }
    };
    // Chrome & Opera
    if (window.webkitRequestFileSystem) {
      return void window.webkitRequestFileSystem(0, 0, off, on);
    }
    // Firefox
    if ('MozAppearance' in document.documentElement.style) {
      const db = indexedDB.open('test');
      db.onerror = on;
      db.onsuccess = off;
      return void 0;
    }
    // Safari
    if (/constructor/i.test(window.HTMLElement)) {
      return testLocalStorage();
    }
    // IE10+ & Edge
    if (!window.indexedDB && (window.PointerEvent || window.MSPointerEvent)) {
      return on();
    }
    // others
    return off();
  });
}

export default AppContainer;