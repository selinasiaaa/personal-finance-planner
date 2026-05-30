const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        // Check if all fields are provided
        if(!name || !email || !password){
            return res.status(400).json({message: 'Please provide all fields'});
        }

        // Check if the user account exists
        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message: 'User already exists'});
        }

        const user = await User.create({name, email, password});

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email, 
            token: generateToken(user._id)
        });
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user){
            return res.status(401).json({message: 'Invalid email'});
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({message: 'Invalid password'})
        }

        // Return user data and JWT
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.forgotPassword = async (req, res) => {
    try{
        const user = await User.findOne({email: req.body.email});
        if (!user){
            return res.status(404).json({message: 'There is no user with that email'});
        }
        
        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        res.status(200).json({
            message: 'Token generated',
            tokenForTesting: resetToken // just testing
        });
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.resetPassword = async (req, res) => {
    try{
        const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({message: 'Invalid or expired token'});
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({message: 'Password reset successful'});
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};