const Product = require("../models/seller");

const sellerController = {
  // Add a product
  addProduct: async (req, res) => {
    try {
      const { name, description, price, image } = req.body;
      const userId = req.userId; // Get the user ID from the middleware (auth)

      const newProduct = new Product({
        name,
        description,
        price,
        image,
        seller: userId, // Attach seller's ID
      });

      await newProduct.save();
      res.status(201).json({
        message: "Product added successfully",
        product: newProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add product",
        error: error.message,
      });
    }
  },

  // Get seller dashboard (list products by seller ID)
  Dashboard: async (req, res) => {
   
    try {
      const userId = req.userId; // Get the user ID from the middleware (auth)
      const products = await Product.find({ seller: userId });

      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  },

  // Update product by ID
  updateProduct: async (req, res) => {
    
    try {
      const { name, description, price, image } = req.body;
      const userId = req.userId; // Get the user ID from the middleware (auth)
     
      const product = await Product.findOne({ name });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.name = name;
      product.description = description;
      product.price = price;
      product.image = image;

      await product.save();
      res.status(200).json({
        message: "Product updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update product",
        error: error.message,
      });
    }
  },
};

module.exports = sellerController;
