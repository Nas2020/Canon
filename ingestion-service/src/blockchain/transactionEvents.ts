// blockchain/transactionEvents.ts
import Web3 from 'web3';

export async function subscribeToNewPendingTransactions(web3: Web3) {
    const subscription = await web3.eth.subscribe('pendingTransactions', async function (error: any, result: any) {
        if (!error) {
            console.log("result", result);
        }
    });

    subscription.on('data', async (transactionHash: string) => {
        try {
            const transaction = await web3.eth.getTransaction(transactionHash);
            console.log('New pending transaction:', transaction);
            const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
            console.log('transactionR:', transactionReceipt);
        } catch (error) {
            console.error(`Error getting transaction details: ${error}`);
        }
    });

    subscription.on('error', error => console.error(`Error subscribing to pending transactions: ${error}`));
}
