import mongoose from 'mongoose';


export async function fetchDataFromMongoBlock() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    //console.log("mongodb-collections", collections)
    if (collections.length > 0) {
        // If the collection exists, fetch data
        const dataFromMongoBlock = await mongoose.connection.collection('recentblocknumber').find({}).toArray();
        //console.log("dataFromDB", dataFromMongoBlock);
        return dataFromMongoBlock;
    } else {
        console.log("recentblocknumber collection does not exist.");
        return null
    }
}