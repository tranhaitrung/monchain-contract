import { NonfungibleTokenPositionDescriptor } from './../typechain-types/contracts/NonfungibleTokenPositionDescriptor';
import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { linkLibraries } from '../util/linkLibraries'
import { tryVerify } from '@pancakeswap/common/verify'
import fs from 'fs'
import { verifyContract } from '@pancakeswap/common/verify'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  NonfungiblePositionManagerDebug: require('../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
}

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

  const toeknDeployedContracts = await import(`../../token/deployments/${networkName}.json`)

  const config = {
    WNATIVE: toeknDeployedContracts.WMON,
    nativeCurrencyLabel: 'MON',
  }

  console.log('config', config)

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const deployedContracts = await import(`../../v3-core/deployments/${networkName}.json`)
  console.log('deployedContracts', deployedContracts)

  const monPoolDeployer_address = deployedContracts.MonPoolDeployer
  console.log("🚀 ~ main ~ monPoolDeployer_address:", monPoolDeployer_address)
  const monFactory_address = deployedContracts.MonFactory
  console.log("🚀 ~ main ~ monFactory_address:", monFactory_address)

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManagerDebug.abi,
    artifacts.NonfungiblePositionManagerDebug.bytecode,
    owner
  )
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    monPoolDeployer_address,
    monFactory_address,
    config.WNATIVE,
    '0xD82C9f6CC1B5c56fBD1ad7CE8B450cdcBAFA775d'
  )

  // await tryVerify(nonfungiblePositionManager, [
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   config.WNATIVE,
  //   nonfungibleTokenPositionDescriptor.address,
  // ])
  console.log('nonfungiblePositionManager', nonfungiblePositionManager.address)

  console.log('Verify NonfungiblePositionManager')
    await verifyContract(nonfungiblePositionManager.address, [
      monPoolDeployer_address,
      monFactory_address,
      config.WNATIVE,
      '0xD82C9f6CC1B5c56fBD1ad7CE8B450cdcBAFA775d',
    ])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
