import { asyncHandler } from '../../utils/errorHandler.js'  
import { createPost as createPostLogic } from '../../logic/index.js'
import { sanitizeObject, sanitizePost } from '../../utils/sanitize.js'

const createPost = asyncHandler(async (req, res) => {
    // Sanitize input
    const sanitizedInput = sanitizeObject(req.body)
    
    const post = await createPostLogic(req.user.id, sanitizedInput)
    
    // Sanitize output
    const sanitizedPost = sanitizePost(post)
    
    res.status(201).json({
        success: true,
        data: sanitizedPost
    })
})

export default createPost