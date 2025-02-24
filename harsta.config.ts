import { defineConfig } from 'harsta'

const currency = { decimals: 18, name: 'MXC Token', symbol: 'MXC' }

const config = defineConfig({
  solidity: { version: '0.8.24' },
  defaultNetwork: 'geneva',
  networks: {
    geneva: {
      name: 'Moonchain',
      rpc: 'https://geneva-rpc.moonchain.com',
      testnet: true,
      id: 5167004,
      currency,
    },
    moonchain: {
      name: 'Moonchain',
      rpc: 'https://rpc.mxc.com',
      id: 18686,
      currency,
    },
  },
})

export default config
