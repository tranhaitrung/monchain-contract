import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, network } from 'hardhat'
import { configs } from '@pancakeswap/common/config'

async function main() {
  const networkName = network.name
  const [owner] = await ethers.getSigners()

  console.log('networkName: ', networkName)
  console.log('owner: ', owner.address)

  const deployedTokenContracts = await import(`../../token/deployments/${networkName}.json`)
  const deployedSpokeContracts = await import(`../../spokepool/deployments/${networkName}.json`)

  const config = {
    WNATIVE: deployedTokenContracts.WMON,
    spokePoolAddress: deployedSpokeContracts.MonSpokePool
  }

  const deployedContracts = await import(`../deployments/${networkName}.json`)

  // // Verify monToken
  // console.log("\n====================================")
  // console.log('Verifying moonToken: ', deployedContractsMonToken.MoonToken)
  // await verifyContract(deployedContractsMonToken.MoonToken)
  // console.log('Verify moonToken success')
  // await sleep(1000)
  
  console.log("\n====================================")
  // Verify USDT
  console.log('Verify DiamondCutFacet: ', deployedContracts.DiamondCutFacet)
  await verifyContract(deployedContracts.DiamondCutFacet)
  console.log('Verify DiamondCutFacet success')
  await sleep(1000)

  console.log("\n====================================")
  // Verify LiFiDiamond
  console.log('Verify LiFiDiamond: ', deployedContracts.LiFiDiamond)
  await verifyContract(deployedContracts.LiFiDiamond, [owner.address, deployedContracts.DiamondCutFacet])
  console.log('Verify LiFiDiamond success')
  await sleep(1000)
  
  // Verify LiFiDiamond
  console.log('Verify AcrossFacetV3: ', deployedContracts.AcrossFacetV3)
  await verifyContract(deployedContracts.AcrossFacetV3, [config.spokePoolAddress, config.WNATIVE])
  console.log('Verify AcrossFacetV3 success')
  await sleep(1000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
