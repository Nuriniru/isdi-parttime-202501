import { asyncHandler } from '../../utils/errorHandler.js'  
import { getUserLikedPosts as getUserLikedPostsLogic } from '../../logic/index.js'

const getUserLikedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id ? req.user._id.toString() : req.user.id
    const posts = await getUserLikedPostsLogic(userId)
    
    res.json({
        success: true,
        data: posts
    })
})

export default getUserLikedPosts