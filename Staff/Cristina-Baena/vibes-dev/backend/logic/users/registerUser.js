import { errors } from 'common'
import { data } from '../../data/index.js'

const registerUser = async (email, password, username) => {
    try {
        // Check for existing user
        const existingUser = await data.users.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            throw new errors.DuplicityError('user already exists')
        }
        
        // Create new user (Mongoose will handle password hashing via pre-save hook)
        const newUser = new data.users({ username, email, password })
        const savedUser = await newUser.save()
        
        // Transform for frontend compatibility
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
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            throw new errors.DuplicityError('user already exists')
        }
        // Convert other errors to ServerError
        throw new errors.ServerError(error.message)
    }
}

export default registerUser