import { errors } from 'common';
import User from '../../models/userModel.js';

const updatePassword = async (userId, newPassword, currentPassword) => {
    try {
                
        const user = await User.findById(userId);
        if (!user) {
            console.log('ERROR: User not found for ID:', userId);
            throw new errors.ExistenceError('User not found');
        }
        
       
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
        
        if (!isCurrentPasswordValid) {
            console.log('ERROR: Current password incorrect');
            throw new errors.AuthError('Current password is incorrect');
        }

      
        user.password = newPassword;
        await user.save();
       

        return { success: true };
    } catch (error) {
        console.log('Password logic error:', error.message);
        throw error;
    }
};

export default updatePassword;