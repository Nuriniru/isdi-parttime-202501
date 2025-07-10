import { expect } from 'chai'
import getPost from './getPost.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('getPost', () => {
    let testUserId, testPostId, testPostWithCommentsId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {

        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
        ])
        

        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = user._id.toString()
        

        const post = await data.posts.create({
            title: 'Test Post',
            content: 'This is a test post content',
            author: testUserId
        })
        testPostId = post._id.toString()
        
        const postWithComments = await data.posts.create({
            title: 'Test Post with Comments',
            content: 'This is a test post with comments',
            author: testUserId,
            comments: [{
                user: testUserId,
                content: 'This is a test comment',
                createdAt: new Date()
            }]
        })
        testPostWithCommentsId = postWithComments._id.toString()
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
        ])
    })

    it('GIVEN valid post ID WHEN getPost called THEN returns post with populated fields', async () => {
        const result = await getPost(testPostId)

        expect(result).to.be.an('object')
        expect(result.title).to.equal('Test Post')
        expect(result.content).to.equal('This is a test post content')
        expect(result.author).to.be.an('object')
        expect(result.author.username).to.exist
        expect(result.author.avatar).to.exist
        expect(result.id).to.exist
        expect(result._id).to.not.exist
        expect(result.author.id).to.exist
        expect(result.author._id).to.not.exist
    })

    it('GIVEN post with comments WHEN getPost called THEN returns post with transformed comments', async () => {
        const result = await getPost(testPostWithCommentsId)

        expect(result).to.be.an('object')
        expect(result.title).to.equal('Test Post with Comments')
        expect(result.comments).to.be.an('array')
        expect(result.comments).to.have.length(1)
        
        const comment = result.comments[0]
        expect(comment.id).to.exist
        expect(comment._id).to.not.exist
        expect(comment.content).to.equal('This is a test comment')
        expect(comment.user).to.be.an('object')
        expect(comment.user.id).to.exist
        expect(comment.user._id).to.not.exist
        expect(comment.user.username).to.exist
    })

    it('GIVEN invalid post ID WHEN getPost called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await getPost(invalidId)
            expect.fail('Expected NotFoundError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Post not found')
        }
    })

    after(() => {
        return data.disconnect()
    })
})