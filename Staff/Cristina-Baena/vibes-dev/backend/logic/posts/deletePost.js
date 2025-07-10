import Post from '../../models/postModel.js'
import Hashtag from '../../models/hashtagModel.js'
import { errors } from 'common'

const deletePost = async (postId, userId) => {
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    

    if (post.author.toString() !== userId.toString()) {
        throw new errors.UnauthorizedError('Not authorized to delete this post')
    }
    

    const hashtags = [...post.hashtags]
    
    await Post.findByIdAndDelete(postId)
    

    await decreaseHashtagCounts(hashtags)
    
    return { message: 'Post removed' }
}


const decreaseHashtagCounts = async (hashtags) => {
    for (const tag of hashtags) {
        const hashtag = await Hashtag.findOne({ name: tag.toLowerCase() })
        if (hashtag) {
            if (hashtag.count <= 1) {
                await Hashtag.findByIdAndDelete(hashtag._id)
            } else {
                hashtag.count -= 1
                await hashtag.save()
            }
        }
    }
}

export default deletePost