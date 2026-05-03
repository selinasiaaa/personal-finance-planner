const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
router.put('/reset-password/:resetToken', resetPassword);

router.post('/change-password', protect, changePassword);

module.exports = router;