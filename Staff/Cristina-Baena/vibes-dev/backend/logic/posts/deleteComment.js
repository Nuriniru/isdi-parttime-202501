import Post from '../../models/postModel.js'
import { errors } from 'common'

const deleteComment = async (postId, commentId, userId) => {
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    const comment = post.comments.id(commentId)
    
    if (!comment) {
        throw new errors.NotFoundError('Comment not found')
    }
    
    const commentOwnerId = comment.user.toString()
    const postAuthorId = post.author.toString()
    const currentUserId = userId.toString()
    
    if (commentOwnerId !== currentUserId && postAuthorId !== currentUserId) {
        throw new errors.UnauthorizedError('Not authorized to delete this comment')
    }
    
    post.comments.pull(commentId)
    await post.save()
    
    return { message: 'Comment removed' }
}

export default deleteComment