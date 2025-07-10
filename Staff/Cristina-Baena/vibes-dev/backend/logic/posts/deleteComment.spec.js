import { expect } from 'chai'
import deleteComment from './deleteComment.js'
import addComment from './addComment.js'
import { data } from '../../data/index.js'
import { errors } from 'common'
import bcrypt from 'bcryptjs'

describe('deleteComment', () => {
    let testUserId, testPostId, testCommentId, otherUserId, postAuthorId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {

        await data.users.deleteMany({ email: { $regex: /test.*@.*/ } })
        await data.posts.deleteMany({})

        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)

        const postAuthor = await data.users.create({
            username: `postauthor${timestamp}`,
            email: `postauthor${timestamp}@example.com`,
            password: hashedPassword
        })
        postAuthorId = postAuthor._id.toString()


        const commentOwner = await data.users.create({
            username: `commentowner${timestamp}`,
            email: `commentowner${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = commentOwner._id.toString()


        const otherUser = await data.users.create({
            username: `otheruser${timestamp}`,
            email: `otheruser${timestamp}@example.com`,
            password: hashedPassword
        })
        otherUserId = otherUser._id.toString()


        const post = await data.posts.create({
            title: 'Test Post',
            content: 'Test content',
            author: postAuthorId,
            hashtags: [],
            likes: [],
            comments: []
        })
        testPostId = post._id.toString()


        const comment = await addComment(testPostId, testUserId, 'Test comment')
        testCommentId = comment.id  
    })

    afterEach(async () => {
        await data.posts.deleteMany({})
        await data.users.deleteMany({ email: { $regex: /test.*@.*/ } })
    })


    it('should allow comment owner to delete their comment', async () => {
        const result = await deleteComment(testPostId, testCommentId, testUserId)
        expect(result.message).to.equal('Comment removed')
    })


    it('should allow post author to delete any comment on their post', async () => {
        const result = await deleteComment(testPostId, testCommentId, postAuthorId)
        expect(result.message).to.equal('Comment removed')
    })


    it('should throw UnauthorizedError when user is neither comment owner nor post author', async () => {
        try {
            await deleteComment(testPostId, testCommentId, otherUserId)
            expect.fail('Expected UnauthorizedError')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.UnauthorizedError)
            expect(error.message).to.equal('Not authorized to delete this comment')
        }
    })

    it('should throw NotFoundError when post does not exist', async () => {
        const nonExistentPostId = '507f1f77bcf86cd799439011'
        
        try {
            await deleteComment(nonExistentPostId, testCommentId, testUserId)
            expect.fail('Expected NotFoundError')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Post not found')
        }
    })


    it('should throw NotFoundError when comment does not exist', async () => {
        const nonExistentCommentId = '507f1f77bcf86cd799439011'
        
        try {
            await deleteComment(testPostId, nonExistentCommentId, testUserId)
            expect.fail('Expected NotFoundError')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Comment not found')
        }
    })


    it('should handle malformed post ID gracefully', async () => {
        try {
            await deleteComment('invalid-id', testCommentId, testUserId)
            expect.fail('Expected error to be thrown')
        } catch (error) {

            expect(error.name).to.equal('CastError')
        }
    })


    it('should allow post author to delete other users comments', async () => {

        const otherComment = await addComment(testPostId, otherUserId, 'Comment by other user')
        

        const result = await deleteComment(testPostId, otherComment.id, postAuthorId) 
        expect(result.message).to.equal('Comment removed')
    })


    it('should handle malformed comment ID', async () => {
        try {
            await deleteComment(testPostId, 'invalid-comment-id', testUserId)
            expect.fail('Expected error to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Comment not found')
        }
    })
})