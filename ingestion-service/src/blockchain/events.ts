import Web3 from 'web3';

export async function subscribeToNewBlocks(web3: Web3) {

    const subscription = await web3.eth.subscribe('newHeads');

        subscription.on('data', async blockhead => {
        console.log('New block header: ', blockhead);
        const transactionCount = await web3.eth.getBlockTransactionCount();
        console.log("transactionCount",transactionCount)
        const block = await web3.eth.getBlock(blockhead.number,true);
        if (transactionCount> 0) {
            console.log("Block", block)
            console.log("Block contains transactions: ", block.transactions);
             // Detecting transaction type
             block.transactions.forEach(async (transaction: any) => {
                const txDetails = await web3.eth.getTransaction(transaction.hash);
                const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
                console.log("receipt", receipt)
                if((txDetails.to === null || txDetails.to === undefined) && (txDetails.input !== null && txDetails.input !== undefined)){
                   
                    console.log(`Transaction ${transaction.hash} is a contract deployment with contract address: ${receipt.contractAddress}`);
                } else if ((txDetails.to !== null && txDetails.to !== undefined) && (txDetails.input !== null && txDetails.input !== undefined)){
                    
                    console.log(`Transaction ${transaction.hash} is a contract interaction`);
                } else if ((txDetails.to !== null && txDetails.to !== undefined) && (txDetails.input === null || txDetails.input === undefined || txDetails.input === '0x')){
                  
                    console.log(`Transaction ${transaction.hash} is an Ether transfer`);
                }
            });
        } else {
            console.log("Block does not contain any transactions.");
        }
    });

    subscription.on('error', error =>
        console.log('Error when subscribing to new block headers: ', error),
    );

}














// import Web3 from 'web3';

// export async function subscribeToNewBlocks(web3: Web3) {

//     const subscription = await web3.eth.subscribe('newHeads', async function (error: any, result: any) {
//         if (!error) {
//             console.log("result",result);
           
//         }
//     });

//     subscription.on('data', async blockhead => {
//         // const block = await web3.eth.getBlock();  // get the full block data, including transactions
//         // console.log("transactions",block);
//         const transactionCount = await web3.eth.getBlockTransactionCount();
//         console.log("transactionCount",transactionCount);
//         console.log('New block header: ', blockhead);

//     });
//     subscription.on('error', error =>
//         console.log('Error when subscribing to New block header: ', error),
//     );

// }

