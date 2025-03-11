import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, network } from 'hardhat'

async function main() {
  const networkName = network.name
    console.info("🚀 ~ main ~ networkName:", networkName)
    const [owner] = await ethers.getSigners()
    console.info("🚀 ~ main ~ owner:", owner)

    const tokenDeployedContracts = await import(`../../token/deployments/${networkName}.json`)


  const config = {
    v2Factory: '0x0000000000000000000000000000000000000000',
    stableFactory: '0x0000000000000000000000000000000000000000',
    stableInfo: '0x0000000000000000000000000000000000000000',
    WNATIVE: tokenDeployedContracts.WMON,
  }

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_smart_router = await import(`../deployments/${networkName}.json`)
  const v3CoreDeployedContracts = await import(`../../v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`../../v3-periphery/deployments/${networkName}.json`)

  const pancakeV3PoolDeployer_address = v3CoreDeployedContracts.MonPoolDeployer
  const pancakeV3Factory_address = v3CoreDeployedContracts.MonFactory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager

  // Verify SmartRouterHelper
  console.log('Verify SmartRouterHelper')
  await verifyContract(deployedContracts_smart_router.SmartRouterHelper)
  await sleep(1000)

  // Verify swapRouter
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_smart_router.SmartRouter, [
  
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    positionManager_address,
    config.WNATIVE,
  ])
  await sleep(1000)

  // // Verify mixedRouteQuoterV1
  console.log('Verify mixedRouteQuoterV1')
  await verifyContract(deployedContracts_smart_router.MixedRouteQuoterV1, [
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    config.v2Factory,
    config.stableFactory,
    config.WNATIVE,
  ])
  await sleep(1000)

  // Verify quoterV2
  console.log('Verify quoterV2')
  await verifyContract(deployedContracts_smart_router.QuoterV2, [
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    config.WNATIVE,
  ])
  await sleep(1000)

  // // Verify tokenValidator
  console.log('Verify tokenValidator')
  await verifyContract(deployedContracts_smart_router.TokenValidator, [
    config.v2Factory,
    positionManager_address,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
