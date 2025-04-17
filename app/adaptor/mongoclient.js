"use strict";

const { MongoClient } = require("mongodb");
const { createAllCollections } = require("./mongoSchema");
require("../config/env")

// Now you can use the variables
const port = process.env.PORT;
const dbUrl = process.env.DB_URL;
const secret = process.env.SECRET_KEY;
const mongoUrl = process.env.MONGO_URL;

console.log(`App running on port ${port}`);


const createMongoConnection = async () => {
    try {
        console.log(`${mongoUrl} - MONGO URL.`);

        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db("book_reviews");
        await createAllCollections(db);

        return db;
    } catch (error) {
        console.error(error);
        // throw new Error(error);
    }
};

module.exports = createMongoConnection;
