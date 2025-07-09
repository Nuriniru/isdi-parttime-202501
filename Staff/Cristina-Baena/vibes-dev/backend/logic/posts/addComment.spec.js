import { expect } from 'chai'
import addComment from './addComment.js'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('addComment', () => {
    let testUserId, testPostId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {
        // Clean up any existing test data first
        await data.users.deleteMany({ 
            $or: [
                { email: { $regex: /test.*@.*/ } },
                { username: { $regex: /test.*/ } }
            ]
        })
        await data.posts.deleteMany({})

        // Create test user with unique timestamp
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = user._id.toString()

        // Create test post
        const post = await data.posts.create({
            title: 'Test Post',
            content: 'Test content',
            author: testUserId,
            hashtags: [],
            likes: [],
            comments: []
        })
        testPostId = post._id.toString()
    })

    afterEach(async () => {
        // More thorough cleanup
        await data.posts.deleteMany({})
        await data.users.deleteMany({ 
            $or: [
                { email: { $regex: /test.*@.*/ } },
                { username: { $regex: /test.*/ } }
            ]
        })
    })

    it('GIVEN valid post and comment content WHEN addComment called THEN adds comment successfully', async () => {
        const content = 'This is a test comment'
        
        const result = await addComment(testPostId, testUserId, content)

        expect(result.content).to.equal(content)
        expect(result.user.id).to.equal(testUserId)  // Changed from result.user._id.toString()
        expect(result.createdAt).to.be.a('date')
    })

    it('GIVEN empty content WHEN addComment called THEN throws ValidationError', async () => {
        try {
            await addComment(testPostId, testUserId, '')
            expect.fail('Expected ValidationError')
        } catch (error) {
            expect(error.name).to.equal('ValidationError')
            expect(error.message).to.equal('Comment content is required')
        }
    })

    it('GIVEN invalid post ID WHEN addComment called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await addComment(invalidId, testUserId, 'Test comment')
            expect.fail('Expected NotFoundError')
        } catch (error) {
            expect(error.name).to.equal('NotFoundError')
            expect(error.message).to.equal('Post not found')
        }
    })
})