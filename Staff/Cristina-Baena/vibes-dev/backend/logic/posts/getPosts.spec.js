import { expect } from 'chai'
import getPosts from './getPosts.js'
import { data } from '../../data/index.js' 
import bcrypt from 'bcryptjs'

describe('getPosts', () => {
    let testUserId

    before(() => {
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    beforeEach(async () => {

        await data.posts.deleteMany({})
        await data.users.deleteMany({})
        

        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        })
        testUserId = user._id.toString()

        await data.posts.create({
            title: 'Post with 3 likes',
            content: 'Content 1',
            author: testUserId,
            likes: [testUserId, testUserId, testUserId] 
        })

        await data.posts.create({
            title: 'Post with 1 like',
            content: 'Content 2', 
            author: testUserId,
            likes: [testUserId] 
        })

        await data.posts.create({
            title: 'Post with no likes',
            content: 'Content 3',
            author: testUserId,
            likes: []
        })
    })

    afterEach(() => {
        return Promise.all([
            data.posts.deleteMany({ author: testUserId }),
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } })
        ])
    })

    it('GIVEN posts with different like counts WHEN getPosts called THEN returns posts sorted by likes desc', async () => {
        const result = await getPosts({ sortBy: 'likes' }) 

        expect(result.posts).to.be.an('array')
        expect(result.posts).to.have.length(3)

        expect(result.posts[0].title).to.equal('Post with 3 likes')
        expect(result.posts[1].title).to.equal('Post with 1 like')
        expect(result.posts[2].title).to.equal('Post with no likes')
    })

    it('GIVEN hashtag filter WHEN getPosts called THEN returns filtered posts', async () => {

        await data.posts.create({
            title: 'Hashtag Post',
            content: 'Content with hashtag',
            author: testUserId,
            hashtags: ['testhashtag'],
            likes: []
        })

        const result = await getPosts({ hashtag: 'testhashtag' })

        expect(result.posts).to.have.length(1)
        expect(result.posts[0].title).to.equal('Hashtag Post')
    })

    it('GIVEN pagination parameters WHEN getPosts called THEN returns paginated results', async () => {
        const result = await getPosts({ page: 1, limit: 2 })

        expect(result.posts).to.have.length(2)
        expect(result.currentPage).to.equal(1)
        expect(result.totalPages).to.be.a('number')
    })


    it('GIVEN invalid author ObjectId WHEN getPosts called THEN handles gracefully', async () => {
        try {
            await getPosts({ author: 'invalid-object-id' })
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(Error)
        }
    })
})