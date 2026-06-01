const jwt = require('jsonwebtoken'); //This loads the jsonwebtoken library. Its job is to sign and verify JWT tokens.
const User = require('../models/User'); // This loads the User mongoose model. We need it to look up the actual user from MongoDB using the ID stored inside the token.

const protect = async (req, res, next) => { //If protect calls next() → the request continues to the route handler
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
        // Get token from header (Format: "Bearer <token>")
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        //Checks the token hasn't been tampered with
        //Checks the token hasn't expired

        // Add user info to the request (so the controller knows who is who)
        req.user = await User.findById(decoded.id).select('-password');

      next(); // ← "I'm done, go to the route handler now"
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };