import { expect } from "chai"
import { data } from "../../data/index.js"
import 'dotenv/config'
import registerUser from "./registerUser.js"
import { errors } from 'common'
import bcrypt from "bcryptjs"
import sinon from "sinon"

describe('registerUser', () => {
    before(function() {
        this.timeout(10000)
        return data.connect(process.env.MONGODB_URI_TEST)
    })

    after(() => {
        return data.disconnect()
    })


    afterEach(async () => {
        try {
            await data.users.deleteMany({ email: { $regex: /test.*@mail\.com/ } })
        } catch (error) {
            return Promise.resolve()
        }
    })

    it('GIVEN valid data not present in DB WHEN called registerUser THEN adds user to DB and returns transformed user', () => {
        const email = 'test-register@mail.com'
        const password = '12345Aa!'
        const username = 'test-register'

        return registerUser(email, password, username)
            .then((result) => {

                expect(result).to.not.be.empty
                expect(result.email).to.equal(email)
                expect(result.username).to.equal(username)
                expect(result.id).to.exist 
                expect(result._id).to.not.exist 
                expect(result.password).to.not.exist 
                

                return data.users.find({ email })
                    .then((users) => {
                        const user = users[0]
                        return bcrypt.compare(password, user.password)
                            .then(passwordMatch => {
                                expect(user).to.not.be.empty
                                expect(user.email).to.equal(email)
                                expect(passwordMatch).to.be.true
                                expect(user.username).to.equal(username)
                                expect(user._id).to.exist 
                                expect(user._id.toString()).to.equal(result.id)
                            })
                    })
            })
    })

    it('GIVEN valid data but already used by existing user WHEN called registerUser THEN throws DuplicityError', () => {
        const password = '12345Aa!'
        const email = 'test-duplicate@mail.com'
        const username = 'test-duplicate'

        return bcrypt.hash(password, 10)
            .then(hashPassword => {
                return data.users.create({ username, password: hashPassword, email })
                    .then(() => {
                        return registerUser(email, password, username)
                            .catch(error => {
                                expect(error).to.be.instanceOf(errors.DuplicityError)
                                expect(error.message).to.be.a('string')
                                expect(error.message).to.be.equal('user already exists')
                            })
                    })
            })
    })

    it('GIVEN database connection fails WHEN called registerUser THEN throws ServerError', () => {
        const email = 'test-connection@mail.com'
        const password = '12345Aa!'
        const username = 'test-connection'
        

        return data.disconnect()
            .then(() => {
                return registerUser(email, password, username)
                    .catch(error => {
                        expect(error).to.be.instanceOf(errors.ServerError)
                        expect(error.message).to.include('Client must be connected')
                        return data.connect(process.env.MONGODB_URI_TEST)
                    })
            })
    })
})
