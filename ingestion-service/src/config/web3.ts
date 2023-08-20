import Web3 from 'web3';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

export default async function getWeb3Instance(): Promise<Web3 | null> {
    const bootNode = process.env.BOOTNODE_WS_URL;
    const node2 = process.env.NODE2_WS_URL;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000;  // starting delay in ms

    if (!bootNode || !node2) {
        console.error('Please define the BOOTNODE_WS_URL and NODE2_WS_URL environment variables inside .env');
        return null;
    }

    const webSocketConnect = async (url: string, retries: number = 0): Promise<Web3> => {
        if (retries > MAX_RETRIES) {
            throw new Error(`Max retries reached for ${url}`);
        }

        const provider = new WebSocket(url);

        return new Promise((resolve, reject) => {
            provider.on('error', (err) => {
                console.error(`WebSocket error for ${url}: ${err.message}. Retrying in ${RETRY_DELAY * (retries + 1)} ms...`);
                setTimeout(() => {
                    webSocketConnect(url, retries + 1)
                        .then(resolve)
                        .catch(reject);
                }, RETRY_DELAY * (retries + 1)); 
            });

            provider.on('open', () => resolve(new Web3(provider.url)));
        });
    };

    try {
        const web3: Web3 = await webSocketConnect(node2);
        const networkId = await web3.eth.net.getId();
        console.log(`Connected to node2:- ${node2} --network ID: ${networkId}`);
        return web3;
    } catch (error) {
        console.error(`Failed to connect to node2 at ${node2}. Trying bootNode instead.`);
        try {
            const web3: Web3 = await webSocketConnect(bootNode);
            const networkId = await web3.eth.net.getId();
            console.log(`Connected to bootNode:- ${bootNode} --network ID: ${networkId}`);
            return web3;
        } catch (error) {
            console.error(`Failed to connect to bootNode at ${bootNode}. Please check your .env configuration and your nodes.`);
            return null;
        }
    }
}
