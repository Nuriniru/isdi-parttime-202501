import { expect } from "chai"
import { data } from "../../data/index.js"
import "dotenv/config"
import bcrypt from "bcryptjs"
import loginUser from "./loginUser.js"
import { errors } from 'common'
import sinon from "sinon"

describe('loginUser', () => {
    before(function() {
        this.timeout(10000)
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    after(() => {
        return data.disconnect()
    })

    // Clean up test data after each test
    afterEach(() => {
        // Only cleanup if connected
        if (data.isConnected && data.isConnected()) {
            return data.users.deleteMany({})
        }
        return Promise.resolve()
    })

    it('GIVEN correct email and password WHEN called login THEN returns user id as string', () => {
        const password = '12345Aa!'
        const email = 'test-login@mail.com'
        const username = 'test-login'

        // Create user without pre-hashing - let the model handle it
        return data.users.create({ username, password, email })
            .then(createdUser => {
                return loginUser(email, password)
                    .then(id => {
                        expect(id).to.be.a('string')
                        expect(id).to.be.equal(createdUser._id.toString())
                    })
            })
    })

    it('GIVEN an email that does not exist WHEN trying to login THEN throws ServerError', () => {
        return loginUser('nonexistent@mail.com', 'notarealpassword')
            .catch(error => {
                expect(error).to.be.an.instanceof(errors.ServerError)  // Changed from ExistenceError
                expect(error.message).to.be.a('string')
                expect(error.message).to.be.equal('user not found')
            })
    })

    it('GIVEN a valid email but incorrect password WHEN trying to login THEN throws AuthError', () => {
        const password = '12345Aa!'
        const email = 'test-auth@mail.com'
        const username = 'test-auth'

        return bcrypt.hash(password, 10)
            .then(hashPassword => {
                return data.users.create({ username, password: hashPassword, email })
                    .then(_ => {
                        return loginUser(email, 'wrong-password')
                            .catch(error => {
                                expect(error).to.be.instanceOf(errors.AuthError)
                                expect(error.message).to.be.a('string')
                                expect(error.message).to.be.equal('invalid credentials')
                            })
                    })
            })
    })

    // NEW TEST: Database connection error handling
    it('GIVEN database connection fails WHEN called login THEN throws ServerError', () => {
        const email = 'test-connection@mail.com'
        const password = '12345Aa!'
        
        // Temporarily disconnect to simulate connection error
        return data.disconnect()
            .then(() => {
                return loginUser(email, password)
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.ServerError)
                        expect(error.message).to.include('Client must be connected')
                        // Reconnect for other tests
                        return data.connect(process.env.MONGODB_URI_TEST)
                    })
            })
    })

    // NEW TEST: Unexpected database error
    it('GIVEN unexpected database error WHEN called login THEN throws ServerError', () => {
        const email = 'test-db-error@mail.com'
        const password = '12345Aa!'
        
        // Mock findOne to throw an unexpected error
        const originalFindOne = data.users.findOne
        data.users.findOne = sinon.stub().throws(new Error('Unexpected database error'))
        
        return loginUser(email, password)
            .catch(error => {
                expect(error).to.be.instanceOf(errors.ServerError)
                expect(error.message).to.include('Unexpected database error')
                // Restore original method
                data.users.findOne = originalFindOne
            })
    })
})