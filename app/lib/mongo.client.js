const console = require("console");
const {
    MONGODB_ERROR: {
        FETCH_RECORD,
        FETCH_RECORDS,
        FETCH_RECORD_BY_ID,
        INSERT_RECORDS,
        INSERT_RECORD,
        UPDATE_RECORD,
        UPDATE_RECORDS,
        DELETE_RECORD,
        DELETE_RECORDS,
        COUNT_RECORD,
        FETCH_RECORD_BY_AGGREGATION,
    },
} = require("../error.json");
const { ObjectId } = require("mongodb");

const fetchRecords = async (db, collectionName, fields = {}, condition = {}, sort, limit = 0, skip = 0) => {
    try {
        console.log(
            "fetchRecords() -[collectionName: %s, fields: %s, condition: %s, limit: %s, sort: %s, skip : %s]",
            collectionName,
            JSON.stringify(fields),
            JSON.stringify(condition),
            limit,
            sort,
            skip,
        );

        return await db
            .collection(collectionName)
            .find(condition)
            .project(fields)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();
    } catch (error) {
        console.error(error);
        throw new Error(FETCH_RECORDS);
    }
};

const fetchRecord = async (db, collectionName, projection = {}, condition) => {
    try {


        console.log(
            "fetchRecord() -[collectionName: %s, fields: %s, condition: %s]",
            collectionName,
            JSON.stringify(projection),
            JSON.stringify(condition),
        );

        return await db.collection(collectionName).findOne(condition, { projection });
    } catch (error) {
        console.error(error);
        throw new Error(FETCH_RECORD);
    }
};

const fetchRecordById = async (db, collectionName, fields = {}, id) => {
    try {
        console.log(
            `[fetchRecordById] collection: ${collectionName}, fields: ${JSON.stringify(fields)}, id: ${id}`
        );

        if (!ObjectId.isValid(id)) {
            throw new Error(`Invalid ObjectId: ${id}`);
        }

        const result = await db
            .collection(collectionName)
            .findOne({ _id: new ObjectId(id) }, { projection: fields });

        return result;
    } catch (error) {
        console.error(`[fetchRecordById][Error]: ${error.message}`);
        throw new Error("FETCH_RECORD_BY_ID_FAILED");
    }
};

const insertRecords = async (db, collectionName, docs) => {
    try {
        console.log("insertRecords() - [collectionName: %s, documents: %s]", collectionName, JSON.stringify(docs));
        return await db.collection(collectionName).insertMany(docs);
    } catch (error) {
        console.error(error);
        throw new Error(INSERT_RECORDS);
    }
};

const insertRecord = async (db, collectionName, doc) => {
    try {
        console.log("insertRecord() - [collectionName: %s, document: %s]", collectionName, JSON.stringify(doc));
        return await db.collection(collectionName).insertOne(doc);
    } catch (error) {
        console.error(error);
        throw new Error(INSERT_RECORD);
    }
};

const updateRecords = async (db, collectionName, condition, docs) => {
    try {
        console.log(
            "updateRecords() - [tableName: %s, condition: %s, documents: %s]",
            collectionName,
            JSON.stringify(condition),
            JSON.stringify(docs),
        );
        return await db.collection(collectionName).updateMany(condition, { $set: docs });
    } catch (error) {
        console.error(error);
        throw new Error(UPDATE_RECORDS);
    }
};

const updateRecord = async (db, collectionName, condition, update, doc) => {
    try {
        console.log(
            "updateRecord() - [tableName: %s, condition: %s, document: %s]",
            collectionName,
            JSON.stringify(condition),
            JSON.stringify(update),
            JSON.stringify(doc),
        );
        return await db.collection(collectionName).findOneAndUpdate(condition, update, doc);
    } catch (error) {
        console.error(error);
        throw new Error(UPDATE_RECORD);
    }
};

const deleteRecords = async (db, collectionName, condition) => {
    console.log("🚀 ~ deleteRecords ~ collectionName:", collectionName)
    try {
        console.log("deleteRecord() - [collectionName: %s, condition: %s", collectionName, JSON.stringify(condition));
        return await db.collection(collectionName).deleteMany(condition);
    } catch (error) {
        console.error(error);
        throw new Error(DELETE_RECORDS);
    }
};

const deleteRecord = async (db, collectionName, condition) => {
    try {
        console.log("deleteRecord() - [collectionName: %s, condition: %s", collectionName, JSON.stringify(condition));
        return await db.collection(collectionName).deleteOne(condition);
    } catch (error) {
        console.error(error);
        throw new Error(DELETE_RECORD);
    }
};

const countRecords = async (db, collectionName, condition = {}) => {
    try {
        console.log("countRecord() - [collectionName: %s, condition: %s", collectionName, JSON.stringify(condition));
        return await db.collection(collectionName).count(condition);
    } catch (error) {
        console.error(error);
        throw new Error(COUNT_RECORD);
    }
};

const fetchRecordByAggregation = async (db, collectionName, condition) => {
    try {
        console.log(
            "fetchRecordByAggregation() - [collectionName: %s, condition: %s",
            collectionName,
            JSON.stringify(condition),
        );
        return await db.collection(collectionName).aggregate(condition).toArray();
    } catch (error) {
        console.error(error);
        throw new Error(FETCH_RECORD_BY_AGGREGATION);
    }
};

const createIndexes = async (db, collectionName, indexes) => {
    try {
        console.log("createIndexs() - [collectionName: %s, indexes: %s", collectionName, JSON.stringify(indexes));
        return await db.collection(collectionName).createIndexes(indexes);
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

async function getNextSequence(MongoClient, sequenceName) {
    try {
        const collection = MongoClient.collection("counters");

        const result = await collection.findOneAndUpdate({ _id: sequenceName }, { $inc: { seq: 1 } }, { upsert: true });
        console.log("getNextSequence result %s", JSON.stringify(result));
        if (result.seq === null) {
            return 1;
        } else {
            return result.seq;
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function isCollectionExist(MongoClient, collectionName) {
    try {
        const exists =
            (await MongoClient.listCollections().toArray()).findIndex((item) => item.name === collectionName) !== -1;
        return exists;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function createCollection(MongoClient, collectionName) {
    try {
        console.log("createCollection() , collection name [%s]", collectionName);
        await MongoClient.createCollection(collectionName);
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

const updateRecordsWithRemoveFields = async (db, collectionName, condition, removeFields) => {
    try {
        console.log(
            "updateRecordsWithRemoveFields() - [tableName: %s, condition: %s, documents: %s]",
            collectionName,
            JSON.stringify(condition),
            JSON.stringify(removeFields),
        );

        const unsetFields = removeFields.reduce((acc, field) => {
            acc[field] = ""; // Set each field to "" to remove it
            return acc;
        }, {});

        return await db.collection(collectionName).updateMany(condition, { $unset: unsetFields });
    } catch (error) {
        console.error(error);
        throw new Error(UPDATE_RECORDS);
    }
};

const updateRecordById = async (db, collectionName, updateFields = {}, id) => {
    try {
        console.log(
            `[updateRecordById] collection: ${collectionName}, updateFields: ${JSON.stringify(updateFields)}, id: ${id}`
        );

        if (!ObjectId.isValid(id)) {
            throw new Error(`Invalid ObjectId: ${id}`);
        }

        const result = await db
            .collection(collectionName)
            .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

        return result;
    } catch (error) {
        console.error(`[updateRecordById][Error]: ${error.message}`);
        throw new Error("UPDATE_RECORD_BY_ID_FAILED");
    }
};

module.exports = {
    fetchRecords,
    fetchRecord,
    fetchRecordById,
    insertRecords,
    insertRecord,
    updateRecords,
    updateRecord,
    deleteRecords,
    deleteRecord,
    countRecords,
    fetchRecordByAggregation,
    createIndexes,
    getNextSequence,
    isCollectionExist,
    createCollection,
    updateRecordsWithRemoveFields,
    updateRecordById,
};
