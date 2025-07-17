const { Product } = require("../model/Product");

exports.createProduct =  async (req, res) => {
    const product = req.body;
  
    try {
      const newProduct = await Product.findOne({ title: product.title });
      if (newProduct) {
        return res.status(409).json({ message: "Product Already Exists" });
      }
  
      const newProducts = new Product(product);
      newProducts.discountPrice = Math.round(
        product.price * (1 - product.discountPercentage / 100)
      );
      await newProducts.save();
      return res.status(201).json({ message: "Product Saved Successfully" });
    } catch (error) {
      console.error("Error during Product operation:", error);
      return res
        .status(500)
        .json({ message: "Error during Post data on Product" });
    }
  };

exports.fetchAllProducts =  async (req, res) => {
    try {
      // Build the query object based on the filters
      const condition = {};
        if(!req.query.admin){
      condition.deleted={$ne:true}
    }
      if (req.query.selectedCategories) {
        const categories = req.query.selectedCategories.split(',');
        condition.category = { $in: categories };
      }
  
      if (req.query.selectedBrands) {
        const brands = req.query.selectedBrands.split(',');
        condition.brand = { $in: brands };
      }
  
      if (req.query.minPrice) {
        condition.price = { ...condition.price, $gte: parseFloat(req.query.minPrice) };
      }
  
      if (req.query.maxPrice) {
        condition.price = { ...condition.price, $lte: parseFloat(req.query.maxPrice) };
      }
  
      // Fetch the products with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const totalDocs = await Product.countDocuments(condition).exec();
      const products = await Product.find(condition)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
  
      res.set("X-Total-Count", totalDocs);
      res.json({ product: products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching products", error });
    }
  }

  exports.fetchProductById =  async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.find({ _id: id });
      res.json({ product });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: "Product not found" });
    }
  }

  exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      // Find and update the product
      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });
  
      // Check if the product exists
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Calculate the discount price
      product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
  
      // Save the updated product with the new discount price
      const updatedProduct = await product.save();
  
      // Respond with the updated product
      res.status(200).json(updatedProduct);
  
    } catch (error) {
      // Log the error and respond with a server error status and message
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  