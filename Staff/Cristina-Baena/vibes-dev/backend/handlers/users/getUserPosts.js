import { asyncHandler } from '../../utils/errorHandler.js'  
import { getUserPosts as getUserPostsLogic } from '../../logic/index.js'

const getUserPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id ? req.user._id.toString() : req.user.id
    const posts = await getUserPostsLogic(userId)
    
    res.json({
        success: true,
        data: posts
    })
})

export default getUserPosts