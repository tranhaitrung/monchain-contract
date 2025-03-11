import { ethers, network } from 'hardhat'
import fs from 'fs'
import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'

async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name

  console.log('networkName: ', networkName)
  console.log('networkConfig: ', network.config)
  console.log('owner: ', owner.address)

  // const MoonToken = await ethers.getContractFactory('MoonToken')
  // const moonToken = await MoonToken.deploy()
  
  // console.log('moonToken deployed to:', moonToken.address)
  
  // const TetherToken = await ethers.getContractFactory('TetherTokenV2')
  // const tetherToken = await TetherToken.deploy(1000000*(10**6))
  // console.log('USDT deployed to:', tetherToken.address)
  // await sleep(10000)
  // console.log('Verify USDT: ', tetherToken.address)
  // await verifyContract(tetherToken.address, [10000000*(10**6)], 'contracts/USDT.sol:TetherTokenV2')
  // console.log('Verify USDT success')
  
  // const WMON = await ethers.getContractFactory('WMON9')
  // const wmon = await WMON.deploy()
  // console.log('WMON deployed to:', wmon.address)

  // const Lynkey = await ethers.getContractFactory('Lynkey')
  // const lynkey = await Lynkey.deploy()
  
  // console.log('lynkey deployed to:', lynkey.address)

  // const WoodToken = await ethers.getContractFactory('WoodToken')
  // const woodToken = await WoodToken.deploy()
  // console.log('WOOD deployed to:', woodToken.address)

  const T8Token = await ethers.getContractFactory('WO8Token')
  const t8Token = await T8Token.deploy()
  console.log('8 deployed to:', t8Token.address)
  await sleep(10000)
  console.log('Verify 8: ', t8Token.address)
  await verifyContract(t8Token.address, [], 'contracts/WO8.sol:WO8Token')
  console.log('Verify AC8 success')

  const Pc6Token = await ethers.getContractFactory('WO6Token')
  const wooToken = await Pc6Token.deploy()
  console.log('6 deployed to:', wooToken.address)
  await sleep(10000)
  console.log('Verify 6: ', wooToken.address)
  await verifyContract(wooToken.address, [], 'contracts/WO6.sol:WO6Token')
  console.log('Verify AC6 success')

  // const Pc6Token = await ethers.getContractFactory('T10Token')
  // const wooToken = await Pc6Token.deploy()
  // console.log('6 deployed to:', wooToken.address)




  // const contracts = {
  //   MoonToken: moonToken.address,
  //   USDT: tetherToken.address,
  //   WMON: wmon.address,
  //   lynkey: lynkey.address,
  //   woodToken: woodToken.address,
  //   wooToken: wooToken.address
  // }
  // fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
