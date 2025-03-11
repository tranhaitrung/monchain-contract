import bn from "bignumber.js";
import { Contract, ContractFactory, utils, BigNumber } from "ethers";
import { ethers, waffle } from "hardhat";
import { linkLibraries } from "../util/linkLibraries";

const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"; // BSC TESTNET

type ContractJson = { abi: any; bytecode: string };
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  SwapRouter: require("../artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  // eslint-disable-next-line global-require
  NFTDescriptor: require("../artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  // eslint-disable-next-line global-require
  NFTDescriptorEx: require("../artifacts/contracts/NFTDescriptorEx.sol/NFTDescriptorEx.json"),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptor: require("../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  // eslint-disable-next-line global-require
  NonfungiblePositionManager: require("../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.monchain.info");

  // Tạo một signer từ khóa riêng
  const privateKey = '0xa7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9';
  const owner = new ethers.Wallet(privateKey, provider);

  // const [owner] = await ethers.getSigegners()
  const networkName = await provider.getNetwork() ?? 'monchain';
  console.log('owner', owner.address)
  console.log('networkName', networkName)

  const pancakeV3PoolDeployer_address = '0x048ac439c9d2EB07B143b0734412fdcccc15c0c9';
  const pancakeV3Factory_address = '0x7B38ea25145283Bc45a5B9e4cC4e7afFC05573a5';

  const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner);
  const swapRouter = await SwapRouter.deploy(pancakeV3PoolDeployer_address, pancakeV3Factory_address, WBNB);
  console.log("swapRouter", swapRouter.address);

  const NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner);
  const nftDescriptor = await NFTDescriptor.deploy();
  console.log("nftDescriptor", nftDescriptor.address);

  const NFTDescriptorEx = new ContractFactory(
    artifacts.NFTDescriptorEx.abi,
    artifacts.NFTDescriptorEx.bytecode,
    owner
  );
  const nftDescriptorEx = await NFTDescriptorEx.deploy();
  console.log("nftDescriptorEx", nftDescriptorEx.address);

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    owner
  );
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
    WBNB,
    asciiStringToBytes32('MON'),
    nftDescriptorEx.address
  );
  console.log("nonfungibleTokenPositionDescriptor", nonfungibleTokenPositionDescriptor.address);

  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    WBNB,
    nonfungibleTokenPositionDescriptor.address
  );
  console.log("nonfungiblePositionManager", nonfungiblePositionManager.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
