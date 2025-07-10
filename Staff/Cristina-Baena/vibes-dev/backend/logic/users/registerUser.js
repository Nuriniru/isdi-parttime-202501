import { errors } from 'common'
import { data } from '../../data/index.js'

const registerUser = async (email, password, username) => {
    try {
        const existingUser = await data.users.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            throw new errors.DuplicityError('user already exists')
        }
        
        
        const newUser = new data.users({ username, email, password })
        const savedUser = await newUser.save()
        
        
        const transformedUser = {
            id: savedUser._id.toString(),
            username: savedUser.username,
            email: savedUser.email,
            profilePicture: savedUser.profilePicture,
            avatar: savedUser.avatar,
            bio: savedUser.bio,
            createdAt: savedUser.createdAt
        }
        
        return transformedUser
    } catch (error) {
        if (error instanceof errors.DuplicityError) {
            throw error
        }
       
        if (error.code === 11000) {
            throw new errors.DuplicityError('user already exists')
        }
        
        throw new errors.ServerError(error.message)
    }
}

export default registerUser