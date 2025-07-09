import { errors } from 'common';
import User from '../../models/userModel.js';

const updatePassword = async (userId, newPassword, currentPassword) => {
    try {
        console.log('=== PASSWORD LOGIC ===');
        console.log('Parameters:', { userId, hasNewPassword: !!newPassword, hasCurrentPassword: !!currentPassword });
        
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.log('ERROR: User not found for ID:', userId);
            throw new errors.ExistenceError('User not found');
        }
        
        console.log('User found:', user.username);
        console.log('Current password hash:', user.password.substring(0, 20) + '...');

        // Verify current password using the correct method name
        console.log('Verifying current password...');
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        console.log('Current password valid:', isCurrentPasswordValid);
        
        if (!isCurrentPasswordValid) {
            console.log('ERROR: Current password incorrect');
            throw new errors.AuthError('Current password is incorrect');
        }

        // Update password directly (the User model should handle hashing)
        console.log('Updating password...');
        console.log('New password (plain):', newPassword);
        user.password = newPassword;
        await user.save();
        console.log('Password updated successfully');
        console.log('New password hash:', user.password.substring(0, 20) + '...');

        return { success: true };
    } catch (error) {
        console.log('Password logic error:', error.message);
        throw error;
    }
};

export default updatePassword;