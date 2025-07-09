import { expect } from 'chai'
import getUserPosts from './getUserPosts.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('getUserPosts', () => {
    let testUserId, otherUserId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {
        // Clean up any existing test data first
        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
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
        
        // Create test posts for the user
        await data.posts.create({
            title: 'Test Post 1',
            content: 'Content for test post 1',
            author: testUserId
        })
        
        await data.posts.create({
            title: 'Test Post 2',
            content: 'Content for test post 2',
            author: testUserId
        })
        
        // Create a post for another user (should not be included)
        await data.posts.create({
            title: 'Other User Post',
            content: 'Content for other user post',
            author: otherUserId
        })
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.posts.deleteMany({ title: { $regex: /other.*user.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
        ])
    })

    it('GIVEN valid user ID WHEN getUserPosts called THEN returns user posts only', async () => {
        const result = await getUserPosts(testUserId)

        expect(result).to.be.an('object')
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(2)
        expect(result.total).to.equal(2)
        expect(result.currentPage).to.equal(1)
        
        // Verify all posts belong to the user
        result.posts.forEach(post => {
            expect(post.author.id).to.equal(testUserId)  // Changed from post.author._id.toString()
        })
    })

    it('GIVEN pagination filters WHEN getUserPosts called THEN returns paginated results', async () => {
        const filters = {
            page: 1,
            limit: 1
        }
        
        const result = await getUserPosts(testUserId, filters)

        expect(result).to.be.an('object')
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(1)
        expect(result.total).to.equal(2)
        expect(result.currentPage).to.equal(1)
        expect(result.totalPages).to.equal(2)
    })

    it('GIVEN user with no posts WHEN getUserPosts called THEN returns empty array', async () => {
        // Create a new user with no posts
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const newUser = await data.users.create({
            username: `newuser${timestamp}`,
            email: `new${timestamp}@example.com`,
            password: hashedPassword
        })
        
        const result = await getUserPosts(newUser._id.toString())

        expect(result).to.be.an('object')
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(0)
        expect(result.total).to.equal(0)
    })

    it('GIVEN malformed user ID WHEN getUserPosts called THEN throws ValidationError', async () => {
        const malformedId = 'invalid-id'
        
        try {
            await getUserPosts(malformedId)
            expect.fail('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })

    after(() => {
        return data.disconnect()
    })
})