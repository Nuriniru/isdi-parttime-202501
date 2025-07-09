import { asyncHandler } from '../../utils/errorHandler.js'  
import { likePost as likePostLogic } from '../../logic/index.js'

const likePost = asyncHandler(async (req, res) => {
    const result = await likePostLogic(req.params.id, req.user._id)
    
    res.json({
        success: true,
        data: result
    })
})

export default likePost