import Web3 from 'web3';
import mongoose from 'mongoose';
import { processInteractionData } from './process-interaction-data';

export async function subscribeToNewBlocks(web3: Web3) {

    const subscription = await web3.eth.subscribe('newHeads');
    subscription.on('data', async blockhead => {
        const transactionCount = await web3.eth.getBlockTransactionCount();
        const block = await web3.eth.getBlock(blockhead.number, true);

        if (transactionCount > 0) {


            block.transactions.forEach(async (transaction: any) => {

                const txDetails = await web3.eth.getTransaction(transaction.hash);
                const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
                // console.log("receipt", receipt)
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
         

        } else {
            console.log("Block does not contain any transactions.");
        }

        const blockData = {
            recentBlockNumber: block.number,
        };

        // Save event details to MongoDB
        const blocknumberCollection = mongoose.connection.collection('recentblocknumber');
        blocknumberCollection.replaceOne({}, blockData, { upsert: true });


    });

    subscription.on('error', error =>
        console.log('Error when subscribing to new block headers: ', error),
    );

}
