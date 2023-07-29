// For simplicity we use `web3` package here. However, if you are concerned with the size,
// you may import individual packages like 'web3-eth', 'web3-eth-contract' and 'web3-providers-http'.
import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface Config {
    RPC_ENDPOINT?: string;
    ACCOUNT_ADDRESS?: string;
    PRIVATE_KEY?: string;
}

const config: Config = {
    RPC_ENDPOINT: process.env.RPC_ENDPOINT,
    ACCOUNT_ADDRESS: process.env.ACCOUNT_ADDRESS,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
};

if (!config.RPC_ENDPOINT || !config.ACCOUNT_ADDRESS || !config.PRIVATE_KEY) {
    throw new Error('Required configuration is missing.');
}


// Set up a connection to the Ethereum network
const web3 = new Web3(process.env.RPC_ENDPOINT);

// Read the bytecode from the file system
const bytecodePath = path.join(__dirname, '..', 'UtilityBytecode.bin');
const bytecode = fs.readFileSync(bytecodePath, 'utf8');

// Create a new contract object using the ABI
const abiPath = path.join(__dirname, '..', 'UtilityAbi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const UtilityContract = new web3.eth.Contract(abi);

// smart contract data
const data = UtilityContract.deploy({
    data: bytecode
}).encodeABI();

const fromAddress: string = config.ACCOUNT_ADDRESS;
const privateKey: string = config.PRIVATE_KEY;

async function deploy(): Promise<void> {
    console.log('deployer account:', fromAddress);
    console.log('deployer private key:', privateKey);
    const privateKeyHex = '0x' + privateKey
    console.log('deployer private key:', privateKeyHex);

    const utilityContract = UtilityContract.deploy({
        data: '0x' + bytecode,
        arguments: [],  // Adjust if your contract's constructor needs arguments
    });

    // Optionally, estimate the gas that will be used for development and log it
    // const gas = await utilityContract.estimateGas({
    //     from: defaultAccount,
    // });
    // console.log('estimated gas:', gas);  

    const nonce = await web3.eth.getTransactionCount(fromAddress);
    console.log("nonce", nonce)

    const gasPrice = await web3.eth.getGasPrice()
    console.log("gasPrice", gasPrice)

    const txData = {
        from: fromAddress,
        nonce: web3.utils.toHex(nonce),
        data: data,
        gas: "3000000",
        gasPrice: gasPrice
    };


    const tx = await web3.eth.accounts.signTransaction(txData, privateKeyHex);
    if (!tx.rawTransaction) {
        throw new Error("Failed to sign the transaction");
    }
    console.log("tx", tx)

    const rawTransaction = tx.rawTransaction;

    try {


        web3.eth.sendSignedTransaction(rawTransaction)
            .on('receipt', (receipt) => {
                console.log(`Contract deployed : ${receipt}`);
                console.log(`Contract deployed at address: ${receipt.contractAddress}`);

                if (receipt.contractAddress) {
                    const deployedAddressPath = path.join(__dirname, '..', 'UtilityContractAddress.bin');
                    fs.writeFileSync(deployedAddressPath, receipt.contractAddress);
                }
            })

            .on('error', (error: Error) => {
                console.error("Error HERE:", error);
            });
    } catch (error) {
        console.error("TRY CATCH ERROR LOG", error);
    }


}

deploy();
