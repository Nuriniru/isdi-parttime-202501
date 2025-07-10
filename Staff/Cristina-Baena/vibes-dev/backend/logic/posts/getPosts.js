import Post from '../../models/postModel.js'
import mongoose from 'mongoose'

const getPosts = async (filters = {}) => {
    const { page = 1, limit = 10, hashtag, author, sortBy = 'recent' } = filters
    
    
    
    const matchStage = {}
    

    if (hashtag) {
        matchStage.hashtags = { $in: [hashtag.toLowerCase()] }
    }
    

    if (author) {
        matchStage.author = new mongoose.Types.ObjectId(author)
    }
    
  
    
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
    
  

    const totalPostsInDB = await Post.countDocuments({})
    
    
    const posts = await Post.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
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
    

    const transformedPosts = posts.map(post => {

        if (!post._id) {
            console.warn('Post without _id found:', post);
            return null;
        }
        
        post.id = post._id.toString();
        delete post._id;
        
        
        if (post.author && post.author._id) {
            post.author.id = post.author._id.toString()
            delete post.author._id
        }
        
    
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
    }).filter(Boolean); 
    
    return {
        posts: transformedPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: parseInt(page),
        totalPosts
    }
}

export default getPosts