import { expect } from 'chai'
import updatePost from './updatePost.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('updatePost', () => {
    let testUserId, otherUserId, testPostId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {

        await Promise.all([
            data.posts.deleteMany({ title: { $regex: /test.*post/i } }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } }),
            data.hashtags.deleteMany({ name: { $regex: /test.*/ } })
        ])
        

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
        

        const post = await data.posts.create({
            title: 'Test Post',
            content: 'This is a test post content',
            author: testUserId,
            hashtags: ['original']
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

    it('GIVEN valid update data WHEN updatePost called by owner THEN updates post successfully', async () => {
        const updateData = {
            title: 'Updated Test Post',
            content: 'Updated content',
            hashtags: ['updated', 'test']
        }

        const result = await updatePost(testPostId, testUserId, updateData)

        expect(result).to.be.an('object')
        expect(result.title).to.equal('Updated Test Post')
        expect(result.content).to.equal('Updated content')
        expect(result.hashtags).to.deep.equal(['updated', 'test'])
        expect(result.author).to.be.an('object')
    })

    it('GIVEN invalid post ID WHEN updatePost called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        const updateData = { title: 'Updated Title' }
        
        try {
            await updatePost(invalidId, testUserId, updateData)
            expect.fail('Expected NotFoundError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('Post not found')
        }
    })

    it('GIVEN unauthorized user WHEN updatePost called THEN throws UnauthorizedError', async () => {
        const updateData = { title: 'Unauthorized Update' }
        
        try {
            await updatePost(testPostId, otherUserId, updateData)
            expect.fail('Expected UnauthorizedError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.UnauthorizedError)
            expect(error.message).to.equal('Not authorized to update this post')
        }
    })

    it('GIVEN invalid title WHEN updatePost called THEN throws ValidationError', async () => {
        const updateData = { title: '   ' } 
        
        try {
            await updatePost(testPostId, testUserId, updateData)
            expect.fail('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })

    it('GIVEN invalid content WHEN updatePost called THEN throws ValidationError', async () => {
        const updateData = { content: '   ' } 
        
        try {
            await updatePost(testPostId, testUserId, updateData)
            expect.fail('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })

    it('GIVEN partial update with image WHEN updatePost called THEN updates only provided fields', async () => {
        const updateData = {
            image: {
                url: 'https://example.com/new-image.jpg',
                altText: 'New image'
            } 
        }

        const result = await updatePost(testPostId, testUserId, updateData)

        expect(result.image.url).to.equal('https://example.com/new-image.jpg')
        expect(result.title).to.equal('Test Post') 
        expect(result.content).to.equal('This is a test post content') 
    })

    it('GIVEN hashtags explicitly set to empty array WHEN updatePost called THEN removes all hashtags', async () => {
        const updateData = {
            hashtags: []
        }

        const result = await updatePost(testPostId, testUserId, updateData)

        expect(result.hashtags).to.deep.equal([])
    })

    it('GIVEN no changes to content or hashtags WHEN updatePost called THEN keeps existing hashtags', async () => {
        const updateData = {
            title: 'New Title Only'
        }

        const result = await updatePost(testPostId, testUserId, updateData)

        expect(result.title).to.equal('New Title Only')
        expect(result.hashtags).to.deep.equal(['original'])
    })

    after(() => {
        return data.disconnect()
    })
})