const { Category } = require("../model/Category");

exports.fetchCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  }

  exports.createCategory = async (req, res) => {
    const { category } = req.body;
  
    try {
      let existingCategory = await Category.findOne({ category });
      if (existingCategory) {
        return res.status(409).json({ message: "Category already exists" });
      }
  
      const newCategory = new Category({ category });
      await newCategory.save();
      res.status(201).json({ message: "Category saved successfully", newCategory });
    } catch (error) {
      console.error("Error during category creation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }