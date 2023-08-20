import { Web3 } from 'web3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || "";
console.log("RPC_ENDPOINT", RPC_ENDPOINT);
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1 as string;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2 as string;
const PRIVATE_KEY_3 = process.env.PRIVATE_KEY_3 as string;

const web3 = new Web3(new Web3.providers.HttpProvider(RPC_ENDPOINT));


const deployedAddressPath = path.join(__dirname, '..', 'UtilityContractAddress.bin');
const deployedAddress = fs.readFileSync(deployedAddressPath, 'utf8');


const abiPath = path.join(__dirname, '..', 'UtilityAbi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

const UtilityContract = new web3.eth.Contract(abi, deployedAddress);

async function interact() {

    // Obtain the address from private key
    const address1 = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY_1).address;
    const address2 = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY_2).address;
    const address3 = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY_3).address;

    const providersAccounts = [address1, address2, address3];
    console.log("Accounts", providersAccounts);

    const defaultAccount = address1;
    const anotherAccount = address2; // Assuming you have multiple accounts

    try {
        // 1. Register a NYM
        // Ensure that the function signature below matches your actual smart contract function signature.
        const _dest = address3; // example
        const _role = 2; // just an example value, set as needed
        const _version = 10; // example
        const _endpoint = "http://canon.ca"; // example

        // // 1. Register a NYM
        // const tx = await (UtilityContract.methods.registerNYM as any)(_dest, _role, _version, _endpoint);
        // const gas = await tx.estimateGas({ from: defaultAccount });
        // const gasPrice = await web3.eth.getGasPrice();
        // const data = tx.encodeABI();
        // const nonce = await web3.eth.getTransactionCount(defaultAccount);

        // const rawTx = {
        //     from: defaultAccount,
        //     to: deployedAddress,
        //     gas,
        //     gasPrice,
        //     data,
        //     nonce,
        // };
        // const signedTx = await web3.eth.accounts.signTransaction(rawTx, '0x' + PRIVATE_KEY_1);
        // const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);
        // console.log('Transaction Hash for registerNYM:', receipt.transactionHash);

        // const nymDetails = await (UtilityContract.methods.getNYM as any)(defaultAccount).call();
        // console.log('NYM details:', nymDetails);


        // 1. Register a Schema
        const schema_owner = defaultAccount;
        const trust_registry = anotherAccount;
        const version = 1;
        const name = "ExampleSchema-8";
        const attributes = ["attribute1", "attribute2", "attribute3"];

        const txSchema = await (UtilityContract.methods.registerSchema as any)(schema_owner, trust_registry, version, name, attributes);
        const gasSchema = await txSchema.estimateGas({ from: defaultAccount });
        const gasPriceSchema = await web3.eth.getGasPrice();
        const dataSchema = txSchema.encodeABI();
        const nonceSchema = await web3.eth.getTransactionCount(defaultAccount);

        const rawTxSchema = {
            from: defaultAccount,
            to: deployedAddress,
            gas: gasSchema,
            gasPrice: gasPriceSchema,
            data: dataSchema,
            nonce: nonceSchema,
        };

        const signedTxSchema = await web3.eth.accounts.signTransaction(rawTxSchema, '0x' + PRIVATE_KEY_1);
        const receiptSchema = await web3.eth.sendSignedTransaction(signedTxSchema.rawTransaction as string);
        console.log('Transaction Hash for registerSchema:', receiptSchema.transactionHash);

        let schemaRegisteredEvent;
        let schemaID;
        for (const log of receiptSchema.logs) {
            if (log.topics![0] === web3.utils.sha3('SchemaRegistered(bytes20,string)')) {
                schemaRegisteredEvent = log;
                break;
            }
        }

        if (schemaRegisteredEvent) {
            console.log('Found SchemaRegistered event:', schemaRegisteredEvent);
            schemaID = (schemaRegisteredEvent as any).topics[1].slice(0, 42)
        } else {
            console.log('SchemaRegistered event not found');
        }


        console.log("schemaID", schemaID)
        const schemaDetails = await (UtilityContract.methods.getSCHEMA as any)(schemaID).call(); console.log('Schema details:', schemaDetails);

        // 2. Register CredDef
        const cred_def_owner = defaultAccount;
        const revocation_registry = address3;
        const signature = 1;  // example value, adjust as needed
        const schema_id = schemaID; const tag = "ExampleTag-8";

        const txCredDef = await (UtilityContract.methods.registerCredDef as any)(cred_def_owner, trust_registry, revocation_registry, signature, schema_id, tag);
        const gasCredDef = await txCredDef.estimateGas({ from: defaultAccount });
        const dataCredDef = txCredDef.encodeABI();
        const nonceCredDef = await web3.eth.getTransactionCount(defaultAccount, 'pending');

        const rawTxCredDef = {
            from: defaultAccount,
            to: deployedAddress,
            gas: gasCredDef,
            gasPrice: gasPriceSchema,
            data: dataCredDef,
            nonce: nonceCredDef,
        };

        const signedTxCredDef = await web3.eth.accounts.signTransaction(rawTxCredDef, '0x' + PRIVATE_KEY_1);
        const receiptCredDef = await web3.eth.sendSignedTransaction(signedTxCredDef.rawTransaction as string);
        console.log('Transaction Hash for registerCredDef:', receiptCredDef.transactionHash);

        let credDefRegisteredEvent;
        let credDefID;
        for (const log of receiptCredDef.logs) {
            if (log.topics![0] === web3.utils.sha3('CredDefRegistered(bytes20,string)')) {
                credDefRegisteredEvent = log;
                break;
            }
        }

        if (credDefRegisteredEvent) {
            console.log('Found credDefRegistered event:', credDefRegisteredEvent);
            credDefID = (credDefRegisteredEvent as any).topics[1].slice(0, 42)
        } else {
            console.log('CredDefRegistered event not found');
        }


        const credDefDetails = await (UtilityContract.methods.getCredDef as any)(credDefID).call(); console.log('CredDef details:', credDefDetails);

    } catch (error) {
        console.error(error);
    }
}

interact();