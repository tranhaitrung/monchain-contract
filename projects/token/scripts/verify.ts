import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, network } from 'hardhat'
import { configs } from '@pancakeswap/common/config'

async function main() {
  const networkName = network.name
  const [owner] = await ethers.getSigners()

  console.log('networkName: ', networkName)
  console.log('owner: ', owner.address)

  const deployedContractsMonToken = await import(`../deployments/${networkName}.json`)

  // // Verify monToken
  // console.log("\n====================================")
  // console.log('Verifying moonToken: ', deployedContractsMonToken.MoonToken)
  // await verifyContract(deployedContractsMonToken.MoonToken)
  // console.log('Verify moonToken success')
  // await sleep(1000)
  
  console.log("\n====================================")
  // Verify USDT
  console.log('Verify USDT: ', deployedContractsMonToken.USDT)
  await verifyContract('0x9cef79694e03C9293Fd1A512AFCC6073E4673Bf3', [10000000*(10**8)], 'contracts/USD8.sol:T8Token')
  console.log('Verify USDT success')
  await sleep(1000)

  console.log("\n====================================")
  // Verify USDT
  console.log('Verify USDT: ', deployedContractsMonToken.USDT)
  await verifyContract('0x291684B2c54d67Ed1CE454ED1378f19C645C78D5', [10000000*(10**6)], 'contracts/PC6.sol:PC6Token')
  console.log('Verify USDT success')
  await sleep(1000)
  
  // console.log("\n====================================")
  // // Verify pancakeV3LmPoolDeployer
  // console.log('Verify WMON: ', deployedContractsMonToken.WMON)
  // await verifyContract(deployedContractsMonToken.WMON)
  // console.log('Verify WMON success')
  // await sleep(1000)

  // // Verify monToken
  // console.log("\n====================================")
  // console.log('Verifying moonToken: ', deployedContractsMonToken.lynkey)
  // await verifyContract(deployedContractsMonToken.lynkey)
  // console.log('Verify moonToken success')
  // await sleep(1000)

  // console.log("\n====================================")
  // // Verify USDT
  // console.log('Verify woodToken: ', deployedContractsMonToken.woodToken)
  // await verifyContract(deployedContractsMonToken.woodToken, [], 'contracts/WOOD.sol:WoodToken')
  // console.log('Verify woodToken success')
  // await sleep(1000)

  // console.log("\n====================================")
  // // Verify pancakeV3LmPoolDeployer
  // console.log('Verify wooToken: ', deployedContractsMonToken.wooToken)
  // await verifyContract(deployedContractsMonToken.wooToken, [], 'contracts/WOO.sol:WooToken')
  // console.log('Verify wooToken success')
  // await sleep(1000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
