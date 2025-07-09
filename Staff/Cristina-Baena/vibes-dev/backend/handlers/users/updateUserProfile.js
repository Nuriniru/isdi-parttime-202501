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

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }

    // Sanitize input
    const sanitizedInput = sanitizeObject(req.body)
    
    // Update user fields
    if (sanitizedInput.username) user.username = sanitizedInput.username
    if (sanitizedInput.email) user.email = sanitizedInput.email
    if (sanitizedInput.bio) user.bio = sanitizedInput.bio
    if (sanitizedInput.profilePicture) user.profilePicture = sanitizedInput.profilePicture
    
    // Add avatar field handling
    if (sanitizedInput.avatar) {
        user.avatar = sanitizedInput.avatar
    }
    
    const updatedUser = await user.save()
    
    // Sanitize output
    const sanitizedUser = sanitizeUser(updatedUser.toObject())
    
    res.json({
        success: true,
        data: {
            ...sanitizedUser,
            token: generateToken(updatedUser._id)
        }
    })
})

export default updateUserProfile