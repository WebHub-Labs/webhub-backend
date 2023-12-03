const express = require("express");
const userRegisterModel = require("../db/user.registerModel");
const jwt = require("jsonwebtoken");
const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  try {
    console.log(req.body)
    const {  user_email } = req.body;
    if (req.body.user_email && req.body.user_password) {
      const user = await userRegisterModel.findOne({
        email: user_email,
      });
      !user && res.status(400).json("wrong credentials");

      const isPasswordMatched = req.body.user_password === user.password;
      !isPasswordMatched && res.status(400).json("wrong credentials");

      const token = jwt.sign({ id: user._id }, process.env.PWD_SECRET, {
        expiresIn: "3d",
      });

      console.log(user._doc);
      const { password, ...rest } = user._doc;

      res.status(200).json({ ...rest, token });
    } else {
      throw Error("Not valid fields");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
module.exports = loginRouter;
