import express from 'express';
import { connectToDatabase } from './config/mongoose';
import getWeb3Instance from './config/web3';
import { subscribeToNewBlocks } from './blockchain/events';
import { peerInfo } from './blockchain/network';
import { synchronisation } from './mongodb/synchronisation';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectToDatabase();


// Connect to the blockchain
(async () => {
    const web3 = await getWeb3Instance();
    if (web3) {

        await peerInfo(web3);

        await synchronisation(web3);

        await subscribeToNewBlocks(web3);
      
    } else {
        console.log('Failed to connect to the blockchain');
    }
})();


app.listen(PORT, () => {
    console.log(`Ingestion Service is running on port ${PORT}`);
});
