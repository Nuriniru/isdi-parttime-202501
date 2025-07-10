import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profilePicture: {
        type: String,
        default: 'default.jpg'
    },
    avatar: {
        url: String,
        thumbnail: String,
        source: {
            type: String,
            enum: ['pexels', 'upload', 'default'],
            default: 'default'
        },
        photographer: String,
        photographer_url: String,
        alt: String,
        originalName: String,
        mimeType: String,
        size: Number,
        pexelsId: String,
        data: String
    },
    bio: {
        type: String,
        maxlength: [200, 'Bio cannot exceed 200 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})


userSchema.index({ createdAt: -1 })


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    }
    
    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error) {
        next(error)
    }
})


userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}


userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    user.id = user._id.toString();
    delete user._id;
    return user;
};

const User = mongoose.model('User', userSchema)

export default User