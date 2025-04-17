"use strict";

const { MongoClient } = require("mongodb");
const { createAllCollections } = require("./mongoSchema");
require("../config/env")

// Now you can use the variables
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

console.log(`App running on port ${port}`);


const createMongoConnection = async () => {
    try {
        console.log(`${mongoUrl} - MONGO URL.`);

        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        await createAllCollections(db);

        return db;
    } catch (error) {
        console.error(error);
        // throw new Error(error);
    }
};

module.exports = createMongoConnection;
