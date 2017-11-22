import React from "react";
import Translate from "react-translate-component";
import {saveAs} from "file-saver";
import Operation from "./Operation";
import ChainTypes from "../../Utility/ChainTypes";
import BindToChainState from "../../Utility/BindToChainState";
import utils from "common/utils";
import {ChainTypes as grapheneChainTypes} from "bitsharesjs/es";
import TransitionWrapper from "../../Utility/TransitionWrapper";
import ps from "perfect-scrollbar";
import counterpart from "counterpart";
import Icon from "../../Icon/Icon";

const {operations} = grapheneChainTypes;
const alignLeft = {textAlign: "left"};
const alignRight = {textAlign: "right"};

function compareOps(b, a) {
    if (a.block_num === b.block_num) {
        return a.virtual_op - b.virtual_op;
    } else {
        return a.block_num - b.block_num;
    }
}

function textContent(n) {
    return n ? `"${n.textContent.replace(/[\s\t\r\n]/gi, " ")}"` : "";
}

class RecentTransactions extends React.Component {

    static propTypes = {
        accountsList: ChainTypes.ChainAccountsList.isRequired,
        compactView: React.PropTypes.bool,
        limit: React.PropTypes.number,
        maxHeight: React.PropTypes.number,
        fullHeight: React.PropTypes.bool,
        showFilters: React.PropTypes.bool
    };

    static defaultProps = {
        limit: 25,
        maxHeight: 500,
        fullHeight: false,
        showFilters: false
    };

    constructor(props) {
        super();
        this.state = {
            limit: props.limit || 20,
            csvExport: false,
            headerHeight: 85,
            filter: "all"
        };
    }

    componentDidMount() {
        if (!this.props.fullHeight) {
            let t = this.refs.transactions;
            ps.initialize(t);
            this._setHeaderHeight();
        }
    }

    _setHeaderHeight() {
        let height = this.refs.header.offsetHeight;

        if (height !== this.state.headerHeight) {
            this.setState({
                headerHeight: height
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!utils.are_equal_shallow(this.props.accountsList, nextProps.accountsList)) return true;
        if(this.props.maxHeight !== nextProps.maxHeight) return true;
        if(this.state.headerHeight !== nextState.headerHeight) return true;
        if(this.state.filter !== nextState.filter) return true;
        if (this.props.customFilter) {
            if(!utils.are_equal_shallow(this.props.customFilter.fields, nextProps.customFilter.fields) ||
                !utils.are_equal_shallow(this.props.customFilter.values, nextProps.customFilter.values)) {
                return true;
            };
        }

        if(this.props.maxHeight !== nextProps.maxHeight) return true;
        if (nextState.limit !== this.state.limit || nextState.csvExport !== this.state.csvExport) return true;
        for(let key = 0; key < nextProps.accountsList.length; ++key) {
            let npa = nextProps.accountsList[key];
            let nsa = this.props.accountsList[key];
            if(npa && nsa && (npa.get("history") !== nsa.get("history"))) return true;
        }
        return false;
    }

    componentDidUpdate() {
        if (this.state.csvExport) {
            this.state.csvExport = false;
            const csv_export_container = document.getElementById("csv_export_container");
            const nodes = csv_export_container.childNodes;
            let csv = "";
            for (const n of nodes) {
                //console.log("-- RecentTransactions._downloadCSV -->", n);
                const cn = n.childNodes;
                if (csv !== "") csv += "\n";
                csv += [textContent(cn[0]), textContent(cn[1]), textContent(cn[2]), textContent(cn[3])].join(",");
            }
            var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            var today = new Date();
            saveAs(blob, ('btshist-' + today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2) + '-' + ('0' + today.getHours()).slice(-2) + ('0' + today.getMinutes()).slice(-2) + '.csv'));
        }

        if (!this.props.fullHeight) {
            let t = this.refs.transactions;
            ps.update(t);

            this._setHeaderHeight();

        }

    }

    _onIncreaseLimit() {
        this.setState({
            limit: this.state.limit + 10
        });
    }

    _getHistory(accountsList, filterOp, customFilter) {
        let history = [];
        let seen_ops = new Set();
        for (let account of accountsList) {
            if(account) {
                let h = account.get("history");
                if (h) history = history.concat(h.toJS().filter(op => !seen_ops.has(op.id) && seen_ops.add(op.id)));
            }
        }

        //Show only transfers
        // history = history.filter(a => {
        //         return a.op[0] === 0 || 
        // });

        return history;
    }

    _downloadCSV() {
        this.setState({csvExport: true});
    }

    _onChangeFilter(e) {
        this.setState({
            filter: e.target.value
        });
    }

    render() {
        let {accountsList, compactView, filter, customFilter, style, maxHeight} = this.props;
        let {limit, headerHeight} = this.state;
        let current_account_id = accountsList.length === 1 && accountsList[0] ? accountsList[0].get("id") : null;
        let history = this._getHistory(accountsList, this.props.showFilters && this.state.filter !== "all" ?  this.state.filter : filter, customFilter).sort(compareOps);
        let historyCount = history.length;

        style = style ? style : {};
        style.width = "100%";
        style.height = "100%";

        let display_history = history.length ?
            history.slice(0, limit)
            .map(o => {
                return (
                    <div key={o.id}>
                        <Operation
                            style={alignLeft}
                            key={o.id}
                            op={o.op}
                            result={o.result}
                            block={o.block_num}
                            current={current_account_id}
                            hideFee
                            inverted={false}
                            hideOpLabel={compactView}
                        />
                        <br/>
                        <br/>
                    </div>
                );
            }) : null;

        return (
            <div onClick={this._onIncreaseLimit.bind(this)} className="trusty_profile_incoming_depositis">
                <p>RECENT TRANSACTIONS</p>
                {display_history}
            </div>
        );
    }
}
RecentTransactions = BindToChainState(RecentTransactions, {keep_updating: true});

class TransactionWrapper extends React.Component {

    static propTypes = {
        asset: ChainTypes.ChainAsset.isRequired,
        to: ChainTypes.ChainAccount.isRequired,
        fromAccount: ChainTypes.ChainAccount.isRequired
    };

    static defaultProps = {
        asset: "1.3.0"
    };

    render() {
        return <span className="wrapper">{this.props.children(this.props)}</span>;
    }
}
TransactionWrapper = BindToChainState(TransactionWrapper);

export {RecentTransactions, TransactionWrapper};
