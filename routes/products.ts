import express from "express"
import Product from "../models/productModel"
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const { id } = req.params.id;
    if (id == null) {
      throw new Error("Invlaid params");
    } else if (id != null && id != undefined) {
      const product = await Product.findById(id);
      console.log(product);
      console.log("end");
      res.status(200).json(product);
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  let { category } = req.query;
  if (category == "women") category = "Women";
  console.log(category);
  try {
    let products;
    if (category) {
      products = await Product.find({ category: category });
    } else {
      products = await Product.find();
    }
    console.log("products", products);
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
