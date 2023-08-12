import express from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/mongoose';
import getWeb3Instance from './config/web3';
import { subscribeToNewBlocks } from './blockchain/events';
import { getPeers } from './blockchain/network';
import { subscribeToNewPendingTransactions } from './blockchain/transactionEvents';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const contractAddress = process.env.CONTRACTADDRESS || "";

//const contractdAddressPath = path.join(__dirname, '../../compile-deploy-typescript', 'UtilityContractAddress.bin');
// console.log("contractdAddressPath", contractdAddressPath)
// const contractAddress = fs.readFileSync(contractdAddressPath, 'utf8') || process.env.CONTRACTADDRESS as string;

const abiPath = path.join(__dirname, '../../compile-deploy-typescript/', 'UtilityAbi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Connect to MongoDB
connectToDatabase();


function extractDesiredFields(peer: any) {
    const { version, name, network, port, id, protocols, enode } = peer;
    return { version, name, network, port, id, protocols, enode };
}


// Connect to the blockchain
(async () => {
    const web3 = await getWeb3Instance();
    if (web3) {

        subscribeToNewBlocks(web3, contractAddress, abi);
        //subscribeToNewPendingTransactions(web3); 

        // const peerCount = await getPeerCount(web3);
        // console.log(`Connected to ${peerCount} peers`);
        const peerInfo = await getPeers(web3);

        // Transform the peerInfo data
        let transformedPeerInfo;
        if (peerInfo)
            transformedPeerInfo = peerInfo.map(extractDesiredFields);
        const networkData = {
            peerInfo: transformedPeerInfo
        };
        //console.log('networkData', networkData);

        // Save event details to MongoDB
        const networkCollection = mongoose.connection.collection('peers');
        networkCollection.replaceOne({}, networkData, { upsert: true });

        //mongoose.connection.collection('network').insertOne(networkData);
        // console.log(`Peers metadata ${JSON.stringify(peerInfo, null, 2)}`);
        // await web3.eth.getAccounts().then(console.log);
        // const status = await web3.currentProvider?.getStatus();
        // console.log('status:', status);


    } else {
        console.log('Failed to connect to the blockchain');
    }
})();



app.get('/', (req, res) => {
    res.send('Hello from the ingestion service!');
});

app.listen(PORT, () => {
    console.log(`Ingestion Service is running on port ${PORT}`);
});
