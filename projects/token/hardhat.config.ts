import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen';
require('dotenv').config({ path: require('find-config')('.env') })

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.7.0",
      },
    ],
  },
  networks: {
    monchain: {
      url: 'https://rpc-testnet.monchain.info',
      chainId: 16789,
      accounts: ['0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9'],
      gas: 5000000, // Thử đặt gas cố định
      gasPrice: 20000000000, // 20 Gwei (tuỳ chỉnh theo mạng)
      gasMultiplier: 1.5, // Tăng gas multiplier để tránh lỗi thiếu gas
      // timeout: 120000, // 120s
    },
  },
  etherscan: {
    apiKey: {
      'monchain': 'empty'
    },
    customChains: [
      {
        network: "monchain",
        chainId: 16789,
        urls: {
          apiURL: "https://dev.blockscout.hdev99.io.vn/api",
          browserURL: "https://dev.explorer.hdev99.io.vn:443"
        }
      }
    ]
  },
  paths: {
    sources: './contracts/',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}

export default config
