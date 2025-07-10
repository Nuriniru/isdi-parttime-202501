import api from './apiService.js';

export const createPost = async (postData) => {
    try {
        const response = await api.post('/posts', postData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create post');
    }
};

export const getPosts = async (page = 1, limit = 10, hashtag = null, author = null, sortBy = 'likes') => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        if (hashtag) {
            params.append('hashtag', hashtag);
        }
        
        if (author) {
            params.append('author', author);
        }
        
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        
        const response = await api.get(`/posts?${params}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
};

export const getPostById = async (id) => {
    try {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
};

export const updatePost = async (id, postData) => {
    try {
        const response = await api.put(`/posts/${id}`, postData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update post');
    }
};

export const deletePost = async (id) => {
    try {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
};

export const likePost = async (postId) => {
    const response = await api.post(`/posts/${postId}/like`, {}, {
        headers: { 'X-No-Auto-Redirect': 'true' }
    });

    return response.data.data || response.data;
};

export const addComment = async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comments`, { content }, {
        headers: { 'X-No-Auto-Redirect': 'true' }
    });
    return response.data.data || response.data;
};


export const getMyPosts = async (page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        const response = await api.get(`/auth/profile/posts?${params}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            author: userId
        });
        
        const response = await api.get(`/posts?${params}`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user posts');
    }
};

export const getMyLikedPosts = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/users/profile/liked-posts?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch liked posts');
    }
};

export const getMyCommentedPosts = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/users/profile/commented-posts?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch commented posts');
    }
};
