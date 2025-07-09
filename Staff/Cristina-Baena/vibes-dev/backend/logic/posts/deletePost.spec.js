import { expect } from 'chai'
import deletePost from './deletePost.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('deletePost', () => {
    let testUserId, otherUserId, testPostId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {
        // Clean up any existing test data first
        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } }),
            data.hashtags.deleteMany({ name: { $regex: /test.*/ } })
        ])
        
        // Create test users
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        
        const user = await data.users.create({
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = user._id.toString()
        
        const otherUser = await data.users.create({
            username: `otheruser${timestamp}`,
            email: `other${timestamp}@example.com`,
            password: hashedPassword
        })
        otherUserId = otherUser._id.toString()
        
        // Create a test post
        const post = await data.posts.create({
            title: 'Test Post',
            content: 'This is a test post content',
            author: testUserId,
            hashtags: ['test', 'delete']
        })
        testPostId = post._id.toString()
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } }),
            data.hashtags.deleteMany({ name: { $regex: /test.*/ } })
        ])
    })

    it('GIVEN valid post ID WHEN deletePost called by owner THEN deletes post successfully', async () => {
        const result = await deletePost(testPostId, testUserId)

        expect(result).to.be.an('object')
        expect(result.message).to.equal('Post removed')
        
        // Verify post is deleted
        const deletedPost = await data.posts.findById(testPostId)
        expect(deletedPost).to.be.null
    })

    it('GIVEN invalid post ID WHEN deletePost called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await deletePost(invalidId, testUserId)
            expect.fail('Expected NotFoundError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Post not found')
        }
    })

    it('GIVEN unauthorized user WHEN deletePost called THEN throws UnauthorizedError', async () => {
        try {
            await deletePost(testPostId, otherUserId)
            expect.fail('Expected UnauthorizedError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.UnauthorizedError)
            expect(error.message).to.equal('Not authorized to delete this post')
        }
    })

    it('GIVEN post with hashtags used only once WHEN deletePost called THEN deletes hashtags completely', async () => {
        // Create a hashtag with count 1
        await data.hashtags.create({ name: 'uniquetag', count: 1 })
        
        // Create post with this unique hashtag
        const post = await data.posts.create({
            title: 'Test Post with Unique Tag',
            content: 'This post has #uniquetag',
            author: testUserId,
            hashtags: ['uniquetag']
        })
        
        await deletePost(post._id.toString(), testUserId)
        
        // Verify hashtag is completely deleted
        const deletedHashtag = await data.hashtags.findOne({ name: 'uniquetag' })
        expect(deletedHashtag).to.be.null
    })

    after(() => {
        return data.disconnect()
    })
})