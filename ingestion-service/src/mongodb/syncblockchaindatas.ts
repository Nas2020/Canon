
import Web3 from 'web3';
import mongoose from 'mongoose';
import { processInteractionData } from '../blockchain/process-interaction-data';

export async function synBlockchainData(block: any, web3: Web3) {


    block.transactions.forEach(async (transaction: any) => {
        const txDetails = await web3.eth.getTransaction(transaction.hash);
        const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
        if ((txDetails.to === null || txDetails.to === undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {

            const contractData = {
                contractAddress: receipt.contractAddress,
                transactionHash: transaction.hash
            };

            // save contract details to MongoDB
            mongoose.connection.collection('contracts').insertOne(contractData);
            console.log(`Transaction ${transaction.hash} is a contract deployment with contract address: ${receipt.contractAddress}--- `);
        }

        else if ((txDetails.to !== null && txDetails.to !== undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {

            processInteractionData(receipt, web3);

        }
    });

    // const blockData = {
    //     recentBlockNumber: block.number,
    // };

    // // Save event details to MongoDB
    // const blocknumberCollection = mongoose.connection.collection('recentblocknumber');
    // blocknumberCollection.replaceOne({}, blockData, { upsert: true });
    return ("Successfully Synched")
}
