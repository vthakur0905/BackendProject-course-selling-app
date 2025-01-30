const { Router } = require("express");

const userRouter = Router();
const bcrypt = require("bcrypt");
const { userModel, courseModel, purchaseModel } = require("../database/db");
const { z } = require("zod");
const {
  userSignupValidation,
  userSigninValidation,
} = require("../validations/userValidation");
const jwt = require("jsonwebtoken");
// const JWT_USER_PASSWORD = "userSignIn";
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middlware/userMiddleware");

userRouter.post("/signup", async (req, res) => {
  try {
    const validatedData = userSignupValidation.parse(req.body);

    const { firstName, lastName, email, password } = validatedData;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      console.log("email found");
      return res.status(401).json({
        message: "already account created, please sign up",
      });
    }

    async function hashPassword(password) {
      try {
        const hash = await bcrypt.hash(password, 10);
        console.log(`hashed password is ${hash}`);
        return hash;
      } catch (err) {
        console.log(`error while hashing ${err.message}`);
        throw new Error("internal error while hashing");
      }
    }

    const hashedPassword = await hashPassword(password);

    try {
      await userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });

      return res.status(200).json({
        message: "user signed up successfully",
      });
    } catch (err) {
      console.log(`error while creating user ${err.message}`);
      return res.status(401).json({
        message: "cant create a user, try again",
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((e) => e.message).join(",");
      console.log("validationsErrors : " + errors);
      return res.status(400).json({ message: "Validation error", errors });
    }

    console.log(`error in signup ${err.message}`);

    res.status(500).json({
      message: "internal server error",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const validatedData = userSigninValidation.parse(req.body);

    const { email, password } = validatedData;

    const existingEmail = await userModel.findOne({ email });

    if (!existingEmail) {
      console.log("email not found ");
      return res.status(401).json({
        message: "email not found please sign up",
      });
    }

    const hashPassword = existingEmail.password;

    bcrypt.compare(password, hashPassword, function (err, result) {
      if (err) {
        console.log("error while password hashing ");
        return res.status(500).json({
          message: "error while hashing",
        });
      }

      if (result) {
        console.log("password is matched");

        const token = jwt.sign(
          {
            id: existingEmail._id,
          },
          JWT_USER_PASSWORD
        );

        return res.status(200).json({
          message: "successfully signed in",
          user: {
            email,
            hashPassword,
          },
          token: token,
        });
      } else {
        console.log("password not matched");
        return res.status(401).json({
          message: "not signed in , wrong password",
        });
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log("error in validation" + err.message);
      return res.status(401).json({
        message: err.message,
      });
    }

    console.log(err.message + "internal error while signing in");
    return res.status(401).json({
      message: "internal error",
    });
  }
});

userRouter.get("/courses/all", async (req, res) => {
  try {
    const courses = await courseModel.find(
      {},
      { title: 1, description: 1, price: 1 }
    );

    if (!courses.length) {
      return res.status(404).json({
        message: "No courses available"
      });
    }

    return res.status(200).json({
      courses,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }

});


userRouter.post("/courses/all/:id",userMiddleware, async (req , res)=> {
  const courseId = req.params.id ;
  const userId = req.userId ;

  
  const courseExist = courseModel.findOne({courseId}) ;
  if (!courseExist){
    res.json(401).json({
      message : "cant fetch course"
    })
  }

  try {
    await purchaseModel.create({
      courseId : courseId ,
      userId : userId 
    })

    res.status(200).json({
      message : "course purchased" 
    })
  }
  catch(err) {
    console.log("err in purchasing the course " + err.message);

    res.status(400).json({
      message : "internal server error in purchase"
    })
  }


})

userRouter.get("/courses/purchased",userMiddleware, async (req, res) => {
  const userId = req.userId ;

  const courses = await purchaseModel.find({userId}) ;

  res.json({
    courses
  })

});

module.exports = {
  userRouter: userRouter
};
