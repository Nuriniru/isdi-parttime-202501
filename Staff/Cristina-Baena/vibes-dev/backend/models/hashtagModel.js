import mongoose from 'mongoose';

const hashtagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Hashtags can only contain letters, numbers, and underscores']
    },
    count: {
        type: Number,
        default: 1
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for autocomplete searches
hashtagSchema.index({ name: 'text' });
hashtagSchema.index({ count: -1 });
hashtagSchema.index({ lastUsed: -1 });

const Hashtag = mongoose.model('Hashtag', hashtagSchema);

export default Hashtag;