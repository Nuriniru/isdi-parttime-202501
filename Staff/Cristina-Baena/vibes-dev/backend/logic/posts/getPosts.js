import Post from '../../models/postModel.js'
import mongoose from 'mongoose'

const getPosts = async (filters = {}) => {
    const { page = 1, limit = 10, hashtag, author, sortBy = 'recent' } = filters
    
    
    
    const matchStage = {}
    
    // Filter by hashtag if provided
    if (hashtag) {
        matchStage.hashtags = { $in: [hashtag.toLowerCase()] }
    }
    
    // Filter by author if provided
    if (author) {
        matchStage.author = new mongoose.Types.ObjectId(author)
    }
    
  
    
    // Determine sort criteria based on sortBy parameter
    let sortCriteria
    switch (sortBy) {
        case 'recent':
        case 'newest':
            sortCriteria = { createdAt: -1 }
            break
        case 'likes':
        case 'popular':
        default:
            sortCriteria = { likesCount: -1 }
            break
    }
    
  
    // First, let's check if there are any posts at all
    const totalPostsInDB = await Post.countDocuments({})
    
    
    const posts = await Post.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                // Ensure createdAt is available for sorting
                sortDate: "$createdAt"
            }
        },
        { $sort: sortCriteria },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'comments.user',
                foreignField: '_id',
                as: 'commentUsers',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                author: { $arrayElemAt: ['$author', 0] },
                comments: {
                    $map: {
                        input: '$comments',
                        as: 'comment',
                        in: {
                            $mergeObjects: [
                                '$$comment',
                                {
                                    user: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$commentUsers',
                                                    cond: { $eq: ['$$this._id', '$$comment.user'] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                commentUsers: 0
            }
        }
    ])
    

 
    
    const totalPosts = await Post.countDocuments(matchStage)
    
    // Transform _id fields to id fields for frontend compatibility
    // After the transformation around line 120
    const transformedPosts = posts.map(post => {
        // Transform main post _id to id
        if (!post._id) {
            console.warn('Post without _id found:', post);
            return null;
        }
        
        post.id = post._id.toString();
        delete post._id;
        
        // Transform author _id to id
        if (post.author && post.author._id) {
            post.author.id = post.author._id.toString()
            delete post.author._id
        }
        
        // Transform comments _id and user _id to id
        if (post.comments && post.comments.length > 0) {
            post.comments = post.comments.map(comment => {
                if (comment._id) {
                    comment.id = comment._id.toString()
                    delete comment._id
                }
                
                if (comment.user && comment.user._id) {
                    comment.user.id = comment.user._id.toString()
                    delete comment.user._id
                }
                
                return comment
            })
        }
        
        return post;
    }).filter(Boolean); // Remove null posts
    
    return {
        posts: transformedPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: parseInt(page),
        totalPosts
    }
}

export default getPosts