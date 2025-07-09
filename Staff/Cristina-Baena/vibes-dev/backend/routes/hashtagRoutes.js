import express from 'express';
import Hashtag from '../models/hashtagModel.js';
import { sanitizeInput } from '../utils/sanitize.js';

const router = express.Router();


router.get('/search', async (req, res) => {
    try {
       
        const q = sanitizeInput(req.query.q);
        
        if (!q || q.length < 1) {
            return res.json([]);
        }
        
        
        console.log('Searching hashtags with query:', q);
        
        const hashtags = await Hashtag.find({
            name: { $regex: q.toLowerCase(), $options: 'i' }
        })
        .sort({ count: -1, lastUsed: -1 })
        .limit(10)
        .select('name count');
        
        
        console.log('Found hashtags:', hashtags);
        
        res.json(hashtags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/popular', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        const hashtags = await Hashtag.find()
            .sort({ count: -1 })
            .limit(parseInt(limit))
            .select('name count');
            
        res.json(hashtags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const hashtags = await Hashtag.find()
            .sort({ lastUsed: -1, count: -1 })
            .limit(parseInt(limit))
            .select('name count lastUsed');
            
        res.json(hashtags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;