import Post from '../../models/postModel.js'
import User from '../../models/userModel.js'
import Hashtag from '../../models/hashtagModel.js'
import { errors, validator } from 'common'

const createPost = async (userId, postData) => {
    const { title, content, image, hashtags } = postData
    
    validator.text(title, 'title')
    validator.text(content, 'content')
    
    if (!content && !image) {
        throw new errors.ValidationError('Post must have either content or image')
    }
    
    
    const user = await User.findById(userId).select('-password')
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
 
    let allHashtags = hashtags || []
    if (content) {
        const tempPost = new Post({ title, content, author: userId })
        const contentHashtags = tempPost.extractHashtags(content)
        allHashtags = [...new Set([...allHashtags, ...contentHashtags])]
    }
    

    const post = await Post.create({
        title,
        content,
        image,
        author: userId,
        hashtags: allHashtags
    })
    
    
    const populatedPost = await Post.findById(post._id).populate('author', 'username avatar')
    

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
    
    
    const transformedPost = {
        ...populatedPost.toObject(),
        id: populatedPost._id.toString(),
        author: {
            id: populatedPost.author._id.toString(),
            username: populatedPost.author.username,
            avatar: populatedPost.author.avatar
        }
    }
    delete transformedPost._id
    
    return transformedPost
}

export default createPost