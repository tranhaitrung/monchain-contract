import { ethers, network } from 'hardhat'
import { configs } from '@pancakeswap/common/config'
import { tryVerify } from '@pancakeswap/common/verify'
import fs from 'fs'
import { abi } from '../../v3-core/artifacts/contracts/MonFactory.sol/MonFactory.json'

import { parseEther } from 'ethers/lib/utils'
const currentNetwork = network.name

async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name

  console.log('Deploying to network: ', network)
  console.log('Owner address: ', owner.address)

  const v3DeployedContracts = await import(`../../v3-core/deployments/${networkName}.json`)
  const mcV3DeployedContracts = await import(`../../masterchef-v3/deployments/${networkName}.json`)

  const monFactory_address = v3DeployedContracts.MonFactory

  const MonLmPoolDeployer = await ethers.getContractFactory('MonLmPoolDeployer')
  const monLmPoolDeployer = await MonLmPoolDeployer.deploy(mcV3DeployedContracts.MasterChefV3)

  console.log('monLmPoolDeployer deployed to:', monLmPoolDeployer.address)

  const monFactory = new ethers.Contract(monFactory_address, abi, owner)

  await monFactory.setLmPoolDeployer(monLmPoolDeployer.address)

  const contracts = {
    MonLmPoolDeployer: monLmPoolDeployer.address,
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
