import Post from '../../models/postModel.js'
import { errors } from 'common'

const addComment = async (postId, userId, content) => {
    if (!content) {
        throw new errors.ValidationError('Comment content is required')
    }
    
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    const comment = {
        user: userId,
        content,
        createdAt: new Date()
    }
    
    post.comments.push(comment)
    await post.save()
    
    await post.populate('comments.user', 'username avatar')
    
    const newComment = post.comments[post.comments.length - 1]
    

    const transformedComment = {
        ...newComment.toObject(),
        id: newComment._id.toString()
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
}

export default addComment