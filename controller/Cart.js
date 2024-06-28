const { CartItem } = require("../model/Cart");


exports.fetchCartByUser = async (req, res) => {
    const id = req.params.id;
  
    try {
      const cartItems = await CartItem.find({ userId: id }).populate("product");
      res.status(200).json(cartItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  exports.addToCart = async (req, res) => {
    const { product, userId, quantity } = req.body;
    try {
      const cartItem = new CartItem({
        product,
        userId,
        quantity,
      });
      const result = await cartItem.save();
      res.status(201).json({ message: "Product added to the cart", result });
      // }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        console.error("Validation Error:", error.errors);
        res
          .status(400)
          .json({ error: "Validation Error", details: error.errors });
      } else {
        console.error("Error adding product to the cart:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  exports.updateCart =  async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
  
    try {
      const cartItem = await CartItem.findByIdAndUpdate(
        id,
        { quantity },
        { new: true }
      );
      // const result = await cart.populate("product");
      res.status(200).json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating quantity", error });
    }
  }

  exports.deleteCart = async (req, res) => {
    const itemId = req.params.id;
  
    try {
      // Find the cart item by its ID and remove it
      const removedItem = await CartItem.findOneAndDelete({ _id: itemId });
  
      if (removedItem) {
        res.status(200).json({ message: "Item removed from cart successfully" });
      } else {
        res.status(404).json({ message: "Item not found in the cart" });
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  exports.clearCartItem = async (req, res) => {
    const { id } = req.params;
    // console.log(id)
    try {
      const clearCart = await CartItem.deleteMany({ userId: id });
      // const userId = req.body.userId; // Ensure you have the user ID to identify the user's cart
  
      // await Cart.deleteMany({ userId });
      if (clearCart) {
        res.status(200).json({ message: "Cart cleared successfully" });
      } else {
        res.status(404).json({ message: "Item not found in the cart" });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }