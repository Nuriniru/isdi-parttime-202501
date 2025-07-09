import { asyncHandler } from '../../utils/errorHandler.js'  
import { deletePost as deletePostLogic } from '../../logic/index.js'

const deletePost = asyncHandler(async (req, res) => {
    const result = await deletePostLogic(req.params.id, req.user._id)
    
    res.json({
        success: true,
        data: result
    })
})

export default deletePost