import { verifyContract } from "@pancakeswap/common/verify";
import { sleep } from "@pancakeswap/common/sleep";
import { configs } from "@pancakeswap/common/config";

async function main() {
  const networkName = 'monchain';

  const tokenDeployedContracts = await import(`../../token/deployments/${networkName}.json`)
  const coreDeployedContracts = await import(`../../v3-core/deployments/${networkName}.json`)
  const peripheryDeployedContracts = await import(`../../v3-periphery/deployments/${networkName}.json`)

  const config = {
    WNATIVE: tokenDeployedContracts.WMON,
    nativeCurrencyLabel: 'MON',
    v2Factory: coreDeployedContracts.MonFactory,
    TMON: '0xBbDc62F288da79D0195f219cd4AF0a1a6906935F',
    nonfungiblePositionManager: peripheryDeployedContracts.NonfungiblePositionManager
  }

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  const deployedContractsMasterchefV3 =  await import(`../deployments/${networkName}.json`);

  // Verify masterChefV3
  console.log("Verify masterChefV3");
  await verifyContract(deployedContractsMasterchefV3.MasterChefV3, [
    config.TMON,
    config.nonfungiblePositionManager,
    config.WNATIVE,
  ]);
  await sleep(10000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
