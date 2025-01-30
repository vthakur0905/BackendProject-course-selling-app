const { z } = require("zod") ;

console.log("in validation file");

const courseDataValidation = z.object({
    title : z.string().min(1, "please enter title"),
    description : z.string().min(1, "please enter description"),
    price : z.number().nonnegative()
}) 


module.exports = {
    courseDataValidation : courseDataValidation
}