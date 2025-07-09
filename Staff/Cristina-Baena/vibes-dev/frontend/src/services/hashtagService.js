import api from './apiService.js';

export const searchHashtags = async (query) => {
    try {
        const response = await api.get('/hashtags/search', {
            params: { q: query }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search hashtags');
    }
};

export const getPopularHashtags = async (limit = 10) => {
    try {
        const response = await api.get('/hashtags/popular', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch popular hashtags');
    }
};

export const getTrendingHashtags = async (limit = 10) => {
    try {
        const response = await api.get('/hashtags/trending', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch trending hashtags');
    }
};