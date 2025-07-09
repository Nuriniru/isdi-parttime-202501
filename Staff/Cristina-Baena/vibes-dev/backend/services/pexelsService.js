import { createClient } from 'pexels';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient(process.env.PEXELS_API_KEY);

// Rate limiting storage (in production, use Redis or database)
const userRequestCounts = new Map();
const RATE_LIMIT_PER_HOUR = 50; // Adjust as needed
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Check rate limit for user
export function checkRateLimit(userId) {
    const now = Date.now();
    const userKey = userId.toString();
    
    if (!userRequestCounts.has(userKey)) {
        userRequestCounts.set(userKey, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
    }
    
    const userLimit = userRequestCounts.get(userKey);
    
    // Reset if window expired
    if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    if (userLimit.count >= RATE_LIMIT_PER_HOUR) {
        return false;
    }
    
    userLimit.count++;
    return true;
}

// Search images
export async function searchImages(query, page = 1, perPage = 15) {
    try {
        const response = await client.photos.search({
            query: query,
            page: page,
            per_page: Math.min(perPage, 20) // Limit max results
        });
        return {
            photos: response.photos,
            total_results: response.total_results,
            page: response.page,
            per_page: response.per_page
        };
    } catch (error) {
        console.error('Error searching images:', error);
        throw new Error('Failed to search images');
    }
}

// Get curated images
export async function getCuratedImages(page = 1, perPage = 15) {
    try {
        const response = await client.photos.curated({
            page: page,
            per_page: Math.min(perPage, 20)
        });
        return {
            photos: response.photos,
            page: response.page,
            per_page: response.per_page
        };
    } catch (error) {
        console.error('Error getting curated images:', error);
        throw new Error('Failed to get curated images');
    }
}

// Get image by ID
export async function getImageById(id) {
    try {
        const response = await client.photos.show({ id: id });
        return response;
    } catch (error) {
        console.error('Error getting image by ID:', error);
        throw new Error('Failed to get image');
    }
}