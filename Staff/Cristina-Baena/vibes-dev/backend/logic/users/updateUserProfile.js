import { data } from "../../data/index.js"
import { errors, validator } from 'common'
import bcrypt from "bcryptjs"

const updateUserProfile = async (userId, updates) => {
    validator.id(userId)
    
    if (!updates || Object.keys(updates).length === 0) {
        throw new errors.ValidationError('No updates provided')
    }
    
    const user = await data.users.findById(userId)
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
    const allowedUpdates = ['username', 'email', 'password', 'bio', 'avatar']
    const updateKeys = Object.keys(updates)
    const isValidOperation = updateKeys.every(update => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        throw new errors.ValidationError('Invalid updates')
    }
    
    // Validate email if provided
    if (updates.email) {
        validator.email(updates.email)
        
        // Check if email already exists
        const existingUser = await data.users.findOne({ 
            email: updates.email, 
            _id: { $ne: userId } 
        })
        if (existingUser) {
            throw new errors.DuplicityError('Email already exists')
        }
    }
    
    // Validate username if provided
    if (updates.username) {
        validator.username(updates.username)
        
        // Check if username already exists
        const existingUser = await data.users.findOne({ 
            username: updates.username, 
            _id: { $ne: userId } 
        })
        if (existingUser) {
            throw new errors.DuplicityError('Username already exists')
        }
    }
    
    // Validate and hash password if provided
    if (updates.password) {
        validator.password(updates.password)
        updates.password = await bcrypt.hash(updates.password, 10)
    }
    
    // Validate avatar if provided
    if (updates.avatar) {
        const allowedSources = ['pexels', 'upload', 'default']
        
        // Check if source is provided and valid
        if (!updates.avatar.source || !allowedSources.includes(updates.avatar.source)) {
            throw new errors.ValidationError('Invalid or missing avatar source. Must be one of: pexels, upload, default')
        }
        
        // Validate based on avatar source
        switch (updates.avatar.source) {
            case 'default':
                if (!updates.avatar.url || typeof updates.avatar.url !== 'string') {
                    throw new errors.ValidationError('Default avatar must have a valid URL')
                }
                break;
                
            case 'pexels':
                if (!updates.avatar.url || typeof updates.avatar.url !== 'string') {
                    throw new errors.ValidationError('Pexels avatar must have a valid URL')
                }
                if (!updates.avatar.pexelsId || typeof updates.avatar.pexelsId !== 'string') {
                    throw new errors.ValidationError('Pexels avatar must have a valid Pexels ID')
                }
                // Ensure pexelsId is preserved in the update
                break;
                
            case 'upload':
                if (!updates.avatar.data || typeof updates.avatar.data !== 'string') {
                    throw new errors.ValidationError('Uploaded avatar must have valid Base64 data')
                }
                
                // Validate Base64 format
                const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/
                if (!base64Regex.test(updates.avatar.data)) {
                    throw new errors.ValidationError('Invalid Base64 image format. Must be jpeg, jpg, png, gif, or webp')
                }
                
                
                const base64Data = updates.avatar.data.split(',')[1]
                const sizeInBytes = (base64Data.length * 3) / 4
                const maxSizeInMB = 5 // 5MB limit
                const maxSizeInBytes = maxSizeInMB * 1024 * 1024
                
                if (sizeInBytes > maxSizeInBytes) {
                    throw new errors.ValidationError(`Image size too large. Maximum size is ${maxSizeInMB}MB`)
                }
                
                
                updates.avatar.url = updates.avatar.data
                break;
                
            default:
                throw new errors.ValidationError('Unknown avatar source')
        }
    }
    
    const updatedUser = await data.users.findByIdAndUpdate(
        userId, 
        updates, 
        { new: true, runValidators: true }
    ).select('-password')
    
    
    const transformedUser = {
        ...updatedUser.toObject(),
        id: updatedUser._id.toString()
    }
    delete transformedUser._id
    
    return transformedUser
}

export default updateUserProfile
