import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true,
        maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    hashtags: [{
        type: String,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Hashtags can only contain letters, numbers, and underscores']
    }],
    image: {
        url: String,
        thumbnail: String,
        alt: String,
        photographer: String,
        photographer_url: String,
        source: {
            type: String,
            enum: ['pexels', 'upload'],
            default: 'upload'
        },
        pexels_id: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add database indexes for better performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ hashtags: 1 })
postSchema.index({ createdAt: -1 })
postSchema.index({ 'likes': 1 })
postSchema.index({ 'comments.user': 1 })

// Method to extract hashtags from content
postSchema.methods.extractHashtags = function(content) {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const hashtags = [];
    let match;
    
    while ((match = hashtagRegex.exec(content)) !== null) {
        const hashtag = match[1].toLowerCase();
        if (!hashtags.includes(hashtag)) {
            hashtags.push(hashtag);
        }
    }
    
    return hashtags;
};

const Post = mongoose.model('Post', postSchema);

export default Post;