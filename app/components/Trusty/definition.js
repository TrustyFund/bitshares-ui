
let openledger = "Openledger (OPEN.X)"
let blocktrades = "BlockTrades (TRADE.X)"

["crypto", "fiat"]
export default = [
	{
		name: "ETH", //blocktrades OPEN.ETH
		services: [
			{
				name: openledger,
				deposit: [true,false],// ["crypto", "fiat"]
				withdraw: [true,false],
			},
			{
				name: blocktrades,
				deposit: [true, false],
				withdraw: [true, false],
			}
		]
	},

	{
		name: "BTC", //blocktrades OPEN.ETH
		services: [
			{
				name: openledger,
				deposit: [true,false],
				withdraw: [true,false],
			},
			{
				name: blocktrades,
				deposit: [true, false],
				withdraw: [true, false],
			}
		]
	},

	{
		name: "DASH", //blocktrades OPEN.ETH
		services: [
			{
				name: openledger,
				deposit: [true,false],
				withdraw: [true,false],
			},
			{
				name: blocktrades,
				deposit: [true, false],
				withdraw: [true, false],
			}
		]
	},
	{
		name: "USD", //blocktrades OPEN.ETH
		services: [
			{
				name: openledger,
				deposit: [true,false],
				withdraw: [true,false],
			},
			{
				name: blocktrades,
				deposit: [true, false],
				withdraw: [true, false],
			}
		]
	},
]



