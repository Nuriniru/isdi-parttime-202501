import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { searchImages, getCuratedImages, getImageById } from '../services/pexelsService.js';  

const router = express.Router();


router.get('/search', protect, async (req, res) => {  
    try {
        const { query, page = 1, per_page = 15 } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const results = await searchImages(query, parseInt(page), parseInt(per_page));
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/images/curated
// @desc    Get curated images from Pexels
// @access  Private
router.get('/curated', protect, async (req, res) => {
    try {
        const { page = 1, per_page = 15 } = req.query;
        
        const results = await getCuratedImages(parseInt(page), parseInt(per_page));
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/images/:id
// @desc    Get specific image by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        
        const image = await getImageById(id);
        
        res.json({
            success: true,
            data: image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;