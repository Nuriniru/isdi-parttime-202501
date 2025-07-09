import { asyncHandler } from '../../utils/errorHandler.js'  
import User from '../../models/userModel.js'
import { sanitizeObject, sanitizeUser } from '../../utils/sanitize.js'
import jwt from 'jsonwebtoken'
import { errors } from 'common'

// Generate JWT helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { username, email, bio, avatar } = req.body;

        // Remove all password-related logic from here
        // Only handle profile fields
        
        const user = await User.findById(userId);
        if (!user) {
            throw new errors.ExistenceError('User not found');
        }

        // Update only profile fields
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        // Generate new token with updated user data
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const sanitizedUser = {
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar,
            createdAt: user.createdAt
        };

        res.status(200).json({
            success: true,
            data: {
                user: sanitizedUser,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export default updateUserProfile;