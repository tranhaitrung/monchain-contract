import { ethers, network } from 'hardhat'


async function main() {

    const [owner] = await ethers.getSigners()
    // Remember to update the init code hash in SC for different chains before deploying
    const networkName = network.name

  
    console.log('networkName: ', networkName)
    console.log('owner: ', owner.address)
  
    const deployedContracts = await import(`../deployments/${networkName}.json`)

    const config = {
      liFiDiamond: deployedContracts.LiFiDiamond,
      acrossFacetV3: deployedContracts.AcrossFacetV3,
      relayFacet: deployedContracts.RelayFacet,
    }

    const liFiDiamond = await ethers.getContractAt("RelayFacet", config.liFiDiamond);
    const bridgeData = {
    transactionId: ethers.utils.formatBytes32String("1"),
    bridge: "relay",
    integrator: "myApp",
    referrer: ethers.constants.AddressZero,
    sendingAssetId: "0x60677f295237B44a84d86dC67C9aE60B8412D017", // địa chỉ token
    receiver: "0x31fB83Dc60D27C9C4a58a361bc9c48e0Bcfe902B",
    minAmount: ethers.utils.parseEther("1"),
    destinationChainId: 97,
    hasSourceSwaps: false,
    hasDestinationCall: false
    };

    const messageHasd = calculateMessageHash({
        chainId: 16789,
        contractAddress: '0x63D41d835350E7d99655Df1218084daD4e8bf99f',
        destinationChainId: 97,
        receiver: '0x31fB83Dc60D27C9C4a58a361bc9c48e0Bcfe902B',
        receivingAssetId: '0x42bb01A90751411Aa607c2995f43785b5d57DcF1',
        requestId: '1',
        sendingAssetId: '0x60677f295237B44a84d86dC67C9aE60B8412D017'
    })

    console.info("🚀 ~ main ~ messageHash:", messageHasd)

    const signedMessage = await owner.signMessage(messageHasd);
    console.info("🚀 ~ main ~ signedMessage:", signedMessage)
    console.info("🚀 ~ main ~ signer:", recover(messageHasd, signedMessage))
    console.info("\n\n ======================================= \n\n")

    const signature = await signMessage(messageHasd, 'a7f40061a6baa428ac95d0ae5818bb7c2b8bff4c7c2fd43cc68af870e0a75bb9')
    console.info("🚀 ~ main ~ signature:", signature)

    const signer = recover(messageHasd, signature);
    console.info("🚀 ~ main ~ signer:", signer)

    return;

    const relayData = {
    requestId: ethers.utils.formatBytes32String("1"),
    nonEVMReceiver: ethers.constants.HashZero,
    receivingAssetId: ethers.utils.hexZeroPad("0x42bb01A90751411Aa607c2995f43785b5d57DcF1", 32),
    signature: signature
    };
    console.info("🚀 ~ main ~ relayData:", relayData)
    var txn = await liFiDiamond.startBridgeTokensViaRelay(bridgeData, relayData, { value: ethers.utils.parseEther("1") });

    console.info("🚀 ~ main ~ txn:", txn.hash)
}

async function signMessage(messageHash: string, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
}

function calculateMessageHash(
    {
        requestId, chainId, contractAddress, sendingAssetId, destinationChainId, receiver, receivingAssetId
    } : 
    {
        requestId: string,
        chainId: number,
        contractAddress: string,
        sendingAssetId: string,
        destinationChainId: number,
        receiver: string,
        receivingAssetId: string
    }
  ) : string {
    // Chuyển đổi các giá trị thành dạng bytes32
    const packedData = ethers.utils.solidityPack(
      ["bytes32", "uint256", "bytes32", "bytes32", "uint256", "bytes32", "bytes32"],
      [
        ethers.utils.formatBytes32String(requestId),
        chainId,
        ethers.utils.hexZeroPad(contractAddress, 32), // bytes32 từ address
        ethers.utils.hexZeroPad(sendingAssetId, 32),  // bytes32 từ address
        destinationChainId,
        ethers.utils.hexZeroPad(receiver, 32),        // bytes32 từ address
        ethers.utils.hexZeroPad(receivingAssetId, 32)
      ]
    );
  
    // Tính keccak256
    const keccakHash = ethers.utils.keccak256(packedData);
  
    // Áp dụng EIP-191
    return ethers.utils.hashMessage(ethers.utils.arrayify(keccakHash));
}

// // Recover signer's address from a message digest (hash) and signature
// function recover(hash: string, signature: string): string {
//     try {
//       // Đảm bảo hash và signature là chuỗi hex hợp lệ
//       if (!ethers.utils.isHexString(hash) || !ethers.utils.isHexString(signature)) {
//         throw new Error("Invalid hash or signature format");
//       }
  
//       // Khôi phục địa chỉ từ hash và chữ ký
//       const recoveredAddress = ethers.utils.recoverAddress(hash, signature);
//       return recoveredAddress;
//     } catch (error) {
//       throw new Error("InvalidSignature");
//     }
//   }

  // Hàm recover trả về địa chỉ người ký từ hash và chữ ký
function recover(hash: string, signature: Uint8Array | string): string {
    // Chuyển đổi signature thành Uint8Array nếu là chuỗi hex
    const sigBytes = typeof signature === "string" ? ethers.utils.arrayify(signature) : signature;
  
    // Kiểm tra độ dài chữ ký
    const sigLength = sigBytes.length;
    let v: number;
    let r: string;
    let s: string;
  
    if (sigLength === 64) {
      // Chữ ký EIP-2098 (64 bytes: r [32 bytes] + vs [32 bytes])
      r = ethers.utils.hexlify(sigBytes.slice(0, 32)); // Lấy 32 bytes đầu tiên cho r
      const vs = ethers.utils.arrayify(sigBytes.slice(32, 64)); // Lấy 32 bytes tiếp theo cho vs
      v = (vs[0] >> 7) + 27; // Lấy bit cao nhất của vs và cộng 27 để tính v
      s = ethers.utils.hexlify(
        ethers.BigNumber.from(ethers.utils.hexlify(vs)).shl(1).shr(1).toHexString()
      ); // Xóa bit cao nhất để lấy s
    } else if (sigLength === 65) {
      // Chữ ký truyền thống (65 bytes: r [32 bytes] + s [32 bytes] + v [1 byte])
      r = ethers.utils.hexlify(sigBytes.slice(0, 32)); // Lấy 32 bytes đầu tiên cho r
      s = ethers.utils.hexlify(sigBytes.slice(32, 64)); // Lấy 32 bytes tiếp theo cho s
      v = sigBytes[64]; // Lấy byte cuối cho v
    } else {
      throw new Error("InvalidSignature: Signature length must be 64 or 65 bytes");
    }
  
    // Tạo chữ ký đầy đủ từ r, s, v
    const fullSignature = ethers.utils.joinSignature({ r, s, v });
  
    // Khôi phục địa chỉ từ hash và chữ ký
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.utils.recoverAddress(hash, fullSignature);
    } catch (error) {
      throw new Error("InvalidSignature");
    }
  
    // Kiểm tra nếu không khôi phục được địa chỉ (tương đương returndatasize() == 0 trong Solidity)
    if (recoveredAddress === ethers.constants.AddressZero) {
      throw new Error("InvalidSignature");
    }
  
    return recoveredAddress;
}
  

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })