import { expect } from "chai"
import createPost from './createPost.js'
import { errors } from 'common'  
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('createPost', () => {
    let testUserId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {
        // Clean up any existing test data first
        await Promise.all([
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
        ])
        
        // Create a test user with unique username
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: hashedPassword
        })
        testUserId = user._id.toString()
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ author: testUserId }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } }),
            data.hashtags.deleteMany({ name: { $regex: /test.*/ } })
        ])
    })

    it('GIVEN valid post data WHEN createPost called THEN creates post successfully', async () => {
        const postData = {
            title: 'Test Post',
            content: 'This is a test post content',
            hashtags: ['test', 'mocha']
        }

        const result = await createPost(testUserId, postData)

        expect(result).to.be.an('object')
        expect(result.title).to.equal('Test Post')
        expect(result.content).to.equal('This is a test post content')
        expect(result.hashtags).to.deep.equal(['test', 'mocha'])
        expect(result.author.toString()).to.equal(testUserId)
        expect(result.likes).to.be.an('array').that.is.empty
    })

    it('GIVEN post with image WHEN createPost called THEN creates post with image', async () => {
        const postData = {
            title: 'Test Post with Image',
            content: 'Test content',
            image: {
                url: 'https://example.com/image.jpg',
                thumbnail: 'https://example.com/thumb.jpg',
                alt: 'Test image',
                photographer: 'Test Photographer',
                photographer_url: 'https://example.com/photographer',
                source: 'upload'
            }
        }

        const result = await createPost(testUserId, postData)

        expect(result.image).to.be.an('object')
        expect(result.image.url).to.equal('https://example.com/image.jpg')
        expect(result.image.alt).to.equal('Test image')
        expect(result.image.source).to.equal('upload')
    })

    it('GIVEN invalid user ID WHEN createPost called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        const postData = {
            title: 'Test Post',
            content: 'Test content'
        }

        try {
            await createPost(invalidId, postData)
            expect.fail('Expected NotFoundError')
        } catch (error) {
            expect(error.name).to.equal('NotFoundError')
        }
    })
// Replace the failing test with this corrected version:
it('GIVEN empty content and no image WHEN createPost called THEN throws ValidationError', async () => {
    try {
        await createPost(testUserId, {
            title: 'Test Title',
            content: '',
            image: null
        })
        expect.fail('Should have thrown an error')
    } catch (error) {
        expect(error).to.be.instanceOf(errors.ValidationError)
        expect(error.message).to.contain('Post must have either content or image')
    }
})
})