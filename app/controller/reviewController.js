const { insertRecord, updateRecord, updateRecordById, fetchRecordById, fetchRecords } = require('../lib/mongo.client');
const { validateReview } = require('../validators/reviewValidator');
const { ObjectId } = require('mongodb');
const { MONGO_COLLECTION: { REVIEWS, BOOKS } } = require("../lib/Enums")

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;
        // Validate input
        const { isValid, data, errors } = await validateReview(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const reviewData = {
            ...data,
            bookId: new ObjectId(data.productId),
            userId: new ObjectId(data.userId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert review
        const result = await insertRecord(mongoclient, REVIEWS, reviewData);

        // Update product's average rating
        await updateProductRating(mongoclient, data.productId);

        return res.status(201).json({
            _id: result.insertedId,
            ...reviewData
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await db.collection('reviews')
            .find({ productId: new ObjectId(productId) })
            .sort({ createdAt: -1 })
            .toArray();

        return res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (only review owner or admin)
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { isValid, data, errors } = await validateReview(req.body);

        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const review = await db.collection('reviews').findOne({
            _id: new ObjectId(id),
            userId: new ObjectId(req.user._id) // Ensure user owns the review
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const updateData = {
            ...data,
            updatedAt: new Date()
        };

        await db.collection('reviews').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        // Update product's average rating
        await updateProductRating(review.productId.toString());

        return res.json({
            _id: id,
            ...updateData
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (only review owner or admin)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        // Find review first to get productId for rating update
        const review = await db.collection('reviews').findOne({
            _id: new ObjectId(id),
            $or: [
                { userId: new ObjectId(req.user._id) }, // Owner
                { role: 'admin' } // Or admin
            ]
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await db.collection('reviews').deleteOne({ _id: new ObjectId(id) });

        // Update product's average rating
        await updateProductRating(review.productId.toString());

        return res.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to update product's average rating
const updateProductRating = async (mongoclient, bookId) => {
    try{
        const reviews = await fetchRecords(mongoclient, REVIEWS, {}, { bookId: new ObjectId(bookId) });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            await updateRecordById(mongoclient, BOOKS, { averageRating: parseFloat(averageRating.toFixed(1)) }, bookId)
        }
    } catch(err){
        throw new Error(err);
    }
};

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
};