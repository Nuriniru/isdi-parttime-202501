import { asyncHandler } from '../../utils/errorHandler.js' 
import { getUserProfile as getUserProfileLogic } from '../../logic/index.js'
import { sanitizeUser } from '../../utils/sanitize.js'

const getUserProfile = asyncHandler(async (req, res) => {
    // Use req.user.id or req.user._id.toString() to ensure it's a string
    const userId = req.user._id ? req.user._id.toString() : req.user.id
    const user = await getUserProfileLogic(userId)
    
    // Sanitize output
    const sanitizedUser = sanitizeUser(user)
    
    res.json({
        success: true,
        data: sanitizedUser
    })
})

export default getUserProfile