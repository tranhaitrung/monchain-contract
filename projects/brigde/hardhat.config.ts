import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen';
require('dotenv').config({ path: require('find-config')('.env') })

const ALCHEMY_API = "https://eth-sepolia.g.alchemy.com/v2/uXfYFoVMlGmEwIk8eAxNE1OFYn81VEA1";
const ALCHEMY_API_ARB = "https://arb-goerli.g.alchemy.com/v2/Js2GreZfvmRw79DnWQzS-iKOk2YH_w-R";
const PRIVATE_KEY = "0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9";//anh
// const VERIFY_KEY_ETH = "98489253c04386e372cdf5f5b56e8e553fe18487ff38d06a759a2abaf096f074"; //E471
// const VERIFY_KEY_BNB = "f94045212f5d4fcd912e1283b1c69e4d85703068f5e69ff3c3166698d0d3ebb3"; //0xE30c018fd3a800745dDFC9A0886007359Ff30cA0
// const VERIFY_KEY_ARB = "b917c35decfbb124924be7e2e56e068107ceac4c8c69f9807257a99739bba631"; //0x36fE0c7423535dBAc5835207597BD2BC2AF16792
const VERIFY_KEY_ETH = "uXfYFoVMlGmEwIk8eAxNE1OFYn81VEA1";
const VERIFY_KEY_BNB = "7IY4B5UVDAPEZDTBNBZH3Z3J7FQ81RUNX8";
const VERIFY_KEY_ARB = "Js2GreZfvmRw79DnWQzS-iKOk2YH_w-R";
const VERIFY_KEY_MON = "uXfYFoVMlGmEwIk8eAxNE1OFYn81VEA1";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      }
    ],
  },
  networks: {
    monchain: {
      url: 'https://rpc-testnet.monchain.info',
      chainId: 16789,
      accounts: [PRIVATE_KEY],
      // gas: 5000000, // Thử đặt gas cố định
      // gasPrice: 20000000000, // 20 Gwei (tuỳ chỉnh theo mạng)
      gasMultiplier: 1.5, // Tăng gas multiplier để tránh lỗi thiếu gas
      // timeout: 120000, // 120s
    },
    bsctestnet: {
      url: 'https://bsc-testnet-rpc.publicnode.com',
      chainId: 97,
      accounts: [PRIVATE_KEY],
      gas: 5000000, // Thử đặt gas cố định
      gasPrice: 20000000000, // 20 Gwei (tuỳ chỉnh theo mạng)
      gasMultiplier: 1.5, // Tăng gas multiplier để tránh lỗi thiếu gas
      // timeout: 120000, // 120s
    },
  },
  etherscan: {
    apiKey: {
      'monchain': VERIFY_KEY_MON,
      'bsctestnet': VERIFY_KEY_BNB
    },
    customChains: [
      {
        network: "monchain",
        chainId: 16789,
        urls: {
          apiURL: "https://dev.blockscout.hdev99.io.vn/api",
          browserURL: "https://dev.explorer.hdev99.io.vn:443"
        }
      },
      {
        network: "bsctestnet",
        chainId: 97,
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
