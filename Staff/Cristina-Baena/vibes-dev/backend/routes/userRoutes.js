import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { validateEmail, validatePassword } from '../middleware/validation.js'
import { loginUser as loginUserHandler } from '../handlers/users/loginUser.js'  
import registerUserHandler from '../handlers/users/registerUser.js'              
import getUserProfileHandler from '../handlers/users/getUserProfile.js'          
import getUserPostsHandler from '../handlers/users/getUserPosts.js'            
import getUserLikedPostsHandler from '../handlers/users/getUserLikedPosts.js'   
import getUserCommentedPostsHandler from '../handlers/users/getUserCommentedPosts.js' 
import updateUserProfileHandler from '../handlers/users/updateUserProfile.js'   
import deleteUserHandler from '../handlers/users/deleteUser.js'                 
import getCurrentUserHandler from '../handlers/users/getCurrentUser.js'          
import updatePassword from '../handlers/users/updatePassword.js';

const router = express.Router()


router.post('/register', validateEmail, validatePassword, registerUserHandler)
router.post('/login', validateEmail, loginUserHandler)


router.get('/me', protect, getCurrentUserHandler)
router.get('/profile', protect, getUserProfileHandler)
router.put('/profile', protect, validateEmail, updateUserProfileHandler)
router.delete('/profile', protect, deleteUserHandler)
router.get('/profile/posts', protect, getUserPostsHandler)
router.get('/profile/liked-posts', protect, getUserLikedPostsHandler)
router.get('/profile/commented-posts', protect, getUserCommentedPostsHandler)
router.patch('/password', protect, updatePassword);

export default router