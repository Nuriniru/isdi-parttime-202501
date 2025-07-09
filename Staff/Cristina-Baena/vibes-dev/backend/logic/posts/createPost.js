import Post from '../../models/postModel.js'
import User from '../../models/userModel.js'
import Hashtag from '../../models/hashtagModel.js'
import { errors, validator } from 'common'

const createPost = async (userId, postData) => {
    const { title, content, image, hashtags } = postData
    
    // Validate inputs
    validator.text(title, 'title')
    validator.text(content, 'content')
    
    if (!content && !image) {
        throw new errors.ValidationError('Post must have either content or image')
    }
    
    // Validate user exists
    const user = await User.findById(userId).select('-password')
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
    // Extract hashtags from content and combine with provided hashtags
    let allHashtags = hashtags || []
    if (content) {
        const tempPost = new Post({ title, content, author: userId })
        const contentHashtags = tempPost.extractHashtags(content)
        // Combine provided hashtags with extracted hashtags, removing duplicates
        allHashtags = [...new Set([...allHashtags, ...contentHashtags])]
        console.log('Combined hashtags:', allHashtags)
    }
    
    // Create the post
    const post = await Post.create({
        title,
        content,
        image,
        author: userId,
        hashtags: allHashtags
    })
    
    // Populate author info before transformation
    const populatedPost = await Post.findById(post._id).populate('author', 'username avatar')
    
    // Handle hashtags - update hashtag counts
    if (allHashtags && allHashtags.length > 0) {
        for (const tag of allHashtags) {
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
    
    // Transform _id to id for frontend compatibility
    const transformedPost = {
        ...populatedPost.toObject(),
        id: populatedPost._id.toString(),
        author: populatedPost.author._id.toString()  // Just return the ID string, not the full object
    }
    delete transformedPost._id
    
    return transformedPost
}

export default createPost