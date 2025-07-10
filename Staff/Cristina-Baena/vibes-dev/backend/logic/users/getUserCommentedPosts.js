import Post from '../../models/postModel.js'
import { errors, validator } from 'common'
import mongoose from 'mongoose'

const getUserCommentedPosts = async (userId, filters = {}) => {
    validator.id(userId)
    
    const { page = 1, limit = 10 } = filters
    const skip = (page - 1) * limit
    

    const userObjectId = new mongoose.Types.ObjectId(userId)
    

    const posts = await Post.aggregate([
        {
            $match: {
                'comments.user': userObjectId
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },

                userComments: {
                    $filter: {
                        input: '$comments',
                        cond: { $eq: ['$$this.user', userObjectId] }
                    }
                }
            }
        },
        { $sort: { 'userComments.createdAt': -1 } }, 
        { $skip: skip },
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
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$author'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'comments.user',
                foreignField: '_id',
                as: 'commentUsers'
            }
        },
        {
            $addFields: {
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
        },
        
        {
            $set: {
                id: { $toString: '$_id' },
                author: {
                    $mergeObjects: [
                        '$author',
                        { id: { $toString: '$author._id' } }
                    ]
                },
                comments: {
                    $map: {
                        input: '$comments',
                        as: 'comment',
                        in: {
                            $mergeObjects: [
                                '$$comment',
                                {
                                    id: { $toString: '$$comment._id' },
                                    user: {
                                        $mergeObjects: [
                                            '$$comment.user',
                                            { id: { $toString: '$$comment.user._id' } }
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
                _id: 0,
                'author._id': 0,
                'comments._id': 0,
                'comments.user._id': 0
            }
        }
    ])
    
    
    const totalCount = await Post.countDocuments({
        'comments.user': userObjectId
    })
    
    const totalPages = Math.ceil(totalCount / limit)
    
    return {
        posts,
        totalPages,
        currentPage: parseInt(page),
        totalPosts: totalCount
    }
}

export default getUserCommentedPosts