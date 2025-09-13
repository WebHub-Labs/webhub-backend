import express from "express";
import userRegisterModel from "../models/user.registerModel";
import jwt from "jsonwebtoken";
import config from "../config";
import { validate, userLoginSchema } from "../validation/schemas";
import { asyncHandler, AppError } from "../utils/errorHandler";

const loginRouter = express.Router();

loginRouter.post("/", validate(userLoginSchema), asyncHandler(async (req, res) => {
  const { user_email, user_password } = req.body;

  // Find user by email
  const user = await userRegisterModel.findOne({ email: user_email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(user_password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = user.toObject();

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: userWithoutPassword,
      token
    }
  });
}));

export default loginRouter;
