
import { data } from "../../data/index.js"
import { validator , errors} from 'common'

const deleteUser = async (userId) => {
    validator.id(userId)
    
    try {
        const user = await data.users.findById(userId)
        if (!user) {
            throw new errors.NotFoundError('User not found')
        }
        
        await data.users.findByIdAndDelete(userId)
    } catch (error) {
        if (error.name === 'CastError') {
            throw new errors.ValidationError('Invalid user ID format')
        }
        throw error
    }
}

export default deleteUser