const { fetchRecords, countRecords, fetchRecordById } = require("../lib/mongo.client");
const { MONGO_COLLECTION: { BOOKS } } = require("../lib/Enums");
const { ObjectId } = require("mongodb");

const fetchAllBooks = async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;
        const { page = 1, limit = 12, search, author, genre, rating, sort } = req.query;

        // Build the query object for filtering
        const query = {};

        // Add search functionality (case-insensitive)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Add filters
        if (author) query.author = author;
        if (genre) {
            // Split comma-separated genres into array
            const genresArray = genre.split(',');

            // If genres is an array field in your documents
            query.genres = { $in: genresArray };

            // OR if you want books that contain ALL specified genres
            // query.genres = { $all: genresArray };
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }

        // Build sort object
        const sortOptions = {};
        if (sort) {
            const sortFields = sort.split(',');
            sortFields.forEach(field => {
                const [key, order] = field.split(':');
                sortOptions[key] = order === 'desc' ? -1 : 1;
            });
        } else {
            sortOptions.createdAt = -1; // Default sort by newest first
        }

        // Execute query with pagination
        const books = await fetchRecords(mongoclient, BOOKS, {}, query, sortOptions, limit, (page - 1) * limit);

        const total = await countRecords(mongoclient, BOOKS, query);

        // Get total count for pagination metadata
        // const total = await Book.countDocuments(query);

        // Prepare response
        const response = {
            data: books,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "INTERNAL SERVER ERROR" });
    }
}

const fetchBook = async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;
        console.log("🚀 ~ fetchBook ~ req.params.id:", req.params.id)
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book ID format'
            });
        }
        // Find the book by ID
        const book = await fetchRecordById(mongoclient, BOOKS, {}, req.params.id);

        // Check if book exists
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Return the book data
        res.status(200).json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "INTERNAL SERVER ERROR" });
    }
}

module.exports = {
    fetchAllBooks,
    fetchBook,
}