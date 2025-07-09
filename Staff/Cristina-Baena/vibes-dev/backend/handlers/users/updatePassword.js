import { updatePassword as updatePasswordLogic } from '../../logic/index.js';
import { errors, validator } from '../../../common/index.js';

const updatePassword = async (req, res, next) => {
    try {
        console.log('=== PASSWORD UPDATE REQUEST ===');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user?.id);
        
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        console.log('Extracted data:', { 
            userId, 
            hasCurrentPassword: !!currentPassword, 
            hasNewPassword: !!newPassword,
            currentPasswordLength: currentPassword?.length,
            newPasswordLength: newPassword?.length
        });

        // Validate inputs
        if (!currentPassword) {
            console.log('ERROR: Current password missing');
            throw new errors.ValidationError('Current password is required');
        }
        if (!newPassword) {
            console.log('ERROR: New password missing');
            throw new errors.ValidationError('New password is required');
        }

        console.log('Validating passwords...');
        validator.password(newPassword);
        validator.password(currentPassword);

        console.log('Calling updatePasswordLogic...');
        await updatePasswordLogic(userId, newPassword, currentPassword);
        
        console.log('Password update successful');
        res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (error) {
        console.log('Password update error:', error.message);
        next(error);
    }
};

export default updatePassword;