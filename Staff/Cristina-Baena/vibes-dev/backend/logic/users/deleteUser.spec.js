import "dotenv/config"
import { expect } from "chai"
import jwt from "jsonwebtoken"
import deleteUser from "./deleteUser.js"
import { errors } from 'common'
import { data } from "../../data/index.js"  // Changed from default to named import
import bcrypt from "bcryptjs"

describe('deleteUser', () => {
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

    it('GIVEN valid user ID WHEN deleteUser called THEN deletes user successfully', async () => {
        await deleteUser(userId)
        
        // Verify user is deleted
        const deletedUser = await data.users.findById(userId)
        expect(deletedUser).to.be.null
    })

    it('GIVEN invalid user ID WHEN deleteUser called THEN throws NotFoundError', async () => {
        const invalidId = '507f1f77bcf86cd799439011'
        
        try {
            await deleteUser(invalidId)
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.NotFoundError)
        }
    })

    it('GIVEN malformed user ID WHEN deleteUser called THEN throws ValidationError', async () => {
        try {
            await deleteUser('invalid-id')
            expect.fail('Should have thrown an error')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
        }
    })
})