import mongoose from 'mongoose';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { data } from '../data/index.js';
import dotenv from 'dotenv';
import Hashtag from '../models/hashtagModel.js';
import Post from '../models/postModel.js';

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Sample user data
const sampleUsers = [
    {
        username: 'john_photographer',
        email: 'john@example.com',
        password: 'Password123!',
        bio: 'Nature and landscape photographer'
    },
    {
        username: 'sarah_artist',
        email: 'sarah@example.com', 
        password: 'Password123@',
        bio: 'Digital artist and creative enthusiast'
    },
    {
        username: 'mike_traveler',
        email: 'mike@example.com',
        password: 'Password123#',
        bio: 'Travel blogger and adventure seeker'
    },
    {
        username: 'emma_foodie',
        email: 'emma@example.com',
        password: 'Password123$',
        bio: 'Food photographer and recipe creator'
    },
    {
        username: 'alex_tech',
        email: 'alex@example.com',
        password: 'Password123&',
        bio: 'Tech enthusiast and startup founder'
    }
];

// Sample post content with search queries for Pexels
const samplePosts = [
    {
        title: 'Beautiful Mountain Landscape',
        content: 'Captured this stunning view during my morning hike. Nature never fails to amaze me! #nature #mountains #hiking',
        pexelsQuery: 'mountain landscape',
        hashtags: ['nature', 'mountains', 'hiking']
    },
    {
        title: 'Delicious Homemade Pizza',
        content: 'Made this amazing pizza from scratch today. The secret is in the dough! #food #pizza #cooking',
        pexelsQuery: 'pizza food',
        hashtags: ['food', 'pizza', 'cooking']
    },
    {
        title: 'City Lights at Night',
        content: 'The city never sleeps. Love the energy and vibes here! #city #nightlife #urban',
        pexelsQuery: 'city lights night',
        hashtags: ['city', 'nightlife', 'urban']
    },
    {
        title: 'Cute Puppy Playing',
        content: 'This little guy made my day! Puppies bring so much joy to our lives. #dogs #puppies #pets',
        pexelsQuery: 'cute puppy',
        hashtags: ['dogs', 'puppies', 'pets']
    },
    {
        title: 'Fresh Coffee Morning',
        content: 'Starting the day right with a perfect cup of coffee. What\'s your favorite morning ritual? #coffee #morning #lifestyle',
        pexelsQuery: 'coffee morning',
        hashtags: ['coffee', 'morning', 'lifestyle']
    },
    {
        title: 'Ocean Sunset View',
        content: 'Nothing beats a sunset by the ocean. Pure magic! #sunset #ocean #beach',
        pexelsQuery: 'ocean sunset',
        hashtags: ['sunset', 'ocean', 'beach']
    },
    {
        title: 'Workspace Setup',
        content: 'My productive workspace setup. Clean desk, clear mind! #workspace #productivity #tech',
        pexelsQuery: 'workspace desk',
        hashtags: ['workspace', 'productivity', 'tech']
    },
    {
        title: 'Fresh Garden Vegetables',
        content: 'Harvest time! Nothing beats fresh vegetables from your own garden. #gardening #vegetables #organic',
        pexelsQuery: 'fresh vegetables',
        hashtags: ['gardening', 'vegetables', 'organic']
    },
    {
        title: 'Street Art Discovery',
        content: 'Found this incredible mural during my walk today. Street art tells such powerful stories! #streetart #urban #art',
        pexelsQuery: 'street art mural',
        hashtags: ['streetart', 'urban', 'art']
    },
    {
        title: 'Cozy Reading Corner',
        content: 'My favorite spot to unwind with a good book. Sometimes the simple pleasures are the best! #reading #books #cozy',
        pexelsQuery: 'reading book cozy',
        hashtags: ['reading', 'books', 'cozy']
    },
    {
        title: 'Morning Yoga Session',
        content: 'Starting the day with some mindful movement. Yoga always centers me! #yoga #mindfulness #wellness',
        pexelsQuery: 'yoga morning',
        hashtags: ['yoga', 'mindfulness', 'wellness']
    },
    {
        title: 'Farmers Market Haul',
        content: 'Love supporting local farmers and getting the freshest produce! #farmersmarket #local #fresh',
        pexelsQuery: 'farmers market vegetables',
        hashtags: ['farmersmarket', 'local', 'fresh']
    }
];

// Sample comments
const sampleComments = [
    'Amazing shot! 📸',
    'This looks incredible!',
    'Love the composition',
    'So beautiful! 😍',
    'Great work!',
    'This made my day!',
    'Stunning colors',
    'Perfect timing!',
    'Absolutely gorgeous',
    'Thanks for sharing!',
    'This is inspiring',
    'What camera did you use?',
    'The lighting is perfect',
    'I want to visit this place!',
    'Recipe please! 🍕',
    'This looks delicious',
    'My mouth is watering',
    'Can you share the recipe?',
    'Looks professional!',
    'Great perspective',
    'Love this vibe!',
    'So peaceful',
    'Goals! 💯',
    'Beautiful capture',
    'This speaks to me'
];

// Function to extract hashtags from content
function extractHashtags(content) {
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
}

// Function to update hashtag counts
async function updateHashtagCounts(hashtags) {
    console.log('Updating hashtag counts for:', hashtags);
    
    for (const tag of hashtags) {
        const normalizedTag = tag.toLowerCase();
        await Hashtag.findOneAndUpdate(
            { name: normalizedTag },
            { 
                $inc: { count: 1 },
                $set: { lastUsed: new Date() }
            },
            { upsert: true, new: true }
        );
        console.log(`✓ Updated hashtag: ${normalizedTag}`);
    }
}

// Fetch photos from Pexels API
async function fetchPexelsPhoto(query) {
    try {
        const response = await axios.get(`${PEXELS_BASE_URL}/search`, {
            headers: {
                Authorization: PEXELS_API_KEY
            },
            params: {
                query: query,
                per_page: 15,
                orientation: 'landscape'
            }
        });

        if (response.data.photos && response.data.photos.length > 0) {
            // Get a random photo from the results
            const randomIndex = Math.floor(Math.random() * response.data.photos.length);
            const photo = response.data.photos[randomIndex];
            
            return {
                url: photo.src.large,
                thumbnail: photo.src.medium,
                alt: photo.alt || `Photo by ${photo.photographer}`,
                photographer: photo.photographer,
                photographer_url: photo.photographer_url,
                source: 'pexels',
                pexels_id: photo.id.toString()
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching photo for query "${query}":`, error.message);
        return null;
    }
}

// Create users with avatars
async function createUsers() {
    console.log('Creating users...');
    const users = [];
    
    for (const userData of sampleUsers) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Fetch a profile picture from Pexels
            console.log(`Fetching avatar for: ${userData.username}`);
            const avatarImage = await fetchPexelsPhoto('portrait person');
            
            const user = await data.users.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                bio: userData.bio,
                avatar: avatarImage ? {
                    url: avatarImage.url,
                    thumbnail: avatarImage.thumbnail,
                    source: 'pexels',
                    photographer: avatarImage.photographer,
                    photographer_url: avatarImage.photographer_url,
                    alt: avatarImage.alt,
                    pexelsId: avatarImage.pexels_id
                } : undefined
            });
            
            users.push(user);
            console.log(`✓ Created user: ${userData.username}`);
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error creating user ${userData.username}:`, error.message);
        }
    }
    
    return users;
}

// Create posts with Pexels images and populate hashtags
async function createPosts(users) {
    console.log('Creating posts with Pexels images...');
    const posts = [];
    
    for (let i = 0; i < samplePosts.length; i++) {
        const postData = samplePosts[i];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        try {
            // Fetch image from Pexels
            console.log(`Fetching image for: ${postData.pexelsQuery}`);
            const image = await fetchPexelsPhoto(postData.pexelsQuery);
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            // Extract hashtags from content and combine with predefined hashtags
            const contentHashtags = extractHashtags(postData.content);
            const allHashtags = [...new Set([...postData.hashtags, ...contentHashtags])];
            
            // Create the post
            const post = await data.posts.create({
                title: postData.title,
                content: postData.content,
                author: randomUser._id,
                hashtags: allHashtags,
                image: image,
                likes: [],
                comments: []
            });
            
            // Update hashtag counts in the Hashtag collection
            await updateHashtagCounts(allHashtags);
            
            posts.push(post);
            console.log(`✓ Created post: ${postData.title} with hashtags: ${allHashtags.join(', ')}`);
        } catch (error) {
            console.error(`Error creating post "${postData.title}":`, error.message);
        }
    }
    
    return posts;
}

// Add comments to posts
async function addComments(users, posts) {
    console.log('Adding comments to posts...');
    
    for (const post of posts) {
        try {
            // Add 2-6 random comments per post
            const numComments = Math.floor(Math.random() * 5) + 2;
            
            for (let i = 0; i < numComments; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                
                post.comments.push({
                    user: randomUser._id,
                    content: randomComment,
                    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
                });
            }
            
            await post.save();
            console.log(`✓ Added ${numComments} comments to: ${post.title}`);
        } catch (error) {
            console.error(`Error adding comments to post "${post.title}":`, error.message);
        }
    }
}

// Add likes to posts
async function addLikes(users, posts) {
    console.log('Adding likes to posts...');
    
    for (const post of posts) {
        try {
            // Add 1-10 random likes per post
            const numLikes = Math.floor(Math.random() * 10) + 1;
            const likedUsers = [];
            
            for (let i = 0; i < numLikes; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                
                // Avoid duplicate likes from same user
                if (!likedUsers.includes(randomUser._id.toString())) {
                    likedUsers.push(randomUser._id.toString());
                    post.likes.push(randomUser._id);
                }
            }
            
            await post.save();
            console.log(`✓ Added ${post.likes.length} likes to: ${post.title}`);
        } catch (error) {
            console.error(`Error adding likes to post "${post.title}":`, error.message);
        }
    }
}

// Main seeding function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to database
        await data.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_DEV);
        
        // Clear existing data (optional - remove if you want to keep existing data)
        console.log('Clearing existing data...');
        await data.posts.deleteMany({});
        await data.users.deleteMany({});
        await data.hashtags.deleteMany({});
        
        // Create sample data
        const users = await createUsers();
        const posts = await createPosts(users);
        await addComments(users, posts);
        await addLikes(users, posts);
        
        // Display final hashtag count
        const hashtagCount = await Hashtag.countDocuments();
        console.log(`\n📊 Total hashtags created: ${hashtagCount}`);
        
        const allHashtags = await Hashtag.find().select('name count').sort({ count: -1 });
        console.log('Hashtags in database:');
        allHashtags.forEach(tag => {
            console.log(`  - ${tag.name}: ${tag.count} uses`);
        });
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`Created ${users.length} users and ${posts.length} posts with Pexels images`);
        console.log('\nSample login credentials:');
        console.log('Username: john_photographer | Email: john@example.com');
        console.log('Username: sarah_artist | Email: sarah@example.com');
        console.log('Note: All test accounts use the default password.');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await data.disconnect();
        process.exit(0);
    }
}

// Check if Pexels API key is provided
if (!PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY environment variable is required');
    console.log('Please add your Pexels API key to your .env file:');
    console.log('PEXELS_API_KEY=your_api_key_here');
    process.exit(1);
}

// Run the seeding script
seedDatabase();