import Post from '../../models/postModel.js'
import { errors } from 'common'

const likePost = async (postId, userId) => {
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    const isLiked = post.likes.includes(userId)
    
    if (isLiked) {
        // Unlike the post
        post.likes = post.likes.filter(id => id.toString() !== userId.toString())
    } else {
        // Like the post
        post.likes.push(userId)
    }
    
    await post.save()
    
    // Transform post _id to id for frontend compatibility
    const transformedPost = {
        ...post.toObject(),
        id: post._id.toString()
    }
    delete transformedPost._id
    
    // Return the expected structure for tests
    return {
        isLiked: !isLiked, // Toggle the state
        likesCount: post.likes.length,
        post: transformedPost // Include the transformed post
    }
}

export default likePost