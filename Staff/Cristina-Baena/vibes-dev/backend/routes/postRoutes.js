import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { validatePostContent, validateObjectId } from '../middleware/validation.js'
import Post from '../models/postModel.js'
import Hashtag from '../models/hashtagModel.js'


import { createPost as createPostLogic, likePost as likePostLogic, getPosts as getPostsLogic } from '../logic/index.js'


import addCommentHandler from '../handlers/posts/addComment.js'
import deleteCommentHandler from '../handlers/posts/deleteComment.js'
import createPostHandler from '../handlers/posts/createPost.js'
import getPostHandler from '../handlers/posts/getPost.js'
import updatePostHandler from '../handlers/posts/updatePost.js'
import deletePostHandler from '../handlers/posts/deletePost.js'
import likePostHandler from '../handlers/posts/likePost.js'
import getPostsHandler from '../handlers/posts/getPosts.js'

const router = express.Router()

router.use('/', (req, res, next) => {
    console.log('POST ROUTES: Request to', req.method, req.path, 'with query:', req.query)
    next()
})


router.get('/', getPostsHandler)
router.get('/:id', validateObjectId, getPostHandler)


router.post('/', protect, validatePostContent, createPostHandler)
router.put('/:id', protect, validateObjectId, validatePostContent, updatePostHandler)
router.delete('/:id', protect, validateObjectId, deletePostHandler)
router.post('/:id/like', protect, validateObjectId, likePostHandler)
router.post('/:id/comments', protect, validateObjectId, addCommentHandler)
router.delete('/:id/comments/:commentId', protect, validateObjectId, deleteCommentHandler)

export default router