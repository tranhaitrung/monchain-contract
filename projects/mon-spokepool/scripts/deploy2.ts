import { NonfungibleTokenPositionDescriptor } from './../typechain-types/contracts/NonfungibleTokenPositionDescriptor';
import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { linkLibraries } from '../util/linkLibraries'
import { tryVerify } from '@pancakeswap/common/verify'
import fs from 'fs'

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const networkName = network.name
  const [owner] = await ethers.getSigners()

  console.log('networkName: ', networkName)
  console.log('owner: ', owner.address)

  const deployedTokenContracts = await import(`../../token/deployments/${networkName}.json`)
  console.log('deployedContracts', deployedTokenContracts)

  const config = {
    WNATIVE: deployedTokenContracts.WMON,
    depositQuoteTimeBuffer: 3600,
    fillDeadlineBuffer: 21600
  }

  console.log('config', config)

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const MonSpokePool = await ethers.getContractFactory('Mon_SpokePool')

  const monSpokePool = await upgrades.deployProxy(MonSpokePool, [
    config.WNATIVE, config.depositQuoteTimeBuffer, config.fillDeadlineBuffer,
  ])
  await monSpokePool.deployed()
  console.log("🚀 ~ main ~ nonfungibleTokenPositionDescriptor: ", monSpokePool.address)

  // // await tryVerify(nonfungibleTokenPositionDescriptor)

  // const NonfungiblePositionManager = new ContractFactory(
  //   artifacts.NonfungiblePositionManager.abi,
  //   artifacts.NonfungiblePositionManager.bytecode,
  //   owner
  // )
  // const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
  //   monPoolDeployer_address,
  //   monFactory_address,
  //   config.WNATIVE,
  //   nonfungibleTokenPositionDescriptor.address
  // )

  // // await tryVerify(nonfungiblePositionManager, [
  // //   pancakeV3PoolDeployer_address,
  // //   pancakeV3Factory_address,
  // //   config.WNATIVE,
  // //   nonfungibleTokenPositionDescriptor.address,
  // // ])
  // console.log('nonfungiblePositionManager', nonfungiblePositionManager.address)

  const MonInterfaceMulticall = new ContractFactory(
    artifacts.MonInterfaceMulticall.abi,
    artifacts.MonInterfaceMulticall.bytecode,
    owner
  )

  const monInterfaceMulticall = await MonInterfaceMulticall.deploy()
  console.log('MonInterfaceMulticall', monInterfaceMulticall.address)

  // await tryVerify(pancakeInterfaceMulticall)

  const V3Migrator = new ContractFactory(artifacts.V3Migrator.abi, artifacts.V3Migrator.bytecode, owner)
  const v3Migrator = await V3Migrator.deploy(
    monPoolDeployer_address,
    monFactory_address,
    config.WNATIVE,
    '0x3beEDf6cE77CBdD85f04E1B5Cdd82c04d853b910'
  )
  console.log('V3Migrator', v3Migrator.address)

  // await tryVerify(v3Migrator, [
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   config.WNATIVE,
  //   nonfungiblePositionManager.address,
  // ])

  const TickLens = new ContractFactory(artifacts.TickLens.abi, artifacts.TickLens.bytecode, owner)
  const tickLens = await TickLens.deploy()
  console.log('TickLens', tickLens.address)

  // await tryVerify(tickLens)

  const QuoterV2 = new ContractFactory(artifacts.QuoterV2.abi, artifacts.QuoterV2.bytecode, owner)
  const quoterV2 = await QuoterV2.deploy(monPoolDeployer_address, monFactory_address, config.WNATIVE)
  console.log('QuoterV2', quoterV2.address)

  // await tryVerify(quoterV2, [pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE])

  const contracts = {
    MonSpokePool: monSpokePool.address,
    V3Migrator: v3Migrator.address,
    QuoterV2: quoterV2.address,
    TickLens: tickLens.address,
    // NFTDescriptor: nftDescriptor.address,
    // NFTDescriptorEx: nftDescriptorEx.address,
    NonfungibleTokenPositionDescriptor: '0xD82C9f6CC1B5c56fBD1ad7CE8B450cdcBAFA775d',
    NonfungiblePositionManager: '0x3beEDf6cE77CBdD85f04E1B5Cdd82c04d853b910',
    MonInterfaceMulticall: monInterfaceMulticall.address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
