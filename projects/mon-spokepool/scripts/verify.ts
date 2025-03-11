import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, upgrades, network } from 'hardhat'

async function main() {
  const networkName = network.name

  console.log('networkName', networkName)

  const toeknDeployedContracts = await import(`../../token/deployments/${networkName}.json`)
  const config = {
    WNATIVE: toeknDeployedContracts.WMON,
    nativeCurrencyLabel: 'MON',
  }

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_v3_core = await import(`../../v3-core/deployments/${networkName}.json`)
  const deployedContracts_v3_periphery = await import(`../../v3-periphery/deployments/${networkName}.json`)

  // Verify swapRouter
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_v3_periphery.SwapRouter, [
    deployedContracts_v3_core.MonPoolDeployer,
    deployedContracts_v3_core.MonFactory,
    config.WNATIVE,
  ])
  await sleep(1000)

  // // Verify nonfungibleTokenPositionDescriptor
  // console.warn('\n\n=====================Start verify=====================')
  // console.log('Verify nonfungibleTokenPositionDescriptor')
  // await verifyContract(deployedContracts_v3_periphery.NonfungibleTokenPositionDescriptor)
  // await sleep(1000)

  // // Verify NonfungiblePositionManager
  // console.warn('\n\n=====================Start verify=====================')
  // console.log('Verify NonfungiblePositionManager')
  // await verifyContract(deployedContracts_v3_periphery.NonfungiblePositionManager, [
  //   deployedContracts_v3_core.MonPoolDeployer,
  //   deployedContracts_v3_core.MonFactory,
  //   config.WNATIVE,
  //   deployedContracts_v3_periphery.NonfungibleTokenPositionDescriptor,
  // ])
  // await sleep(1000)

  // Verify pancakeInterfaceMulticall
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify pancakeInterfaceMulticall')
  await verifyContract(deployedContracts_v3_periphery.PancakeInterfaceMulticall)
  await sleep(1000)

  // Verify v3Migrator
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify v3Migrator')
  await verifyContract(deployedContracts_v3_periphery.V3Migrator, [
    deployedContracts_v3_core.MonPoolDeployer,
    deployedContracts_v3_core.MonFactory,
    config.WNATIVE,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
  ])
  await sleep(1000)

  // Verify tickLens
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify tickLens')
  await verifyContract(deployedContracts_v3_periphery.TickLens)
  await sleep(1000)

  // Verify QuoterV2
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify QuoterV2')
  await verifyContract(deployedContracts_v3_periphery.QuoterV2, [
    deployedContracts_v3_core.MonPoolDeployer,
    deployedContracts_v3_core.MonFactory,
    config.WNATIVE,
  ])
  await sleep(1000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
