const { z } = require('zod');



const adminSignupValidation = z.object({
    firstName : z.string().min(1, "first Name is req") ,
    lastName: z.string().optional(),
    email: z.string().email('invalid email'),
    password: z.string().min(3, "password must be 3 character long")
})


const adminSigninValidation = z.object({
    email : z.string().email(),
    password : z.string().min(3, "length should be more")
})



module.exports = {
    adminSignupValidation : adminSignupValidation,
    adminSigninValidation : adminSigninValidation
}
