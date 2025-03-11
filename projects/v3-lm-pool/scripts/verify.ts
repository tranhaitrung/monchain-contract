import { verifyContract } from '@pancakeswap/common/verify'
import { ethers, network } from 'hardhat'
import { sleep } from '@pancakeswap/common/sleep'
import { configs } from '@pancakeswap/common/config'

async function main() {
  const networkName = network.name

  console.log('Verifying contract at network: ', networkName)

  const deployedContracts_masterchef_v3 = await import(`../../masterchef-v3/deployments/${networkName}.json`)
  const deployedContracts_v3_lm_pool = await import(`../deployments/${networkName}.json`)

  // Verify monLmPoolDeployer
  console.log('Verify monLmPoolDeployer')
  await verifyContract(deployedContracts_v3_lm_pool.MonLmPoolDeployer, [
    deployedContracts_masterchef_v3.MasterChefV3,
  ])
  await sleep(1000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
