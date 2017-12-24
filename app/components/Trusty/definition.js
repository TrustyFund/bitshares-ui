
let openledger = "Openledger (OPEN.X)"
let blocktrades = "BlockTrades (TRADE.X)"

let idea = ["crypto", "fiat"]
export default [
	{
		name: "ETH", //blocktrades OPEN.ETH
		services: [openledger,blocktrades]
	},

	{
		name: "BTC", //blocktrades OPEN.ETH
		services: [openledger,blocktrades]
	},

	{
		name: "DASH", //blocktrades OPEN.ETH
		services: []
	},
	{
		name: "USD", //blocktrades OPEN.ETH
		services: []
	},
]



