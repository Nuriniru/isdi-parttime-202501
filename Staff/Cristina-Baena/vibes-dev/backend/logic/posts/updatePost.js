import Post from '../../models/postModel.js'
import Hashtag from '../../models/hashtagModel.js'
import { errors, validator } from 'common'

const updatePost = async (postId, userId, updateData) => {
    const { title, content, image, hashtags } = updateData
    
    // Validate inputs if provided
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
            throw new errors.ValidationError('Title must be a non-empty string')
        }
    }
    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim().length === 0) {
            throw new errors.ValidationError('Content must be a non-empty string')
        }
    }
    
    const post = await Post.findById(postId)
    
    if (!post) {
        throw new errors.NotFoundError('Post not found')
    }
    
    // Check if user owns the post
    if (post.author.toString() !== userId.toString()) {
        throw new errors.UnauthorizedError('Not authorized to update this post')
    }
    
    // Store old hashtags for count updates
    const oldHashtags = [...post.hashtags]
    
    // Determine new hashtags
    let newHashtags
    if (hashtags !== undefined) {
        // If hashtags are explicitly provided, use them
        newHashtags = hashtags
    } else if (content && content !== post.content) {
        // If content changed but no hashtags provided, extract from content
        newHashtags = post.extractHashtags(content)
    } else {
        // Keep existing hashtags
        newHashtags = post.hashtags
    }
    
    // Update post fields
    post.title = title || post.title
    post.content = content || post.content
    post.image = image || post.image
    post.hashtags = newHashtags
    
    const updatedPost = await post.save()
    
    // Update hashtag counts
    await updateHashtagCountsAfterEdit(oldHashtags, newHashtags)
    
    await updatedPost.populate('author', 'username avatar')
    
    // Transform _id to id for frontend compatibility
    const transformedPost = {
        ...updatedPost.toObject(),
        id: updatedPost._id.toString()
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
    
    return transformedPost
}

// Helper function to update hashtag counts after edit
const updateHashtagCountsAfterEdit = async (oldHashtags, newHashtags) => {
    // Decrease counts for removed hashtags
    const removedTags = oldHashtags.filter(tag => !newHashtags.includes(tag))
    await decreaseHashtagCounts(removedTags)
    
    // Increase counts for new hashtags
    const addedTags = newHashtags.filter(tag => !oldHashtags.includes(tag))
    await updateHashtagCounts(addedTags)
}

// Helper function to update hashtag counts
const updateHashtagCounts = async (hashtags) => {
    for (const tag of hashtags) {
        await Hashtag.findOneAndUpdate(
            { name: tag.toLowerCase() },
            { 
                $inc: { count: 1 },
                $set: { lastUsed: new Date() }
            },
            { upsert: true, new: true }
        )
    }
}

// Helper function to decrease hashtag counts
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

export default updatePost