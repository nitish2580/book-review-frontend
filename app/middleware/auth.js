"use strict";
const jwt = require('jsonwebtoken');
const { fetchRecordById } = require('../lib/mongo.client');
const { MONGO_COLLECTION: { USERS } } = require("../lib/Enums")

const protect = async (req, res, next) => {
    try {
        console.log("[AUTH] checking  token - [path: %s, token: %s]", req.path, req.headers.authorization);
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                message: 'Not authorized, no token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const db = getDb();
        const user = await fetchRecordById(req.mongoclient, USERS, {}, decoded.id)

        if (!user) {
            return res.status(401).json({
                message: 'Not authorized, user not found'
            });
        }

        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        next();
    } catch (error) {
        consle.error(error);
        return res.status(500).send({ "Something Went Wrong" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            message: 'Not authorized as admin'
        });
    }
};
