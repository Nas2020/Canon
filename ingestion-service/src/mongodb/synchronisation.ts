import Web3 from 'web3';
import mongoose from 'mongoose';
import { synBlockchainData } from '../mongodb/syncblockchaindatas'
import { fetchDataFromMongoBlock } from './mongoblocknumber';

export const synchronisation = async (web3: Web3) => {
    // check the contents in mogodb
    let dataFromMongo = await fetchDataFromMongoBlock();
    // Get latest block number from blockchain
    let latestBlockNumber = await web3.eth.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);
    let startBlockNumber = 0; // Default to genesis block
    (dataFromMongo && dataFromMongo.length > 0) ? startBlockNumber = dataFromMongo[0].recentBlockNumber + 1 : null
    console.log("startBlockNumber", startBlockNumber)
    while (startBlockNumber < latestBlockNumber) {
        for (let i = startBlockNumber; i < latestBlockNumber; i++) {
            const block = await web3.eth.getBlock(i, true);
            const transactionCount = await web3.eth.getBlockTransactionCount(i);
            console.log("#########################################################################################################################transactionCount", transactionCount);
            if (block && transactionCount > 0) {
               // console.log("HURRAH!!!, we can process the block now");
                const result = await synBlockchainData(block, web3);
               // console.log("Result from sync function", result);
            }
            const blockData = {
                recentBlockNumber: block.number,
            };
            // Save event details to MongoDB
            const blocknumberCollection = mongoose.connection.collection('recentblocknumber');
            blocknumberCollection.replaceOne({}, blockData, { upsert: true });
        }

        // Fetch data and block numbers again after synchronization
        const dataFromMongo = await fetchDataFromMongoBlock();
        latestBlockNumber = await web3.eth.getBlockNumber();
        (dataFromMongo && dataFromMongo.length > 0) ? startBlockNumber = dataFromMongo[0].recentBlockNumber + 1 : startBlockNumber = 0;
        console.log("Latest Block Number:", latestBlockNumber);
        console.log("startBlockNumber", startBlockNumber)
    }
    console.log("UPDATE: MongoDB is up-to-date with the blockchain.");
}







// export const synchronisation = async (startBlockNumber: any, latestBlockNumber: any, web3: Web3) => {
//     if (startBlockNumber < latestBlockNumber) {
//         for (let i = startBlockNumber; i < latestBlockNumber; i++) {
//             const block = await web3.eth.getBlock(i, true);
//             //console.log("Check Point", block)
//             const transactionCount = await web3.eth.getBlockTransactionCount(i);
//             console.log("#########################################################################################################################transactionCount", transactionCount);
//             if (block && transactionCount > 0) {
//                 console.log("HURRAH!!!, we can process the block now")
//                 const result = await synBlockchainData(block, web3)
//                 console.log("Result from sync function", result)
//             }
//             const blockData = {
//                 recentBlockNumber: block.number,
//             };
//             // Save event details to MongoDB
//             const blocknumberCollection = mongoose.connection.collection('recentblocknumber');
//             blocknumberCollection.replaceOne({}, blockData, { upsert: true });
//         }
//         console.log("UPDATE: MongoDB is up-to-date with the blockchain.");
//     } else {
//         console.log("MongoDB is already up-to-date with the blockchain.");
//     }
// }