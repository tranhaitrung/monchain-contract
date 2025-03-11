import { tryVerify } from '@pancakeswap/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

import '../artifacts/contracts/MonFactory.sol/MonFactory.json';

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  MonPoolDeployer: require('../artifacts/contracts/MonPoolDeployer.sol/MonPoolDeployer.json'),
  // eslint-disable-next-line global-require
  MonFactory: require('../artifacts/contracts/MonFactory.sol/MonFactory.json'),
}

async function main() {

  // const provider = new ethers.providers.JsonRpcProvider("https://rpc.monchain.info");
  //
  // // Tạo một signer từ khóa riêng
  // const privateKey = '0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9';
  // const owner = new ethers.Wallet(privateKey, provider);

  const [owner] = await ethers.getSigners()
  const networkName = network.name;
  console.log('owner', owner.address)
  console.log('networkName', networkName)

  let monPoolDeployer_address = ''
  let monPoolDeployer
  const MonPoolDeployer = await ethers.getContractFactory('MonPoolDeployer')
  if (!monPoolDeployer_address) {
    monPoolDeployer = await MonPoolDeployer.deploy()

    monPoolDeployer_address = monPoolDeployer.address
    console.log('monPoolDeployer', monPoolDeployer_address)
  } else {
    monPoolDeployer = new ethers.Contract(
      monPoolDeployer_address,
      artifacts.MonPoolDeployer.abi,
      owner
    )
  }

  let monFactory_address = ''
  let monFactory
  if (!monFactory_address) {
    const MonFactory = await ethers.getContractFactory('MonFactory')
    console.warn('Deploying MonFactory')
    monFactory = await MonFactory.deploy(monPoolDeployer_address)

    monFactory_address = monFactory.address
    console.log('monFactory', monFactory_address)
  } else {
    monFactory = new ethers.Contract(monFactory_address, artifacts.MonFactory.abi, owner)
  }

  // Set FactoryAddress for pancakeV3PoolDeployer.
  await monPoolDeployer.setFactoryAddress(monFactory_address);


  const contracts = {
    MonFactory: monFactory_address,
    MonPoolDeployer: monPoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
