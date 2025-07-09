import { asyncHandler } from '../../utils/errorHandler.js'  
import { getPost as getPostLogic } from '../../logic/index.js'
import { sanitizePost } from '../../utils/sanitize.js'

const getPost = asyncHandler(async (req, res) => {
    const post = await getPostLogic(req.params.id)
    
    // Sanitize output
    const sanitizedPost = sanitizePost(post)
    
    res.json({
        success: true,
        data: sanitizedPost
    })
})

export default getPost