import Web3 from 'web3';
import mongoose from 'mongoose';
import { processInteractionData } from './process-interaction-data';

async function fetchDataFromMongoBlock() {
    const collections = await mongoose.connection.db.listCollections({ name: 'recentblocknumber' }).toArray();

    if (collections.length > 0) {
        // If the collection exists, fetch data
        const dataFromMongoBlock = await mongoose.connection.collection('recentblocknumber').find({}).toArray();
        console.log("dataFromDB", dataFromMongoBlock);
        return dataFromMongoBlock;
    } else {
        console.log("'mongoBlockData' collection does not exist.");
        return null
    }
}

export async function subscribeToNewBlocks(web3: Web3, contractAddress: string, abi: any) {


    // Initialize contract object with web3
    //const utilityContract = new web3.eth.Contract(abi, contractAddress);
    // // Event listener for NYMRegistered
    // const nymREvents = await utilityContract.events.NYMRegistered({ fromBlock: 'latest' })
    // nymREvents.on('data', event => {
    //     console.log('NYMRegistered event received:', event);

    //     // Extract event details 
    //     const eventData = {
    //         role: event.returnValues.role,
    //         version: event.returnValues.version,
    //         endpoint: event.returnValues.endpoint
    //     };
    //     console.log('eventData', eventData);
    //     // Save event details to MongoDB
    //     mongoose.connection.collection('NYMRegisteredEvents').insertOne(eventData);
    // })
    // // Event listener for SchemaRegistered
    // const SchemaREvents = await utilityContract.events.SchemaRegistered({ fromBlock: 'latest' })
    // SchemaREvents.on('data', event => {
    //     console.log('SchemaRegistered event received:', event);

    //     // Extract event details 
    //     const eventData = {
    //         schemaID: event.returnValues.schemaID,
    //         name: event.returnValues.name
    //         // ... capture other relevant details as needed
    //     };
    //     console.log('eventData', eventData);
    //     // Save event details to MongoDB
    //     mongoose.connection.collection('SchemaRegisteredEvents').insertOne(eventData);
    // })
    // // Event listener for CredDefRegistered
    // const CredREvents = await utilityContract.events.CredDefRegistered({ fromBlock: 'latest' })
    // CredREvents.on('data', event => {
    //     console.log('CredDefRegistered event received:', event);

    //     // Extract event details 
    //     const eventData = {
    //         credDefID: event.returnValues.credDefID,
    //         tag: event.returnValues.tag
    //     };
    //     console.log('eventData', eventData);
    //     // Save event details to MongoDB
    //     mongoose.connection.collection('CredRegisteredEvents').insertOne(eventData);
    // })

    const response = await fetchDataFromMongoBlock();
    const subscription = await web3.eth.subscribe('newHeads');

    subscription.on('data', async blockhead => {
        const transactionCount = await web3.eth.getBlockTransactionCount();

        const block = await web3.eth.getBlock(blockhead.number, true);



        if (transactionCount > 0) {


            block.transactions.forEach(async (transaction: any) => {

                const txDetails = await web3.eth.getTransaction(transaction.hash);
                const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
                // console.log("receipt", receipt)
                if ((txDetails.to === null || txDetails.to === undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {

                    const contractData = {
                        contractAddress: receipt.contractAddress,
                        transactionHash: transaction.hash
                    };

                    // save contract details to MongoDB
                    mongoose.connection.collection('contracts').insertOne(contractData);

                    console.log(`Transaction ${transaction.hash} is a contract deployment with contract address: ${receipt.contractAddress}--- `);

                }

                else if ((txDetails.to !== null && txDetails.to !== undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {

                    processInteractionData(receipt, web3);
          
                }
            });
            // save block and transaction details to MongoDB
            //mongoose.connection.collection('blocks').insertOne(blockData);

        } else {
            console.log("Block does not contain any transactions.");
        }

        const blockData = {
            recentBlockNumber: block.number,
        };

        // Save event details to MongoDB
        const blocknumberCollection = mongoose.connection.collection('recentblocknumber');
        blocknumberCollection.replaceOne({}, blockData, { upsert: true });


    });

    subscription.on('error', error =>
        console.log('Error when subscribing to new block headers: ', error),
    );

}










// for (const transaction of block.transactions) {
//     if (typeof transaction !== 'string' && transaction.hash) {
//         const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
//         if (receipt && receipt.logs && receipt.logs.length > 0) {
//             for (const log of receipt.logs) {

//                 let event;
//                 if ((utilityContract as any)._decodeEventABI && typeof (utilityContract as any)._decodeEventABI === 'function') {
//                     console.log("checkpoint SchemaRegistered")
//                     event = (utilityContract as any)._decodeEventABI.call({
//                         name: 'SchemaRegistered',
//                         jsonInterface: (utilityContract as any)._jsonInterface
//                     }, log);
//                 }
//                 //const event = (utilityContract as any)._decodeEventABI.call({name: 'SchemaRegistered', jsonInterface: (utilityContract as any)._jsonInterface}, log);


//                 if (event) {
//                     const { schemaID, name } = event.returnValues;
//                     const schemaData = {
//                         schemaID,
//                         name
//                     };
//                     mongoose.connection.collection('schemas').insertOne(schemaData);
//                 }
//                 let credEvent;
//                 if ((utilityContract as any)._decodeEventABI && typeof (utilityContract as any)._decodeEventABI === 'function') {
//                     console.log("checkpoint CredDefRegistered")
//                     credEvent = (utilityContract as any)._decodeEventABI.call({
//                         name: 'CredDefRegistered',
//                         jsonInterface: (utilityContract as any)._jsonInterface
//                     }, log);
//                 }
//                 //const credEvent = (utilityContract as any)._decodeEventABI.call({ name: 'CredDefRegistered', jsonInterface: (utilityContract as any)._jsonInterface }, log);
//                 if (credEvent) {
//                     const { credDefID, tag } = credEvent.returnValues;
//                     const credDefData = {
//                         credDefID,
//                         tag
//                     };
//                     mongoose.connection.collection('credDefs').insertOne(credDefData);
//                 }
//             }
//         }
//     }
// }



// if (txDetails.to?.toLowerCase() === contractAddress.toLowerCase()) {
//     // Decode the transaction's input data
//     const decodedInput = (contract as any).decodeFunctionCall(transaction.input);
//     console.log("decodedInput", decodedInput)

//     switch (decodedInput.name) {
//         case "registerNYM":
//             // save NYM registration details to MongoDB
//             mongoose.connection.collection('registerNYM').insertOne({
//                 from: transaction.from,
//                 details: decodedInput.parameters
//             });
//             break;
//         case "registerSchema":
//             // save Schema registration details to MongoDB
//             mongoose.connection.collection('registerSchema').insertOne({
//                 from: transaction.from,
//                 details: decodedInput.parameters
//             });
//             break;
//         case "registerCredDef":
//             // save CredDef registration details to MongoDB
//             mongoose.connection.collection('registerCredDef').insertOne({
//                 from: transaction.from,
//                 details: decodedInput.parameters
//             });
//             break;
//         default:
//             console.log(`Transaction ${transaction.hash} is an unrecognized function call to the Utility contract`);
//             break;
//     }
// }






// import Web3 from 'web3';
// import mongoose from 'mongoose';
// import { keccak256 } from '@ethersproject/solidity';
// import { id } from '@ethersproject/hash';

// export async function subscribeToNewBlocks(web3: Web3, contractAddress: string, abi: any) {

//     // Compute the 4-byte method IDs for the functions
//     // Compute the 4-byte method IDs for the functions
//     const registerNYMMethodId = id('registerNYM(address,uint8,uint8,string)').slice(0, 10);
//     const registerSchemaMethodId = id('registerSchema(address,address,uint8,string,string[])').slice(0, 10);
//     const registerCredMethodId = id('registerCredDef(address,address,address,uint8,bytes20,string)').slice(0, 10);
//     const SchemaRegisteredEventSignature = "SchemaRegistered(bytes20,string)";
//     const CredDefRegisteredEventSignature = "CredDefRegistered(bytes20,string)";


//     const contract = new web3.eth.Contract(abi, contractAddress);

//     const subscription = await web3.eth.subscribe('newHeads');
//     subscription.on('data', async blockhead => {
//         console.log('New block header: ', blockhead);
//         const transactionCount = await web3.eth.getBlockTransactionCount();
//         console.log("transactionCount", transactionCount)
//         const block = await web3.eth.getBlock(blockhead.number, true);

//         if (transactionCount > 0) {
//             const blockData = {
//                 blockNumber: block.number,
//                 blockHash: block.hash,
//                 transactions: block.transactions.map((tx: any) => ({
//                     txHash: tx.hash
//                     // include other transaction details you need
//                 }))
//             };

//             // Detecting transaction type
//             block.transactions.forEach(async (transaction: any) => {









//                 const txDetails = await web3.eth.getTransaction(transaction.hash);
//                 const receipt = await web3.eth.getTransactionReceipt(transaction.hash);
//                 console.log("receipt", receipt)
//                 if ((txDetails.to === null || txDetails.to === undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {

//                     const contractData = {
//                         contractAddress: receipt.contractAddress,
//                         // include other contract details you need
//                     };

//                     // save contract details to MongoDB
//                     mongoose.connection.collection('contracts').insertOne(contractData);

//                     console.log(`Transaction ${transaction.hash} is a contract deployment with contract address: ${receipt.contractAddress}`);
//                 } else if ((txDetails.to !== null && txDetails.to !== undefined) && (txDetails.input !== null && txDetails.input !== undefined)) {
//                     console.log("txDetails.to?.toLowerCase() ", txDetails.to?.toLowerCase())
//                     console.log("contractAddress.toLowerCase()", contractAddress.toLowerCase())
//                     // txDetails.to?.toLowerCase()  0x3d49d1ef2ade060a33c6e6aa213513a7ee9a6241
//                     // contractAddress.toLowerCase() 0xb529f14aa8096f943177c09ca294ad66d2e08b1f
//                     // If the transaction is related to our contract
//                     // If the transaction is related to our contract

//                     if (transaction.to && transaction.to.toLowerCase() === contractAddress.toLowerCase()) {
//                         console.log("receipt.status ", receipt.status)
//                         if (receipt.status == 1) { // Transaction was successful
//                             if (transaction.input.startsWith(registerNYMMethodId)) {
//                                 console.log(`Transaction ${transaction.hash} successfully invoked registerNYM function.`);
//                             } else if (transaction.input.startsWith(registerSchemaMethodId)) {
//                                 console.log(`Transaction ${transaction.hash} successfully invoked registerSchema function.`);


//                                 for (const log of receipt.logs) {
//                                     if (log.topics && log.topics[0] === web3.utils.sha3(SchemaRegisteredEventSignature)) {
//                                         const eventJsonInterface = contract.abi.find((o: any) => o.name === 'SchemaRegistered' && o.type === 'event');
//                                         if (eventJsonInterface && log.data) {
//                                             const decodedLog = web3.eth.abi.decodeLog(eventJsonInterface.inputs, log.data, log.topics.slice(1));
//                                             const schemaID = decodedLog._schemaID;
//                                             const name = decodedLog._name;

//                                             console.log(`Schema ID: ${schemaID}, Name: ${name}`);
//                                         }
//                                     }
//                                 }




//                             } else if (transaction.input.startsWith(registerCredMethodId)) {
//                                 console.log(`Transaction ${transaction.hash} successfully invoked registerCred function.`);
//                             }
//                         } else {
//                             console.log(`Transaction ${transaction.hash} failed.`);
//                         }
//                     }

//                 }
//             });
//             // save block and transaction details to MongoDB
//             mongoose.connection.collection('blocks').insertOne(blockData);
//         } else {
//             console.log("Block does not contain any transactions.");
//         }
//     });

//     subscription.on('error', error =>
//         console.log('Error when subscribing to new block headers: ', error),
//     );

// }
