const yup = require('yup');

const reviewSchema = yup.object().shape({
    bookId: yup.string().required('Product ID is required'),
    userId: yup.string().required('User ID is required'),
    title: yup.string().required("Title is required"),
    rating: yup.number()
        .required('Rating is required')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5'),
    content: yup.string().max(500, 'Content cannot exceed 500 characters'),
});

const validateReview = async (reviewData) => {
    try {
        const validatedData = await reviewSchema.validate(reviewData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: null };
    } catch (error) {
        return { isValid: false, data: null, errors: error.errors };
    }
};

module.exports = { validateReview };