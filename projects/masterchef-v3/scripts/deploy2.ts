/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { writeFileSync } from "fs";

async function main() {

  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  // Check if the network is supported.
  console.log(`Deploying to ${networkName} network...`);


  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts...");

  const [owner] = await ethers.getSigners()
  console.log('owner', owner.address)

  const tokenDeployedContracts = await import(`../../token/deployments/${networkName}.json`)
  const coreDeployedContracts = await import(`../../v3-core/deployments/${networkName}.json`)
  const peripheryDeployedContracts = await import(`../../v3-periphery/deployments/${networkName}.json`)

  const config = {
    WNATIVE: tokenDeployedContracts.WMON,
    nativeCurrencyLabel: 'MON',
    v2Factory: coreDeployedContracts.MonFactory,
    TMON: '0xBbDc62F288da79D0195f219cd4AF0a1a6906935F', // ORB
    nonfungiblePositionManager: peripheryDeployedContracts.NonfungiblePositionManager
  }

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }

  // const v3PeripheryDeployedContracts = await import(`@pancakeswap/v3-periphery/deployments/${networkName}.json`);
  const positionManager_address = config.nonfungiblePositionManager;

  const MasterChefV3 = await ethers.getContractFactory("MasterChefV3");
  const masterChefV3 = await MasterChefV3.deploy(config.TMON, positionManager_address, config.WNATIVE);

  console.log("masterChefV3 deployed to:", masterChefV3.address);
  // await tryVerify(masterChefV3, [config.cake, positionManager_address]);

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        MasterChefV3: masterChefV3.address,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
