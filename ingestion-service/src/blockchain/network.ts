// network.ts
import Web3 from 'web3';


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

// export async function getPeerCount(web3: Web3) {
//     try {
//         // @ts-ignore
//         const response = await web3.currentProvider.request({ method: 'net_peerCount', params: [], id: Date.now() });
//         //console.log("response", response)
//         if (response && typeof response.result === 'string') {
//             return parseInt(response.result, 16);  // response is in hex, convert it to decimal
//         } else {
//             throw new Error('Unexpected response from provider');
//         }
//     } catch (error) {
//         console.error('Error getting peer count:', error);
//     }
// }