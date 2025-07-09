import { expect } from 'chai'
import jwt from "jsonwebtoken"
import updateUserProfile from "./updateUserProfile.js"
import { errors } from 'common'
import { data } from "../../data/index.js"
import bcrypt from "bcryptjs"

describe('updateUserProfile', () => {
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
            password: hashedPassword,
            bio: 'Original bio'
        })
        userId = user._id.toString()
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
    })

    afterEach(() => {
        return data.users.deleteMany({ 
            $or: [
                { email: { $regex: /test.*@.*/ } },
                { email: 'updated@example.com' },
                { email: 'other@example.com' },
                { username: 'otheruser' },
                { username: 'updateduser' },
                { username: 'existinguser' }
            ]
        })
    })

    // Basic successful updates
    it('GIVEN valid data WHEN updateUserProfile called THEN updates user successfully', async () => {
        const updateData = {
            username: 'updateduser',
            email: 'updated@example.com',
            bio: 'Updated bio'
        }
        
        const result = await updateUserProfile(userId, updateData)
        
        expect(result).to.be.an('object')
        expect(result.username).to.equal('updateduser')
        expect(result.email).to.equal('updated@example.com')
        expect(result.bio).to.equal('Updated bio')
        expect(result.password).to.be.undefined
    })

    it('GIVEN password update WHEN updateUserProfile called THEN updates password', async () => {
        const result = await updateUserProfile(userId, { password: 'NewPass123$!' })
        
        expect(result).to.be.an('object')
        expect(result.username).to.equal('testuser')
        
        const user = await data.users.findById(userId)
        const isMatch = await bcrypt.compare('NewPass123$!', user.password)
        expect(isMatch).to.be.true
    })

    it('GIVEN bio update WHEN updateUserProfile called THEN updates bio', async () => {
        const result = await updateUserProfile(userId, { bio: 'New bio' })
        expect(result.bio).to.equal('New bio')
    })

    // Validation errors - Fixed to remove expect.fail()
    it('GIVEN null updates WHEN updateUserProfile called THEN throws ValidationError', async () => {
        let error
        try {
            await updateUserProfile(userId, null)
        } catch (err) {
            error = err
        }
        expect(error).to.be.instanceOf(errors.ValidationError)
        expect(error.message).to.equal('No updates provided')
    })

    it('GIVEN undefined updates WHEN updateUserProfile called THEN throws ValidationError', async () => {
        let error
        try {
            await updateUserProfile(userId, undefined)
        } catch (err) {
            error = err
        }
        expect(error).to.be.instanceOf(errors.ValidationError)
        expect(error.message).to.equal('No updates provided')
    })

    it('GIVEN empty updates WHEN updateUserProfile called THEN throws ValidationError', async () => {
        let error
        try {
            await updateUserProfile(userId, {})
        } catch (err) {
            error = err
        }
        expect(error).to.be.instanceOf(errors.ValidationError)
        expect(error.message).to.equal('No updates provided')
    })

    it('GIVEN invalid fields WHEN updateUserProfile called THEN throws ValidationError', async () => {
        let error
        try {
            await updateUserProfile(userId, { invalidField: 'value' })
        } catch (err) {
            error = err
        }
        expect(error).to.be.instanceOf(errors.ValidationError)
        expect(error.message).to.equal('Invalid updates')
    })

    it('GIVEN invalid user ID WHEN updateUserProfile called THEN throws NotFoundError', async () => {
        let error
        try {
            await updateUserProfile('507f1f77bcf86cd799439011', { username: 'test' })
        } catch (err) {
            error = err
        }
        expect(error).to.be.instanceOf(errors.NotFoundError)
    })

    // Duplicity errors
    it('GIVEN duplicate email WHEN updateUserProfile called THEN throws DuplicityError', async () => {
        await data.users.create({
            username: 'otheruser',
            email: 'other@example.com',
            password: await bcrypt.hash('Test123$!', 10)
        })
        
        try {
            await updateUserProfile(userId, { email: 'other@example.com' })
        } catch (error) {
            expect(error).to.be.instanceOf(errors.DuplicityError)
            return
        }
        throw new Error('Expected DuplicityError to be thrown')
    })

    it('GIVEN duplicate username WHEN updateUserProfile called THEN throws DuplicityError', async () => {
        await data.users.create({
            username: 'existinguser',
            email: 'existing@example.com',
            password: await bcrypt.hash('Test123$!', 10)
        })
        
        try {
            await updateUserProfile(userId, { username: 'existinguser' })
        } catch (error) {
            expect(error).to.be.instanceOf(errors.DuplicityError)
            return
        }
        throw new Error('Expected DuplicityError to be thrown')
    })

    // Avatar tests - successful cases
    it('GIVEN default avatar WHEN updateUserProfile called THEN updates successfully', async () => {
        const result = await updateUserProfile(userId, {
            avatar: {
                source: 'default',
                url: 'https://example.com/default.jpg'
            }
        })
        
        expect(result.avatar.source).to.equal('default')
        expect(result.avatar.url).to.equal('https://example.com/default.jpg')
    })

    it('GIVEN pexels avatar WHEN updateUserProfile called THEN updates successfully', async () => {
        const result = await updateUserProfile(userId, {
            avatar: {
                source: 'pexels',
                url: 'https://images.pexels.com/photos/123/photo.jpg',
                pexelsId: '123'
            }
        })
        
        expect(result.avatar.source).to.equal('pexels')
        expect(result.avatar.pexelsId).to.equal('123')
    })

    it('GIVEN upload avatar with jpeg WHEN updateUserProfile called THEN updates successfully', async () => {
        const validBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A'
        
        const result = await updateUserProfile(userId, {
            avatar: {
                source: 'upload',
                data: validBase64
            }
        })
        
        expect(result.avatar.source).to.equal('upload')
        expect(result.avatar.url).to.equal(validBase64)
    })

    // Add these test cases after the existing avatar tests:

    // Avatar validation error tests
    it('GIVEN avatar without source WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    url: 'https://example.com/avatar.jpg'
                    // missing source
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Invalid or missing avatar source')
        }
    })

    it('GIVEN avatar with invalid source WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'invalid-source',
                    url: 'https://example.com/avatar.jpg'
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Invalid or missing avatar source')
        }
    })

    it('GIVEN default avatar without URL WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'default'
                    // missing url
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Default avatar must have a valid URL')
        }
    })

    it('GIVEN pexels avatar without URL WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'pexels',
                    pexelsId: '12345'
                    // missing url
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Pexels avatar must have a valid URL')
        }
    })

    it('GIVEN pexels avatar without pexelsId WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'pexels',
                    url: 'https://images.pexels.com/photos/12345/avatar.jpg'
                    // missing pexelsId
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Pexels avatar must have a valid Pexels ID')
        }
    })

    it('GIVEN upload avatar without data WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'upload'
                    // missing data
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Uploaded avatar must have valid Base64 data')
        }
    })

    it('GIVEN upload avatar with invalid Base64 format WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'upload',
                    data: 'invalid-base64-data'
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Invalid Base64 image format')
        }
    })

    it('GIVEN upload avatar with unsupported image type WHEN updateUserProfile called THEN throws ValidationError', async () => {
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'upload',
                    data: 'data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Invalid Base64 image format')
        }
    })

    it('GIVEN upload avatar with file too large WHEN updateUserProfile called THEN throws ValidationError', async () => {
        // Create a large base64 string (simulate > 5MB)
        const largeBase64Data = 'A'.repeat(7 * 1024 * 1024) // 7MB of data
        const largeBase64 = `data:image/jpeg;base64,${largeBase64Data}`
        
        try {
            await updateUserProfile(userId, {
                avatar: {
                    source: 'upload',
                    data: largeBase64
                }
            })
            throw new Error('Expected ValidationError to be thrown')
        } catch (error) {
            expect(error).to.be.instanceOf(errors.ValidationError)
            expect(error.message).to.include('Image size too large')
        }
    })

    // Replace all remaining try-catch blocks with expect.fail() using the same pattern above
})