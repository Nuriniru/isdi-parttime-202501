import { errors } from 'common'
import { data } from '../../data/index.js' 

export default async function getCurrentUser(userId) {
    if (!userId || typeof userId !== 'string') {
        throw new errors.ValidationError('User ID is required and must be a string')
    }

    try {
        const user = await data.users.findById(userId).select('-password')
        
        if (!user) {
            throw new errors.NotFoundError('User not found')
        }

        const transformedUser = {
            ...user.toObject(),
            id: user._id.toString()
        }
        delete transformedUser._id
        
        return transformedUser
    } catch (error) {
        if (error.name === 'CastError') {
            throw new errors.ValidationError('Invalid user ID format')
        }
        throw error
    }
}