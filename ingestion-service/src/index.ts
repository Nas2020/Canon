import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/mongoose';
import getWeb3Instance from './config/web3';
import { subscribeToNewBlocks } from './blockchain/events';
import { getPeers } from './blockchain/network';
import { fetchDataFromMongoBlock } from './mongodb/mongoblocknumber'
import { synchronisation } from './mongodb/synchronisation';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

        await synchronisation(web3);

        await subscribeToNewBlocks(web3);
        const peerInfo = await getPeers(web3);
        let transformedPeerInfo;
        if (peerInfo)
            transformedPeerInfo = peerInfo.map(extractDesiredFields);
        const networkData = {
            peerInfo: transformedPeerInfo
        };
        // Save event details to MongoDB
        const networkCollection = mongoose.connection.collection('peers');
        networkCollection.replaceOne({}, networkData, { upsert: true });
    } else {
        console.log('Failed to connect to the blockchain');
    }
})();


// app.get('/', (req, res) => {
//     res.send('Hello from the ingestion service!');
// });

app.listen(PORT, () => {
    console.log(`Ingestion Service is running on port ${PORT}`);
});
