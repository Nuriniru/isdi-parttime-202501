import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Sanitize individual input string
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags and sanitize
    const cleaned = DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
    
    // Additional cleaning
    return cleaned
        .trim()
        .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
        .substring(0, 1000); // Limit length
};

// Sanitize object recursively
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'object' ? sanitizeObject(item) : sanitizeInput(item)
            );
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

// Sanitize user object for output
export const sanitizeUser = (user) => {
    if (!user) return null;
    
    const sanitized = {
        id: user._id || user.id,
        username: sanitizeInput(user.username),
        email: user.email, // Email is already validated
        bio: sanitizeInput(user.bio),
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
    
    // Remove any undefined values
    return Object.fromEntries(
        Object.entries(sanitized).filter(([_, value]) => value !== undefined)
    );
};

// Sanitize post object for output
export const sanitizePost = (post) => {
    if (!post) return null;
    
    return {
        id: post._id || post.id,
        title: sanitizeInput(post.title),
        content: sanitizeInput(post.content),
        image: post.image,
        author: post.author ? sanitizeUser(post.author) : null,
        likes: post.likes || [],
        comments: post.comments ? post.comments.map(sanitizeComment) : [],
        hashtags: post.hashtags ? post.hashtags.map(sanitizeInput) : [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
    };
};

// Sanitize comment object for output
export const sanitizeComment = (comment) => {
    if (!comment) return null;
    
    return {
        id: comment._id || comment.id,
        content: sanitizeInput(comment.content),
        author: comment.author ? sanitizeUser(comment.author) : null,
        createdAt: comment.createdAt
    };
};

// Sanitize error messages
export const sanitizeError = (error) => {
    if (typeof error === 'string') {
        return sanitizeInput(error);
    }
    
    if (error && error.message) {
        return sanitizeInput(error.message);
    }
    
    return 'An error occurred';
};

// Validate and sanitize file uploads
export const sanitizeFileUpload = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type');
    }
    
    if (file.size > maxSize) {
        throw new Error('File too large');
    }
    
    return {
        filename: sanitizeInput(file.filename),
        mimetype: file.mimetype,
        size: file.size
    };
};

// Sanitize database query parameters
export const sanitizeQueryParams = (params) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(params)) {
        // Prevent NoSQL injection
        if (typeof value === 'object' && value !== null) {
            continue; // Skip object queries that could be malicious
        }
        
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};