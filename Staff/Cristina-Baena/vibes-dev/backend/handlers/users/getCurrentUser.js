import { asyncHandler } from '../../utils/errorHandler.js'  
import User from '../../models/userModel.js'
import { errors } from 'common'

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
    res.json({
        success: true,
        data: user
    })
})

export default getCurrentUser