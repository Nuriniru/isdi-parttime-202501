import getPostsLogic from '../posts/getPosts.js'
import { errors, validator } from 'common'

const getUserPosts = async (userId, filters = {}) => {
    validator.id(userId)
    
    const postFilters = {
        author: userId,
        page: filters.page || 1,
        limit: filters.limit || 10
    }
    
    const result = await getPostsLogic(postFilters)
    
    return {
        posts: result.posts,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        total: result.totalPosts
    }
}

export default getUserPosts