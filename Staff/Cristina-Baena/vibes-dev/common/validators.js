import * as errors from './errors.js'

const validator = {
    email: (email) => {
        if (typeof email !== 'string') {
            throw new TypeError('Email is not a string')
        }
        if (email.length === 0) {
            throw new RangeError('Email is empty')
        }
        // Fixed email regex - more permissive and standard
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(email) === false) {
            throw new errors.FormatError('Invalid email format')
        }
    },
    
    passwordSecurity: (password) => {
        const securityErrors = []
        const numbers = "0123456789"
        let hasANumber = false
        for (let i = 0; i < numbers.length; i++) {
            if (password.includes(numbers[i])) {
                hasANumber = true
                i = numbers.length
            }
        }
        if (!hasANumber) securityErrors.push('needs a number')

        if (password.toLowerCase() === password) securityErrors.push('needs an upper case letter')

        if (password.toUpperCase() === password) securityErrors.push('needs a lower case letter')

        if (password.length < 8) securityErrors.push('needs at least 8 characters')

        const specialChars = '$&!@=*^ñ?¿¡/#ªº¬'
        let hasSpecial = false

        for (let i = 0; i < specialChars.length; i++) {
            if (password.includes(specialChars[i])) {
                hasSpecial = true
                i = specialChars.length
            }
        }

        if (!hasSpecial) securityErrors.push('needs a special character ($&!@=*^ñ?¿¡/#ªº¬)')

        return securityErrors
    },
    
    password: (password) => {
        if (typeof password !== 'string') {
            throw new TypeError('Password is not a string')
        }
        if (password.length === 0) {
            throw new RangeError('Password is empty')
        }
        const formatErrors = validator.passwordSecurity(password)
        if (formatErrors.length > 0) {
            throw new errors.FormatError('Password format not valid: ' + formatErrors.join(', '))
        }
    },
    
    username: (username) => {
        if (typeof username !== 'string') {
            throw new TypeError('Username is not a string')
        }
        if (username.length === 0 || username.length > 20) {
            throw new RangeError('Username number of characters is not valid')
        }
    },
    
    id: (id) => {
        if (typeof id !== 'string') {
            throw new errors.ValidationError('ID must be a string')
        }
        if (id.length === 0) {
            throw new errors.ValidationError('ID cannot be empty')
        }
        // Check if it's a valid MongoDB ObjectId format (24 hex characters)
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new errors.ValidationError('Invalid ID format')
        }
    },
    
    text: (text, maxLength, minLength, explain) => {
        if (typeof text !== 'string') {
            throw new TypeError(`${explain} is not a string`)
        }
        if (text.length > maxLength || text.length < minLength) {
            throw new RangeError(`${explain} number of characters is not valid`)
        }
    }
}

export default validator