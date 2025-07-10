
import { asyncHandler } from '../../utils/errorHandler.js' 
import { loginUser as loginUserLogic } from '../../logic/index.js'
import { validator, errors } from 'common'
import jwt from 'jsonwebtoken'
import { sanitizeUser } from '../../utils/sanitize.js'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

const loginUser = asyncHandler(async (req, res) => {
    
    const { email, password } = req.body
    validator.email(email)
    validator.password(password)
    
    const userId = await loginUserLogic(email, password)
    

    const { default: User } = await import('../../models/userModel.js')
    const user = await User.findById(userId)
    
    if (!user) {
        throw new errors.NotFoundError('User not found')
    }
    
    // Sanitize user data
    const sanitizedUser = sanitizeUser(user.toObject())
    
    res.json({
        success: true,
        data: {
            ...sanitizedUser,
            token: generateToken(user._id)
        }
    })
})

export { loginUser }