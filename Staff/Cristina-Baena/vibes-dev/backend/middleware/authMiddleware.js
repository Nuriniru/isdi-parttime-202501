import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import { asyncHandler } from '../utils/errorHandler.js' 
import { errors } from 'common'

const protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
       
        token = req.headers.authorization.split(' ')[1]

        if (!token) {
            throw new errors.AuthError('Not authorized, no token')
        }

       
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

       
        req.user = await User.findById(decoded.id).select('-password')
        
        if (!req.user) {
            throw new errors.AuthError('Not authorized, user not found')
        }

        next()
    } else {
        throw new errors.AuthError('Not authorized, no token')
    }
})

export { protect }