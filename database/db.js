const mongoose = require("mongoose") ;


const { Schema } = mongoose;
const ObjectId = mongoose.Types.ObjectId ;

const userSchema = new Schema({
    email : {type : String, required: true, unique: true} ,
    password : {type : String,  required: true},
    firstName: {type: String, required: true},
    lastName : {type: String, required: false}
});

const adminSchema = new Schema({
    email : {type : String,  required: true, unique : true} ,
    password : {type : String,  required: true},
    firstName: {type: String, required: true},
    lastName : {type: String, required: false}
});

const courseSchema = new Schema({
    title :  {type : String , required: true},
    description : {type : String} , 
    price : {type : Number} ,
    creatorId : {type : ObjectId}
});

const purchaseSchema = new Schema({
    courseId : {type : ObjectId},
    userId : {type : ObjectId}
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);


module.exports = { 
    userModel ,
    adminModel ,
    courseModel , 
    purchaseModel 
}
