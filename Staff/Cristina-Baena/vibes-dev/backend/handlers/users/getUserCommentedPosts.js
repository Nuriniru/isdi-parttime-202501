import { asyncHandler } from '../../utils/errorHandler.js'  
import { getUserCommentedPosts as getUserCommentedPostsLogic } from '../../logic/index.js'

const getUserCommentedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id ? req.user._id.toString() : req.user.id
    const posts = await getUserCommentedPostsLogic(userId)
    
    res.json({
        success: true,
        data: posts
    })
})

export default getUserCommentedPosts