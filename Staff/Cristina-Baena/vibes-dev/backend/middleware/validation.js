import { asyncHandler } from '../utils/errorHandler.js' 
import { validator, errors } from 'common'

export const validateEmail = asyncHandler((req, res, next) => {
    const { email } = req.body
    if (email) {
        validator.email(email) 
    }
    next()
})

export const validatePassword = asyncHandler((req, res, next) => {
    const { password } = req.body
    if (password) {
        const validationErrors = validator.passwordSecurity(password)
        if (validationErrors.length > 0) {
            throw new errors.ValidationError('Password must be at least 8 characters with uppercase, lowercase, number and special character')
        }
    }
    next()
})

export const validatePostContent = asyncHandler((req, res, next) => {
    const { title, content } = req.body
    
    if (!title || title.trim().length === 0) {
        throw new errors.ValidationError('Title is required')
    }
    
    if (!content || content.trim().length === 0) {
        throw new errors.ValidationError('Content is required')
    }
    
    if (title.length > 100) {
        throw new errors.ValidationError('Title cannot exceed 100 characters')
    }
    
    if (content.length > 2000) {
        throw new errors.ValidationError('Content cannot exceed 2000 characters')
    }
    
    next()
})

export const validateObjectId = asyncHandler((req, res, next) => {
    const { id } = req.params
    if (id) {
        validator.id(id) 
    }
    next()
})