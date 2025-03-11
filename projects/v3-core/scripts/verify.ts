import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'

async function main() {
  const networkName = 'monchain'
  const deployedContracts = await import(`@pancakeswap/v3-core/deployments/${networkName}.json`)

  // // Verify MonPoolDeployer.sol
  // console.log('Verify monPoolDeployer.sol')
  // await verifyContract(deployedContracts.MonPoolDeployer)
  // await sleep(10000)

  // // Verify pancakeV3Factory
  // console.log('Verify monFactory')
  // await verifyContract(deployedContracts.MonFactory, [deployedContracts.MonPoolDeployer])
  // await sleep(10000)

  console.log('Verify POOL')
  await verifyContract('0xa589c2f714F33d91C3c10d9Eb8C11686C465d622')
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
