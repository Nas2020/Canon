
import Web3 from 'web3';
import mongoose from 'mongoose';

export async function processInteractionData(receipt: any, web3: Web3) {

    console.log("check transaction receipt to gather informations", receipt)


    if (receipt) {

        const blockNumber = receipt.blockNumber.toString();
        const contractAddress = receipt.to;
        const transactionHash = receipt.transactionHash;
        let status;
        if (receipt.status == 1) {
            status = "success"
        } else {
            status = "failed"
        }
        let eventName;
        let data;

        // Looping through all logs in the receipt
        for (let log of receipt.logs) {
            const topics = log.topics;
            console.log("topics:-", topics)

            if (topics[0] === web3.utils.sha3("NYMRegistered(address,uint8,uint8,string)")) {
                let registeredAddress;
                let role;
                let version;
                let endpoint;
                if (topics[1]) {
                    registeredAddress = "0x" + topics[1].slice(26);
                    console.log("Registered Address:", registeredAddress);
                }

                if (log.data) {
                    const logData = log.data;

                    // Decode uint8 role and uint8 version (remember that each uint8 is just 1 byte, but it's padded to 32 bytes in Ethereum logs)
                    role = parseInt(logData.slice(2, 66), 16);
                    version = parseInt(logData.slice(66, 130), 16);

                    // Decode the dynamic string 'endpoint'
                    const offset = parseInt(logData.slice(130, 194), 16) * 2;
                    const length = parseInt(logData.slice(offset, offset + 64), 16) * 2;
                    const rawStringData = logData.slice(offset + 64, offset + 64 + length);
                    endpoint = web3.utils.hexToUtf8('0x' + rawStringData);
                    endpoint = endpoint.replace(/\u0000/g, '');
                    endpoint = endpoint.replace(/\u000f/g, '');

                    console.log("Role:", role);
                    console.log("Version:", version);
                    console.log("Endpoint:", endpoint);
                }
                eventName = "NYMRegistered";
                data = {
                    account: registeredAddress,
                    role,
                    version,
                    endpoint
                }
                console.log("It's a NYMRegistered event");
            } else if (topics[0] === web3.utils.sha3("SchemaRegistered(bytes20,string)")) {
                let schemaID;
                let name;

                if (topics[1]) {
                    schemaID = topics[1].slice(0, 42);
                    console.log("schemaID", schemaID);
                }

                if (log.data) {

                    const logData = log.data;
                    //console.log("data(receipt.logs.data)", data)

                    const offset = parseInt((<string>logData).slice(0, 66), 16) * 2;
                    // Read the length of the string (usually 32 bytes)
                    const length = parseInt((<string>logData).slice(offset, offset + 64), 16) * 2;
                    // Extract the string data
                    const rawStringData = (<string>logData).slice(offset + 64, offset + 64 + length);
                    // Convert the hex data to a string
                    name = web3.utils.hexToUtf8('0x' + rawStringData);
                    name = name.replace(/\u0000/g, '');
                    name = name.replace(/\u000f/g, '');





                    console.log("name", name);
                }
                eventName = "SchemaRegistered";
                data = {
                    schemaID, name
                }
                console.log("It's a SchemaRegistered event");
            } else if (topics[0] === web3.utils.sha3("CredDefRegistered(bytes20,string)")) {
                let credDefID;
                let tag;
                if (topics[1]) {
                    credDefID = topics[1].slice(0, 42);
                    console.log("credDefID", credDefID);
                }

                if (log.data) {

                    const logData = log.data;
                    //console.log("data(receipt.logs.data)", data)

                    const offset = parseInt((<string>logData).slice(0, 66), 16) * 2;
                    // Read the length of the string (usually 32 bytes)
                    const length = parseInt((<string>logData).slice(offset, offset + 64), 16) * 2;
                    // Extract the string data
                    const rawStringData = (<string>logData).slice(offset + 64, offset + 64 + length);
                    // Convert the hex data to a string
                    tag = web3.utils.hexToUtf8('0x' + rawStringData);
                    tag = tag.replace(/\u0000/g, ''); // remove null characters
                    tag = tag.replace(/\u000C/g, ''); // remove form feed characters
                    console.log("tag", tag);
                }
                eventName = "CredDefRegistered";
                data = {
                    credDefID, tag
                }
                console.log("It's a CredDefRegistered event");
            } else {
                console.log("Unknown event")
            }

        }

        const interactions = {
            status,
            transactionHash,
            contractAddress,
            event: {
                eventName,
                data
            }
        }

        mongoose.connection.collection('interactions').insertOne(interactions);


    } else {
        console.log("No data has been recieved")
    }

}
