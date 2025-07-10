import Post from '../../models/postModel.js'
import { errors } from 'common'

const likePost = async (postId, userId) => {
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    const isLiked = post.likes.includes(userId)
    
    if (isLiked) {

        post.likes = post.likes.filter(id => id.toString() !== userId.toString())
    } else {

        post.likes.push(userId)
    }
    
    await post.save()
    
    
    const transformedPost = {
        ...post.toObject(),
        id: post._id.toString()
    }
    delete transformedPost._id
    
    
    return {
        isLiked: !isLiked, 
        likesCount: post.likes.length,
        post: transformedPost 
    }
}

export default likePost