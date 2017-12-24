
let openledger = "Openledger (OPEN.X)"
let blocktrades = "BlockTrades (TRADE.X)"
let cryptobot = "cryptobot"

let idea = ["crypto", "fiat"]
export default [
	{
		name: "ETH", //blocktrades OPEN.ETH
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	},

	{
		name: "BTC", //blocktrades OPEN.BTC
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	},

	{
		name: "DASH", //blocktrades OPEN.DASH
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	},

	{
		name: "LTC", //blocktrades OPEN.DASH
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	},
	{
		name: "USD", //blocktrades OPEN.USD
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	},
	{
	    name: "RUB",
	    deposit: [cryptobot],
	    widthdraw: []
	},
	{
	    name: "TRUSTY",
		deposit: [openledger,blocktrades],
		withdraw: [openledger,blocktrades]
	}   
]



