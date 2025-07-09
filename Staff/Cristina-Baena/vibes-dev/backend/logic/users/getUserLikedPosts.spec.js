import { expect } from 'chai'
import getUserLikedPosts from './getUserLikedPosts.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

describe('getUserLikedPosts', () => {
    let testUserId, authorUserId, postId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    after(() => {
        return data.disconnect()
    })

    beforeEach(async () => {
        // Clean up test data
        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*liked/i } }),
            data.users.deleteMany({ email: { $regex: /testliked.*@.*/ } })
        ])
        
        // Create test users
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        
        const testUser = await data.users.create({
            username: `testlikeduser${timestamp}`,
            email: `testliked${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = testUser._id.toString()
        
        const author = await data.users.create({
            username: `authoruser${timestamp}`,
            email: `author${timestamp}@example.com`,
            password: hashedPassword
        })
        authorUserId = author._id.toString()
        
        // Create test post and like it
        const post = await data.posts.create({
            title: 'Test Liked Post',
            content: 'Content for liked post test',
            author: authorUserId,
            likes: [testUserId] // User likes this post
        })
        postId = post._id.toString()
    })

    afterEach(async () => {
        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*liked/i } }),
            data.users.deleteMany({ email: { $regex: /testliked.*@.*/ } })
        ])
    })

    it('GIVEN valid userId WHEN called getUserLikedPosts THEN returns posts with proper id transformation', async () => {
        const result = await getUserLikedPosts(testUserId)
        
        expect(result).to.be.an('object')
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(1)
        
        const post = result.posts[0]
        
        // Test _id to id transformation
        expect(post.id).to.exist
        expect(post._id).to.not.exist
        expect(post.id).to.equal(postId)
        
        // Test author transformation
        expect(post.author.id).to.exist
        expect(post.author._id).to.not.exist
        expect(post.author.id).to.equal(authorUserId)
        
        // Test pagination info
        expect(result.totalPages).to.be.a('number')
        expect(result.currentPage).to.equal(1)
        expect(result.totalPosts).to.equal(1)
    })

    it('GIVEN userId with no liked posts WHEN called getUserLikedPosts THEN returns empty array', async () => {
        // Create user with no liked posts
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const noLikesUser = await data.users.create({
            username: `nolikes${timestamp}`,
            email: `nolikes${timestamp}@example.com`,
            password: hashedPassword
        })
        
        const result = await getUserLikedPosts(noLikesUser._id.toString())
        
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(0)
        expect(result.totalPosts).to.equal(0)
    })

    it('GIVEN invalid userId WHEN called getUserLikedPosts THEN throws ValidationError', async () => {
        try {
            await getUserLikedPosts('invalid-id')
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })
})