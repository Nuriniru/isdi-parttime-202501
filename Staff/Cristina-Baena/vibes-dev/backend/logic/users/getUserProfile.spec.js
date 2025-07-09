import { expect } from 'chai'
import getUserProfile from './getUserProfile.js'
import { errors } from 'common'
import { data } from '../../data/index.js'
import bcrypt from 'bcryptjs'

describe('getUserProfile', () => {
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
        
        // Create a test user
        const timestamp = Date.now()
        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: hashedPassword,
            bio: 'Test user bio'
        })
        testUserId = user._id.toString()
    })

    afterEach(() => {
        return Promise.all([
            data.users.deleteMany({ email: { $regex: /test.*@.*/ } }),
            data.users.deleteMany({ username: { $regex: /testuser.*/ } })
        ])
    })

    it('GIVEN valid user ID WHEN getUserProfile called THEN returns user profile without password', async () => {
        const result = await getUserProfile(testUserId)

        expect(result).to.be.an('object')
        expect(result.username).to.include('testuser')
        expect(result.email).to.include('test')
        expect(result.bio).to.equal('Test user bio')
        expect(result.password).to.be.undefined
        expect(result.id).to.equal(testUserId)  // Changed from result._id.toString()
    })

    it('GIVEN invalid user ID WHEN getUserProfile called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await getUserProfile(invalidId)
            expect.fail('Expected NotFoundError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('User not found')
        }
    })

    it('GIVEN malformed user ID WHEN getUserProfile called THEN throws ValidationError', async () => {
        const malformedId = 'invalid-id'
        
        try {
            await getUserProfile(malformedId)
            expect.fail('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })

    after(() => {
        return data.disconnect()
    })
})