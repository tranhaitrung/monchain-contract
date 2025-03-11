import { ethers, upgrades, network } from 'hardhat'
import fs from 'fs'

import Mon_SpokePoolArtifact from '../artifacts/contracts/Mon_SpokePool.sol/Mon_SpokePool.json'

async function main() {
  const networkName = network.name
  const [owner] = await ethers.getSigners()
  console.log('owner', owner.address)

  const deployedTokenContracts = await import(`../../token/deployments/${networkName}.json`)
  console.log('deployedContracts', deployedTokenContracts)

  const config = {
    WNATIVE: deployedTokenContracts.WMON,
    depositQuoteTimeBuffer: 3600,
    fillDeadlineBuffer: 21600,
    initialDepositId: 0,
    withdrawalRecipient: '0x4298706288f08E37B41096e888B00100Bd99e060'
  }

  const Mon_SpokePool = await ethers.getContractFactoryFromArtifact(Mon_SpokePoolArtifact)
  const monSpokePool = await upgrades.deployBeacon(Mon_SpokePool,
  {
    initializer: "initialize", // Hàm initialize
    unsafeAllow: ["constructor"], // Cho phép constructor với chú thích custom:oz-upgrades-unsafe-allow
    constructorArgs: [
      config.WNATIVE,
      config.depositQuoteTimeBuffer,
      config.fillDeadlineBuffer
    ], // Tham số constructor

    kind: "transparent", // Proxy kiểu transparent
    call: {
      fn: "initialize", // Gọi hàm initialize sau khi deploy
      args: [config.initialDepositId, config.withdrawalRecipient],
    },
  })
  await monSpokePool.deployed()
  console.log('monSpokePool deployed at', monSpokePool.address)

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
