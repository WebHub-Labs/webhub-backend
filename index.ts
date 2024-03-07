require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const register = require("./routes/register");
const registerShop = require("./routes/registerShop");
const loginRouter = require("./routes/login");
const productRouter = require("./routes/products");
const postsRouter = require("./routes/posts");

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
app.use("/products", productRouter);
app.use("/posts", postsRouter);

app.use((err, req, res, next) => {
  if (err.message === "Unauthorized Request") {
    return res.status(500).json("Unauthorized");
  } else if (err.message === "Posting is only allowed after 5 am.") {
    res.status(403).json({ error: "Posting is only allowed after 5 am." });
  }
});
app.listen(process.env.PORT, () => {
  console.log(`app is running in port ${process.env.PORT}`);
});
