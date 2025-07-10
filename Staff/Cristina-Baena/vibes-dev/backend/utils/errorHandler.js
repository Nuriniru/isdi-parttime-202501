import logger from './logger.js'
import { errors } from 'common'


export const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            logger.error('Async handler error:', {
                error: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            })
            next(error)
        }
    }
}


export const logicHandler = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args)
        } catch (error) {
            logger.error('Logic function error:', {
                function: fn.name,
                error: error.message,
                stack: error.stack,
                args: args.length
            })
            
            
            if (error instanceof errors.ValidationError ||
                error instanceof errors.NotFoundError ||
                error instanceof errors.AuthError ||
                error instanceof errors.ExistenceError ||
                error instanceof errors.FormatError) {
                throw error
            }
            
            
            throw new errors.ServerError(`Internal server error: ${error.message}`)
        }
    }
}


export const errorMiddleware = (err, req, res, next) => {
    logger.error('Request error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
    })

    // Handle specific error types
    if (err instanceof errors.ValidationError) {
        return res.status(400).json({ 
            success: false,
            error: 'Validation Error',
            message: err.message 
        })
    }
    
    if (err instanceof errors.NotFoundError) {
        return res.status(404).json({ 
            success: false,
            error: 'Not Found',
            message: err.message 
        })
    }
    
    if (err instanceof errors.AuthError) {
        return res.status(401).json({ 
            success: false,
            error: 'Authentication Error',
            message: err.message 
        })
    }
    
    if (err instanceof errors.ExistenceError) {
        return res.status(409).json({ 
            success: false,
            error: 'Conflict',
            message: err.message 
        })
    }
    
    if (err instanceof errors.FormatError) {
        return res.status(400).json({ 
            success: false,
            error: 'Format Error',
            message: err.message 
        })
    }
    
    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        return res.status(500).json({ 
            success: false,
            error: 'Database Error',
            message: 'A database error occurred' 
        })
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false,
            error: 'Token Error',
            message: 'Invalid token' 
        })
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            success: false,
            error: 'Token Expired',
            message: 'Token has expired' 
        })
    }
    
    // Default error response
    res.status(500).json({ 
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : err.message 
    })
}