import { expect } from 'chai'
import likePost from './likePost.js'
import { data } from '../../data/index.js'  // Changed from: import data from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('likePost', () => {
    let testUserId, testPostId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {
        // Create test user
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        })
        testUserId = user._id.toString()

        // Create test post
        const post = await data.posts.create({
            title: 'Test Post',
            content: 'Test content',
            author: testUserId,
            hashtags: [],
            likes: []
        })
        testPostId = post._id.toString()
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ author: testUserId }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } })
        ])
    })

    it('GIVEN valid post and user WHEN likePost called THEN adds like successfully', async () => {
        // Fix: Correct parameter order
        const result = await likePost(testPostId, testUserId)

        expect(result.isLiked).to.be.true
        expect(result.likesCount).to.equal(1)
    })

    it('GIVEN already liked post WHEN likePost called THEN removes like (unlike)', async () => {
        // First like
        await likePost(testPostId, testUserId)
        
        // Unlike
        const result = await likePost(testPostId, testUserId)

        expect(result.isLiked).to.be.false
        expect(result.likesCount).to.equal(0)
    })

    it('GIVEN invalid post ID WHEN likePost called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'

        try {
            await likePost(testUserId, invalidId)
            expect.fail('Expected NotFoundError')
        } catch (error) {
            expect(error.name).to.equal('NotFoundError')
        }
    })
})