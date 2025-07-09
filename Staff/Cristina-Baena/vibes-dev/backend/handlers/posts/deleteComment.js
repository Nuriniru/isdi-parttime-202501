import { asyncHandler } from '../../utils/errorHandler.js'  
import { deleteComment as deleteCommentLogic } from '../../logic/index.js'

const deleteComment = asyncHandler(async (req, res) => {
    
    const result = await deleteCommentLogic(req.params.id, req.params.commentId, req.user._id)
    
    res.json({
        success: true,
        data: result
    })
})

export default deleteComment