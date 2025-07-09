import Post from '../../models/postModel.js'
import { errors } from 'common'

const getPost = async (postId) => {
    const post = await Post.findById(postId)
        .populate('author', 'username avatar')
        .populate('comments.user', 'username avatar')
        
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    // Transform _id to id for frontend compatibility
    const transformedPost = {
        ...post.toObject(),
        id: post._id.toString()
    }
    delete transformedPost._id
    
    // Transform author _id to id if populated
    if (transformedPost.author && transformedPost.author._id) {
        transformedPost.author = {
            ...transformedPost.author,
            id: transformedPost.author._id.toString()
        }
        delete transformedPost.author._id
    }
    
    // Transform comments _id and user _id to id
    if (transformedPost.comments && transformedPost.comments.length > 0) {
        transformedPost.comments = transformedPost.comments.map(comment => {
            const transformedComment = {
                ...comment,
                id: comment._id.toString()
            }
            delete transformedComment._id
            
            if (transformedComment.user && transformedComment.user._id) {
                transformedComment.user = {
                    ...transformedComment.user,
                    id: transformedComment.user._id.toString()
                }
                delete transformedComment.user._id
            }
            
            return transformedComment
        })
    }
    
    return transformedPost
}

export default getPost