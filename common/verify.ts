import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { run } from 'hardhat'

export async function tryVerify(contract: Contract, constructorArguments: any[] = [], libraries: any = {}, contractA: string) {
  if (process.env.ETHERSCAN_API_KEY && process.env.NETWORK !== 'hardhat') {
    try {
      await contract.deployed()
      console.info('Verifying', contract.address, constructorArguments)
      const verify = await run('verify:verify', {
        address: contract.address,
        constructorArguments,
        libraries,
        contract: contractA
      })
      console.log(verify, 'verify')
    } catch (error) {
      console.error(error)
    }
  }
}

export async function verifyContract(contract: string, constructorArguments: any[] = [], contractPath?: string) {
  if (process.env.ETHERSCAN_API_KEY && process.env.NETWORK !== 'hardhat') {
    try {
      console.info('Verifying', contract, constructorArguments)
      const verify = await run('verify:verify', {
        address: contract,
        constructorArguments,
        contract: contractPath
      })
      console.log(contract, ' verify successfully')
    } catch (error) {
      console.log(
        '....................',
        contract,
        ' error start............................',
        '\n',
        error,
        '\n',
        '....................',
        contract,
        ' error end............................'
      )
    }
  } else {
    console.error('Required ETHERSCAN_API_KEY and NETWORK in .env')
  }
}
