require("../config/env");
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');
const { fetchRecord, insertRecord } = require('../lib/mongo.client');
const { MONGO_COLLECTION: { USERS } } = require("../lib/Enums");
const { validateUser } = require('../validators/authValidator');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;
        // const { name, email, password, role } = req.body;
        const userData = {
            ...req.body,
            passwordHash: req.body.password, // Map password to passwordHash
            password: undefined // Remove plain password
        };

        const { isValid, data, errors } = await validateUser(userData);
        if (!isValid) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const userExists = await fetchRecord(mongoclient, USERS, {}, { email: data?.email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const saltRound = process.env.SALT_ROUNDS;
        const salt = await bcrypt.genSalt(saltRound);
        data.passwordHash = await bcrypt.hash(data.passwordHash, salt);

        // Check if user exists

        // Create user
        const user = await insertRecord(mongoclient, USERS, data)

        if (user) {
            generateToken(res, user._id);
            return res.status(201).json({
                message: "User is created successfully!.",
                _id: user._id,
            });
            
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const {
            mongoclient,
        } = req;
        const { email, password } = req.body;

        const user = await fetchRecord(mongoclient, USERS, {}, { email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            _id: user._id,
            role: user.role,
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};