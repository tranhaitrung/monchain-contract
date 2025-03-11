import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'

require('dotenv').config({ path: require('find-config')('.env') })

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 400,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

// const bscTestnet: NetworkUserConfig = {
//   url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
//   chainId: 97,
//   accounts: [process.env.KEY_TESTNET!],
// }

// const bscMainnet: NetworkUserConfig = {
//   url: 'https://bsc-dataseed.binance.org/',
//   chainId: 56,
//   accounts: [process.env.KEY_MAINNET!],
// }

// const goerli: NetworkUserConfig = {
//   url: 'https://rpc.ankr.com/eth_goerli',
//   chainId: 5,
//   accounts: [process.env.KEY_GOERLI!],
// }

// const eth: NetworkUserConfig = {
//   url: 'https://rpc.monchain.info',
//   chainId: 1,
//   accounts: ['0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9'],
// }

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    // mainnet: bscMainnet,
    monchain: {
      url: 'https://rpc-testnet.monchain.info',
      chainId: 16789,
      accounts: ['0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9'],
      gasPrice: 20000000000, // 20 gwei
    },
  },
  etherscan: {
    apiKey: {
      monchain: 'empty'
    },
    customChains: [
      {
        network: "monchain",
        chainId: 16789,
        urls: {
          apiURL: "https://dev.blockscout.hdev99.io.vn/api",
          browserURL: "https://dev.blockscout.hdev99.io.vn/"
        }
      }
    ]
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/MonPool.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/MonPoolDeployer.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      // 'contracts/test/OutputCodeHash.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  docgen: {
    pages: 'files',
  },
}
