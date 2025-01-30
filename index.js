
const express = require ('express') ;
const mongoose = require ('mongoose') ;
const { userRouter} = require("./routes/userRoutes")
const {courseRouter} = require("./routes/coursesRoutes");
const {  adminRouters } = require('./routes/adminRoutes');
const {authmiddleware} = require('./middlware/authmiddleware')


const app = express() ;
const port = 3000 ;

app.use(express.json()) ;

app.use("/courses", courseRouter) ;


app.use("/user", userRouter); 


app.use("/admin", adminRouters) ;

async function startserver(){
    try {
        await mongoose.connect("mongodb+srv://sample:123@cluster0.r2tts.mongodb.net/courseSelling");

        console.log("connected to db");
        app.listen(port, () => {
            console.log(`app is running on ${port}`);
        }) ;
    }

    catch(error) {
        console.error(`failed to connect - ${error.message}`)
    }
}



startserver() ;

