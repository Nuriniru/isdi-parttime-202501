import { errors } from 'common'
import User from '../../models/userModel.js'

const loginUser = async (email, password) => {
    try {
        
        
        
        const user = await User.findOne({ email })
        
        

        
        if (!user) {
            throw new errors.NotFoundError('user not found')
        }
        
        const isPasswordValid = await user.comparePassword(password)
        
        
        if (!isPasswordValid) {
            throw new errors.AuthError('invalid credentials')
        }
        
        return user._id.toString()
    } catch (error) {
       
        
        if (error instanceof errors.ExistenceError || error instanceof errors.AuthError) {
            throw error
        }
        throw new errors.ServerError(error.message)
    }
}

export default loginUser