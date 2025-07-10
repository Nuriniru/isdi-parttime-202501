import "dotenv/config"
import { expect } from "chai"
import jwt from "jsonwebtoken"
import getCurrentUser from "./getCurrentUser.js"
import { errors } from 'common'
import { data } from "../../data/index.js"
import bcrypt from "bcryptjs"

describe('getCurrentUser', () => {
    let userId, token

    before(function() {
        this.timeout(10000)
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    after(() => {
        return data.disconnect()
    })

    beforeEach(async () => {

        const hashedPassword = await bcrypt.hash('Test123$!', 10)
        const user = await data.users.create({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        })
        userId = user._id.toString()
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
    })

    afterEach(() => {
        return data.users.deleteMany({ email: { $regex: /test.*@.*/ } })
    })

    it('GIVEN valid token WHEN getCurrentUser called THEN returns user data without password', async () => {
        const result = await getCurrentUser(userId)
        
        expect(result.username).to.equal('testuser')
        expect(result.email).to.equal('test@example.com')
        expect(result.password).to.be.undefined
        expect(result.id).to.equal(userId) 
    })

    it('GIVEN invalid user ID WHEN getCurrentUser called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await getCurrentUser(invalidId)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
            expect(error.message).to.equal('User not found')
        }
    })

    it('GIVEN malformed ObjectId WHEN getCurrentUser called THEN throws ValidationError', async () => {
        try {
            await getCurrentUser('invalid-object-id')
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.contain('Invalid user ID format')
        }
    })
})