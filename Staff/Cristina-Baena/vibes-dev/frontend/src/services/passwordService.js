import api from './apiService';

export const updatePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.patch('/users/password', {
            currentPassword,
            newPassword
        });
        
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update password');
    }
};