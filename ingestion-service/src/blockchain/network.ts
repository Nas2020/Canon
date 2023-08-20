// network.ts
import Web3 from 'web3';
import mongoose from 'mongoose';

export async function getPeers(web3: Web3) {
    try {
        // @ts-ignore
        const response = await web3.currentProvider.request({ method: 'admin_peers', params: [], id: Date.now() });
        if (response && Array.isArray(response.result)) {
            return response.result;
        } else {
            throw new Error('Unexpected response from provider');
        }
    } catch (error) {
        console.error('Error getting peers:', error);
    }
}

function extractDesiredFields(peer: any) {
    const { version, name, network, port, id, protocols, enode } = peer;
    return { version, name, network, port, id, protocols, enode };
}


export const peerInfo = async (web3: Web3)=>{

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

} 
