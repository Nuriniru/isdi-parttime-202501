import { expect } from 'chai'
import getUserCommentedPosts from './getUserCommentedPosts.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

describe('getUserCommentedPosts', () => {
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
            data.posts.deleteMany({ title: { $regex: /test.*commented/i } }),
            data.users.deleteMany({ email: { $regex: /testcomment.*@.*/ } })
        ])
        
        // Create test users
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        
        const testUser = await data.users.create({
            username: `testcommentuser${timestamp}`,
            email: `testcomment${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = testUser._id.toString()
        
        const author = await data.users.create({
            username: `authoruser${timestamp}`,
            email: `author${timestamp}@example.com`,
            password: hashedPassword
        })
        authorUserId = author._id.toString()
        
        const post = await data.posts.create({
            title: 'Test Commented Post',
            content: 'Content for commented post test',
            author: authorUserId,
            comments: [{
                user: testUserId,
                content: 'Test comment content',
                createdAt: new Date()
            }]
        })
        postId = post._id.toString()
    })

    afterEach(async () => {
        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*commented/i } }),
            data.users.deleteMany({ email: { $regex: /testcomment.*@.*/ } })
        ])
    })

    it('GIVEN valid userId WHEN called getUserCommentedPosts THEN returns posts with proper id transformation', async () => {
        const result = await getUserCommentedPosts(testUserId)
        
        expect(result).to.be.an('object')
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(1)
        
        const post = result.posts[0]
        

        expect(post.id).to.exist
        expect(post._id).to.not.exist
        expect(post.id).to.equal(postId)
        

        expect(post.author.id).to.exist
        expect(post.author._id).to.not.exist
        expect(post.author.id).to.equal(authorUserId)
        

        expect(post.comments).to.be.an('array')
        expect(post.comments).to.have.length(1)
        
        const comment = post.comments[0]
        expect(comment.id).to.exist
        expect(comment._id).to.not.exist
        expect(comment.user.id).to.exist
        expect(comment.user._id).to.not.exist
        expect(comment.user.id).to.equal(testUserId)
        

        expect(result.totalPages).to.be.a('number')
        expect(result.currentPage).to.equal(1)
        expect(result.totalPosts).to.equal(1)
    })

    it('GIVEN userId with no commented posts WHEN called getUserCommentedPosts THEN returns empty array', async () => {

        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const noCommentsUser = await data.users.create({
            username: `nocomments${timestamp}`,
            email: `nocomments${timestamp}@example.com`,
            password: hashedPassword
        })
        
        const result = await getUserCommentedPosts(noCommentsUser._id.toString())
        
        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(0)
        expect(result.totalPosts).to.equal(0)
    })

    it('GIVEN invalid userId WHEN called getUserCommentedPosts THEN throws ValidationError', async () => {
        try {
            await getUserCommentedPosts('invalid-id')
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })
})