import { data } from '../../data/index.js'
import { errors, validator } from 'common'

const getUserProfile = async (userId) => {
    validator.id(userId)
    
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
}

export default getUserProfile