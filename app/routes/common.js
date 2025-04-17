const { deleteRecords } = require("../lib/mongo.client");
const { MONGO_COLLECTION: { BOOKS } } = require("../lib/Enums");
const { generateMockBooks } = require("../lib/common.helpers");

const router = require("express").Router();

router.post("/fakeData", async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;

        await deleteRecords(mongoclient, BOOKS, {});
        console.log('Existing books deleted');
        await generateMockBooks(mongoclient, 100);
        return res.status(200).send({message: "Data inserted Successfully!!."})
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "INTERNAL ERROR" });
    }
})

module.exports = router;