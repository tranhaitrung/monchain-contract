import fs from 'fs'
import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'
import { ethers, network } from 'hardhat'
import { Interface } from 'ethers/lib/utils'


async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name

  console.log('networkName: ', networkName)
  console.log('owner: ', owner.address)

  const deployedTokenContracts = await import(`../../token/deployments/${networkName}.json`)
  const deployedSpokeContracts = await import(`../../spokepool/deployments/${networkName}.json`)

  const config = {
    WNATIVE: deployedTokenContracts.WMON,
    spokePoolAddress: deployedSpokeContracts.MonSpokePool
  }

  console.info("Config: ", config)

  // 1. Deploy DiamondCutFacet (Facet hỗ trợ diamondCut)
  console.info("\n\nDEPLOYING DiamondCutFacet ....");
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet"); // Giả sử bạn có contract này
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed()
  console.log("DiamondCutFacet deployed to:", diamondCutFacet.address);

  // 2. Deploy LiFiDiamond
  console.info("\n\nDEPLOYING LiFiDiamond ....");
  const LiFiDiamond = await ethers.getContractFactory("LiFiDiamond");
  const lifiDiamond = await LiFiDiamond.deploy(owner.address, diamondCutFacet.address);
  await lifiDiamond.deployed()
  console.log("LiFiDiamond deployed to:", lifiDiamond.address);

  // 3. Deploy AcrossFacetV3
  console.info("\n\nDEPLOYING AcrossFacetV3 ....");
  const AcrossFacetV3 = await ethers.getContractFactory("AcrossFacetV3");
  const acrossFacetV3 = await AcrossFacetV3.deploy(config.spokePoolAddress, config.WNATIVE);
  await acrossFacetV3.deployed()
  console.log("AcrossFacetV3 deployed to:", acrossFacetV3.address);

  console.info("Deploy done")

  // 4. Thêm AcrossFacetV3 làm facet vào LiFiDiamond
  const diamondCut = await ethers.getContractAt("IDiamondCut", lifiDiamond.address);
  const acrossFacetInterface = new Interface([
    "function startBridgeTokensViaAcrossV3((bytes32,string,address,address,uint256,uint256,bool,bytes), (address,address,address,uint256,address,uint32,uint32,uint32,bytes)) external payable",
    "function swapAndStartBridgeTokensViaAcrossV3((bytes32,string,address,address,uint256,uint256,bool,bytes), (address,bytes32,uint256,address)[], (address,address,address,uint256,address,uint32,uint32,uint32,bytes)) external payable",
  ]);
  const functionSelectors = [
    acrossFacetInterface.getFunction("startBridgeTokensViaAcrossV3").format(),
    acrossFacetInterface.getFunction("swapAndStartBridgeTokensViaAcrossV3").format(),
  ];

  const cut = [{
    facetAddress: acrossFacetV3.address,
    action: 0, // 0 = Add
    functionSelectors: functionSelectors,
  }];

  const tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, "0x");
  await tx.wait();
  console.log("Added AcrossFacetV3 as facet to LiFiDiamond");


  const contracts = {
    DiamondCutFacet: diamondCutFacet.address,
    LiFiDiamond: lifiDiamond.address,
    AcrossFacetV3: acrossFacetV3.address
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
