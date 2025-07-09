import { asyncHandler } from '../../utils/errorHandler.js'  
import { getPosts as getPostsLogic } from '../../logic/index.js'

const getPosts = asyncHandler(async (req, res) => {
    const filters = {
        page: req.query.page,
        limit: req.query.limit,
        hashtag: req.query.hashtag,
        author: req.query.author,
        sortBy: req.query.sortBy
    }
    
    const result = await getPostsLogic(filters)
   
    
    res.json({
        success: true,
        data: {
            posts: result.posts,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            total: result.totalPosts
        }
    })
})

export default getPosts