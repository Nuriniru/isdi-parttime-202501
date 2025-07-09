import { asyncHandler } from '../../utils/errorHandler.js'  
import User from '../../models/userModel.js'
import { errors } from 'common'

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id)
    
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
    res.json({
        success: true,
        message: 'User account deleted successfully'
    })
})

export default deleteUser