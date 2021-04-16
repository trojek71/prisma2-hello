import jwt from 'jsonwebtoken'
const getUserId = (request) => {
    const header = request.request.headers.authorization
    console.log("adas",header)
    if (!header){
        throw new Error('Wymagana autentykacja')
    }

    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, 'sekret')

    return decoded.userId

}
export {getUserId as default}