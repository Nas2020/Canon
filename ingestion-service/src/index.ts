import express from 'express';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './config/mongoose';
import getWeb3Instance from './config/web3';
import { subscribeToNewBlocks } from './blockchain/events';
import { getPeerCount, getPeers } from './blockchain/network';
import { subscribeToNewPendingTransactions } from './blockchain/transactionEvents';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const contractAddress = process.env.CONTRACTADDRESS || "0x13274fe19c0178208bcbee397af8167a7be27f6f";
//const abi = process.env.ABI || ""

const abiPath = path.join(__dirname, '../../compile-deploy-typescript/', 'UtilityAbi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Connect to MongoDB
connectToDatabase();

// Connect to the blockchain
(async () => {
    const web3 = await getWeb3Instance();
    if (web3) {
        console.log('******************************CONNECTED TO CANON TESTNET******************************');
        subscribeToNewBlocks(web3, contractAddress, abi);
        //subscribeToNewPendingTransactions(web3);  // Call the function here
        const peerCount = await getPeerCount(web3);
        console.log(`Connected to ${peerCount} peers`);
        const peerInfo = await getPeers(web3);
       // console.log(`Peers metadata ${JSON.stringify(peerInfo, null, 2)}`);

        //Getting current nodeinformation
        // const block = await web3.eth.getBlock(); //Latest block
        // console.log("block", block)
        // const clientVersion = await web3.eth.getNodeInfo();
        // console.log('Client version:', clientVersion);
        await web3.eth.getAccounts().then(console.log);
        const status = await web3.currentProvider?.getStatus();
        console.log('status:', status);


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
