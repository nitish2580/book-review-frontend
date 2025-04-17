const yup = require('yup');

// Login validation schema
const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
});


const userSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string()
        .email('Invalid email format')
        .required('Email is required')
        .matches(/^.+@.+\..+$/, 'Email must match pattern ^.+@.+\\..+$'),
    passwordHash: yup.string().required('Password hash is required'),
    role: yup.string().oneOf(['user', 'admin'], 'Invalid role').default('user'),
    avatarUrl: yup.string().nullable(),
    bio: yup.string().nullable(),
    createdAt: yup.date().default(() => new Date()),
    updatedAt: yup.date().default(() => new Date())
});


const validateUser = async (userData) => {
    try {
        const validatedData = await userSchema.validate(userData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: null };
    } catch (error) {
        return { isValid: false, data: null, errors: error.errors };
    }
};


module.exports = {
    userSchema,
    validateUser,
};