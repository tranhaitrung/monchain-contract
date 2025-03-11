import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, upgrades, network } from 'hardhat'

async function main() {
  const networkName = network.name

  console.log('networkName', networkName)

  const tokenDeployedContracts = await import(`../../token/deployments/${networkName}.json`)
  const config = {
    WNATIVE: tokenDeployedContracts.WMON,
    depositQuoteTimeBuffer: 3600,
    fillDeadlineBuffer: 21600
  }

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContractsSpoke = await import(`../deployments/${networkName}.json`)

  // Verify swapRouter
  console.warn('\n\n=====================Start verify=====================')
  console.log('Verify swapRouter')
  await verifyContract(deployedContractsSpoke.MonSpokePool, [
    config.WNATIVE,
    config.depositQuoteTimeBuffer,
    config.fillDeadlineBuffer,
  ])
  await sleep(1000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
