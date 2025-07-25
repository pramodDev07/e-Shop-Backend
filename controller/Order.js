const { Order } = require("../model/Order");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const { invoiceTemplate, sendMail } = require("../services/common");


exports.fetchAllOrders = async (req, res) => {
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  }

  exports.createOrder = async (req, res) => {
    const order = new Order(req.body);

    for(let item of order.items){
      const product = await Product.findOne({_id: item.product._id})
      product.$inc('stock', -1*item.quantity)
      await product.save();
    }

    try {
      const doc = await order.save();
      const user = await User.findById(order.user);
       // Await the sendMail function and handle errors
       try {
        await sendMail({
          to: user.email,
          html: invoiceTemplate(order),
          subject: 'Order Received'
        });
      } catch (mailError) {
        console.error('Error sending email:', mailError);
        // Optionally, you can choose to handle this case differently
      }
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
      const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
        new: true,
      });
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  exports.fetchOrderByUser = async (req, res) => {
    const id = req.params.id;
    try {
      const orders = await Order.find({ user: id });
      res.status(200).json(orders);
    } catch (error) {
      console.log("Internal Server Error backend");
      res.status(400).json({ message: "Internal Server Error", error });
    }
  }

  exports.fetchSuccessOrders =  async (req, res) => {
    const id = req.params.id;
    try {
      const orders = await Order.find({ _id: id });
      res.status(200).json(orders);
    } catch (error) {
      console.log("Internal Server Error backend");
      res.status(400).json({ message: "Internal Server Error", error });
    }
  }