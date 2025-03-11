import { NonfungibleTokenPositionDescriptor } from './../typechain-types/contracts/NonfungibleTokenPositionDescriptor';
import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { linkLibraries } from '../util/linkLibraries'
import { tryVerify } from '@pancakeswap/common/verify'
import fs from 'fs'


type ContractJson = { abi: any; bytecode: string };
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  Mon_SpokePool: require("../artifacts/contracts/Mon_SpokePool.sol/Mon_SpokePool.json"),
};

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
    fillDeadlineBuffer: 21600,
    initialDepositId: 0,
    withdrawalRecipient: '0x4298706288f08E37B41096e888B00100Bd99e060'
  }

  console.log('config', config)

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  // const MonSpokePool = await ethers.getContractFactory('Mon_SpokePool')

   const MonSpokePool = new ContractFactory(artifacts.Mon_SpokePool.abi, artifacts.Mon_SpokePool.bytecode, owner);
  // const monSpokePool = await upgrades.deployProxy(MonSpokePool, [
  //   config.WNATIVE, config.depositQuoteTimeBuffer, config.fillDeadlineBuffer,
  // ], { initializer: "initialize" })
  // console.info("toi day ne")
  const monSpokePool = await MonSpokePool.deploy(config.WNATIVE, config.depositQuoteTimeBuffer, config.fillDeadlineBuffer)
  console.log("🚀 ~ main ~ monSpokePool: ", monSpokePool.address)

  // // await tryVerify(nonfungibleTokenPositionDescriptor)



  const contracts = {
    MonSpokePool: monSpokePool.address
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
