import { asyncHandler } from '../../utils/errorHandler.js'  
import { registerUserLogic } from '../../logic/index.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

const registerUser = asyncHandler(async (req, res) => {
    
    const { username, email, password } = req.body
    
    
    
   
    const result = await registerUserLogic(email, password, username)
    
    res.status(201).json({
        success: true,
        data: {
            ...result,
            token: generateToken(result.id)
        }
    })
})

export default registerUser