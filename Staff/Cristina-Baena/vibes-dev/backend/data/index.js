import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Hashtag from '../models/hashtagModel.js';

export const data = {
    users: User,
    posts: Post,
    hashtags: Hashtag,
    ObjectId: mongoose.Types.ObjectId,
    connect: (url) => {
        return mongoose.connect(url)
            .then(() => {
                const dbName = url.split('/').pop()?.split('?')[0];
                console.info(`Connected to MongoDB Atlas database: ${dbName}`);
            })
            .catch(error => {
                console.error('MongoDB Atlas connection error:', error);
                throw error;
            });
    },
    disconnect: () => {
        return mongoose.disconnect()
            .then(() => console.info('Disconnected from MongoDB Atlas'))
            .catch(error => console.error('Disconnect error:', error));
    }
};