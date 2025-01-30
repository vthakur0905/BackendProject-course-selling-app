const { z } = require('zod');


const userSignupValidation = z.object({
    firstName : z.string().min(1, "first name cant be empty") , 
    lastName  : z.string().optional(),
    email : z.string().email("invalid email"),
    password : z.string().min(3, "password should be 3 char long")
})


const userSigninValidation = z.object({
    email : z.string().email() , 
    password : z.string()
})


module.exports = { 
    userSignupValidation : userSignupValidation,
    userSigninValidation : userSigninValidation
}