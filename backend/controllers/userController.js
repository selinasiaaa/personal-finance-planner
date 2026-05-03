const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            occupation: user.occupation,
            dob: user.dob,
            address: user.address,
            city: user.city,
            country: user.country
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.occupation = req.body.occupation || user.occupation;
        user.dob = req.body.dob || user.dob;
        user.address = req.body.address || user.address;
        user.city = req.body.city || user.city;
        user.country = req.body.country || user.country;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.deleteUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);

        if(user){
            await User.findByIdAndDelete(req.user._id);
            res.json({message: 'User account deleted successfully'});
        } else{
            res.status(404).json({message: 'User not found'});
        }
    } catch(error){
        res.status(500).json({message: error.message});
    }
};