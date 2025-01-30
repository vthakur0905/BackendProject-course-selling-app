const { Router } = require("express");
const adminRouters = Router();
const { adminModel, courseModel } = require("../database/db");
const {
  adminSignupValidation,
  adminSigninValidation,
} = require("../validations/adminValidation");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const bcrypt = require("bcrypt");
const { adminMiddleware } = require("../middlware/adminMiddleware");
const { courseDataValidation } = require("../validations/courseValidation");
const { authmiddleware } = require("../middlware/authmiddleware");

adminRouters.post("/signup", async function (req, res) {
  try {
    console.log("validation started");
    const validdatedData = adminSignupValidation.parse(req.body);

    console.log("validation passed");
    const { firstName, lastName, email, password } = validdatedData;

    //check the email is unique
    const existingAdmin = await adminModel.findOne({ email });

    if (existingAdmin) {
      console.log("email is already signed up");
      return res
        .status(400)
        .json({ message: "already signed up. please sign in" });
    }

    async function hashPassword(password) {
      try {
        const hash = await bcrypt.hash(password, 10);
        console.log(`hashed password ${hash}`);
        return hash;
      } catch (err) {
        console.log(`error while hashing password ${err}`);
        throw new Error("error while hashing password");
      }
    }

    try {
      const hashedPassword = await hashPassword(password);

      await adminModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });
    } catch (err) {
      console.log(err.message);
      return res.status(400).json({
        message: "internal server err",
      });
    }

    res.status(201).json({
      message: "admin signup successfully",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((e) => e.message).join(",");
      console.log("validationsErrors : " + errors);
      return res.status(400).json({ message: "Validation error", errors });
    }
    console.log(err.message);
    res.status(500).json({ message: "internal server error" });
  }
});

adminRouters.post("/signin", authmiddleware, async function (req, res) {
  
  try {
    const validatedData = adminSigninValidation.parse(req.body);
    const { email, password } = validatedData;
    console.log(`password is ${password}`);

    // Find admin by email
    const checkAdmin = await adminModel.findOne({
      email: email,
    });

    // Check if admin exists
    if (!checkAdmin) {
      console.log("No admin found");
      return res.status(400).json({
        message: "No account found, please sign up",
      });
    }

    const hashPassword = checkAdmin.password;
    console.log(hashPassword);

    // Compare the plaintext password with the hashed password using callback
    bcrypt.compare(password, hashPassword, function (err, result) {
      if (err) {
        console.log("Error during password comparison:", err);
        return res.status(500).json({
          message: "Internal server error during password matching",
        });
      }

      if (result) {
        console.log("Password is matched");

        const token = jwt.sign(
          {
            id: checkAdmin._id,
          },
          JWT_ADMIN_PASSWORD
        );

        // Return success response
        return res.status(200).json({
          message: "Sign in successful",
          admin: {
            id: checkAdmin._id,
            email: checkAdmin.email,
            name: checkAdmin.firstName,
            lastName: checkAdmin.lastName,
          },
          token: token,
        });
      } else {
        console.log("Password not matched");
        return res.status(401).json({
          message: "Unauthorized access",
        });
      }
    });
  } catch (err) {
    console.log(err.message + " start");
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

adminRouters.post("/course", adminMiddleware, async function (req, res) {
  const adminId = req.userId;

  try {
    const validatedData = courseDataValidation.parse(req.body);

    const { title, description, price } = validatedData;

    try {
      const course = await courseModel.create({
        title: title,
        description: description,
        price: price,
        creatorId: adminId,
      });

      res.status(200).json({
        message: "course created successfully",
        courseId: course._id,
      });
    } catch (err) {
      console.log("error in course creation");
      res.status(403).json({
        message: "some error in backend in course creation",
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(`error in validation ${err.message}`);
      res.status(403).json({
        message: "error in validation",
      });
    }

    console.log("internal error");
    res.status(400).json({
      message: "some other error",
    });
  }
});

adminRouters.put("/course/:id", adminMiddleware, async function (req, res) {
  const courseId = req.params.id;
  const { title, description, price } = req.body;

  try {
    const updateDetails = await courseModel.findByIdAndUpdate(
      courseId,
      {
        title,
        description,
        price,
      },
      {
        new: true,
      }
    );

    if (!updateDetails) {
      return res.status(400).json({
        message: "course details not found",
      });
    }

    res.status(200).json({
      message: "course updated successfully",
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      message: "some error is there",
    });
  }
});

adminRouters.get("/course/all/:id", async function (req, res) {
  const adminId = req.params.id;

  try {
    const courses = await courseModel.find(
      {
        creatorId: adminId,
      },
      {
        title: 1,
        description: 1,
        price: 1,
      }
    );

    res.status(200).json({
      courses: courses,
      message: "fetched all the courses",
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      message: "err in fetching the courses",
    });
  }
});

module.exports = {
  adminRouters: adminRouters,
};
