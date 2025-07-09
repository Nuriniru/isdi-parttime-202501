import api from './apiService.js';

export const searchImages = async (query, page = 1, perPage = 15) => {
    try {
        const response = await api.get('/images/search', {
            params: { query, page, per_page: perPage }
        });
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to search images');
    }
};

export const getCuratedImages = async (page = 1, perPage = 15) => {
    try {
        const response = await api.get('/images/curated', {
            params: { page, per_page: perPage }
        });
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to get curated images');
    }
};

export const getImageById = async (id) => {
    try {
        const response = await api.get(`/images/${id}`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get image');
    }
};