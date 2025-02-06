const Product = require("../models/Products");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Uploads folder
const PlacedOrder = require("../models/sellerOrederView");
const sellerController = {
  // Add a product
  addProduct: async (req, res) => {
    try {
      const { name, description, price, image } = req.body;
      const userId = req.userId; // Get user ID from middleware

      // Validate required fields
      if (!name || !description || !price || !image) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Ensure the image is a valid Base64 string
      if (!image.startsWith("data:image")) {
        return res.status(400).json({ message: "Invalid image format" });
      }

      // Create new product
      const newProduct = new Product({
        name,
        description,
        price,
        image, // Store the Base64 string directly
        seller: userId, // Attach seller's ID
      });

      // Save product to database
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
  search: async (req, res) => {
    try {
      // Extract query parameters
      const { name, minPrice, maxPrice, category } = req.query;

      // Create a dynamic filter object
      const filter = {};

      // Add conditions to the filter dynamically
      if (name) {
        filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
      }
      if (minPrice) {
        filter.price = { ...filter.price, $gte: parseFloat(minPrice) }; // Minimum price
      }
      if (maxPrice) {
        filter.price = { ...filter.price, $lte: parseFloat(maxPrice) }; // Maximum price
      }
      if (category) {
        filter.category = category; // Exact match for category
      }

      // Query the database with the filter
      const products = await Product.find(filter);

      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  },

  // Delete product by ID
  deleteProduct: async (req, res) => {
    try {
      const userId = req.userId; // Get the user ID from the middleware (auth)
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const product = await Product.findOneAndDelete({
        _id: productId,
        seller: userId,
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: "Product not found or not authorized" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete product",
        error: error.message,
      });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { name, description, price, image } = req.body;
      const userId = req.userId; // Get the user ID from the middleware (auth)
      console.log(userId);
      const product = await Product.findOne({ name, seller: userId });

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

  placedOrders: async (req, res) => {
    try {
      const sellerId = req.params.sellerId;

      // Find products belonging to the seller
      const sellerProducts = await Product.find({ sellerId });

      // Extract product IDs
      const productIds = sellerProducts.map((product) => product._id);

      // Find orders that contain any of the seller's products
      const orders = await orders.find({
        "products.productId": { $in: productIds },
      });

      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },
};
module.exports = sellerController;
