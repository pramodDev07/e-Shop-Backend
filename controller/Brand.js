const { Brand } = require("../model/Brand");


exports.fetchBrands =  async (req, res) => {
    try {
      const brands = await Brand.find();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brands', error });
    }
  }

  exports.createBrands = async (req, res) => {
    const { brand } = req.body;
  
    try {
      let existingBrand = await Brand.findOne({ brand });
      if (existingBrand) {
        return res.status(409).json({ message: "Brand already exists" });
      }
  
      const newBrand = new Brand({ brand});
      await newBrand.save();
      res.status(201).json({ message: "Brand saved successfully", newBrand });
    } catch (error) {
      console.error("Error during brand creation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }