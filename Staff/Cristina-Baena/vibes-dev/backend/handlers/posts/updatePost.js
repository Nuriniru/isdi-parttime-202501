import { asyncHandler } from '../../utils/errorHandler.js'  
import { updatePost as updatePostLogic } from '../../logic/index.js'
import { sanitizeObject, sanitizePost } from '../../utils/sanitize.js'

const updatePost = asyncHandler(async (req, res) => {
    // Sanitize input
    const sanitizedInput = sanitizeObject(req.body)
    
    const result = await updatePostLogic(req.params.id, req.user._id, sanitizedInput)
    
    // Sanitize output
    const sanitizedPost = sanitizePost(result)
    
    res.json({
        success: true,
        data: sanitizedPost
    })
})

export default updatePost