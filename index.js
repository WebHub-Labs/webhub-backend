const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const register = require("./routes/register");
const registerShop = require("./routes/registerShop");
const loginRouter = require("./routes/login");
const productRouter = require("./routes/products");

app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.db)
  .then(() => {
    console.log("successfully connected");

  })
  .catch((err) => {
    console.log(`error ${err}`);
  });

app.get("/", (req, res) => {
  res.send("app is running");
});

app.use("/login", loginRouter);
app.use("/register", register);
app.use("/register/shop", registerShop);
app.use('/products',productRouter)

app.listen(process.env.PORT, () => {
  console.log(`app is running in port ${process.env.PORT}`);
});
