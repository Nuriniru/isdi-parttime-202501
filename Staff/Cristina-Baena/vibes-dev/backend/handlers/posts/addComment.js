import { asyncHandler } from '../../utils/errorHandler.js'
import { addComment as addCommentLogic } from '../../logic/index.js'
import { sanitizeObject } from '../../utils/sanitize.js'

const addComment = asyncHandler(async (req, res) => {

    
    // Sanitize input
    const sanitizedInput = sanitizeObject(req.body)

    
    const result = await addCommentLogic(req.params.id, req.user._id, sanitizedInput.content)
    
    res.status(201).json({
        success: true,
        data: result
    })
})

export default addComment