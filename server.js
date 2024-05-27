const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const stripe = require("stripe")(
  "sk_test_51OsUBIDflVYbhFY6omWgn8NOBTX5kB5lqmuP4h1N0QUME7BD4YHMNOjco9GE0E8LCeWoAnZcx2WbfpFvT5eaEXj60008PYCfol"
);

const app = express();
const endpointSecret = "whsec_kvAsWs6u3Pwn2RQ2Z5e4ui0BdOxsFYqU"

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    //Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // console.log(paymentIntentSucceeded);
        const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
        order.paymentStatus = 'received';
        await order.save();
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
const PORT = 3005;

//data connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ECommerceCopy")
  .then(() => {
    console.log("Database is connected");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database is not connected", error);
  });

app.use(cors());
app.use(bodyParser.json());

//create model for signUp
const User = mongoose.model("User", {
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  bio:String,
  addresses: { type: [Schema.Types.Mixed] },
});
//create model
// const Product = mongoose.model("Product", {
//   productName: String,
//   productDescription: String,
//   productPrice: String,
//   productCategory: String,
//   productImage: String,
// });

const Product = mongoose.model("Product", {
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  discountPercentage: {
    type: Number,
  },
  rating: {
    type: Number,
  },
  stock: {
    type: Number,
  },
  brand: {
    type: String,
  },
  category: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  images: {
    type: [String], // Array of strings representing image URLs
    default: [], // Default is an empty array
  },
  colors: { type: [Schema.Types.Mixed] },
  sizes: { type: [Schema.Types.Mixed] },
  highlights: { type: [String],default: [], },
  deleted: { type: Boolean, default: false },
});

const CartItem = mongoose.model("CartItem", {
  // products: {
  //   title: {
  //     type: String,
  //   },
  //   description: {
  //     type: String,
  //   },
  //   price: {
  //     type: Number,
  //   },
  //   discountPercentage: {
  //     type: Number,
  //   },
  //   rating: {
  //     type: Number,
  //   },
  //   stock: {
  //     type: Number,
  //   },
  //   brand: {
  //     type: String,
  //   },
  //   category: {
  //     type: String,
  //   },
  //   thumbnail: {
  //     type: String,
  //   },
  //   images: {
  //     type: [String], // Array of strings representing image URLs
  //     default: [], // Default is an empty array
  //   },
  // },
  userId: String,
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: Number,
});

// Orders model
const Order = mongoose.model("Order", {
  items: { type: [Schema.Types.Mixed] },
  totalAmount: { type: Number },
  totalItems: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  paymentMethod: { type: String, required: true },
  // paymentStatus: { type: String, default: "pending" },
  status: { type: String, default: "pending" },
  selectedAddress: { type: Schema.Types.Mixed, required: true },
});

// middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  // console.log('Authorization',token)
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access is Denied No token provided." });
  }

  const tokenValue = token.split(" ")[1]; // Split the token properly
  // console.log('Authorization',tokenValue)
  jwt.verify(tokenValue, "your_secret_key", (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = decodedToken;
    next();
  });
};

// remove tailwind css get css
// className={userOrdersStyle.}

app.post("/Signup", async (req, res) => {
  const { name, email, password, bio } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User Already Registered");
      // res.json({ message: "User Already Registered" });
      return res.status(409).json({ message: "User Already Registered" });
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({ name, email, bio, password: hashedPassword });
      await newUser.save();

      // Generate JWT Token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        "your_secret_key",
        { expiresIn: "30d" }
      );
      res.json({
        token,
        newUser: newUser._id,
        role: newUser.role,
        message: "Signup successfully",
      });
    }
  } catch (error) {
    console.error("Error during signup", error);
    res.status(500).json({ message: "Error during Post data on signup" });
  }
});

// Login api
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credential " });
    } else {
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Generate JWT Token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        "your_secret_key",
        { expiresIn: "30d" }
      );
      res.status(200).json({ id: user._id, role: user.role, token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ Message: "Error during Post data on login" });
  }
});

app.get("/auth/check", authenticateToken, async (req, res) => {
  // // // try{
  //  const userId = req.user.userId;
  //   const userEmail = req.user.email;
  //   res.json({ Message: "This is a Protected Route", userId, userEmail });

  const user = req.user;
  // console.log('authTokenDATA',authenticateToken.authToken)
  // const user = await User.findById(req.user.userId);
  if (user) {
    console.log(user)
    res.json(user);
  } else {
    res.sendStatus(401);
  }
});

// fetch user
app.get("/users/own", authenticateToken, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    res
      .status(200)
      .json({
        id: user.id,
        name: user.name,
        addresses: user.addresses,
        email: user.email,
        role: user.role,
      });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update User API
app.post("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const addresses = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, addresses, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});


app.post("/products", async (req, res) => {
  const product = req.body;
  console.log(product.title);
  
  try {
    const productData = await Product.findOne({ title: product.title });
    if (productData) {
      return res.status(409).json({ message: "Product Already Exists" });
    }

    const newProduct = new Product(product);
    await newProduct.save();
    return res.status(201).json({ message: "Product Saved Successfully" });

  } catch (error) {
    console.error("Error during Product operation:", error);
    return res.status(500).json({ message: "Error during Post data on Product" });
  }
});


app.post("/api/products", async (req, res) => {
  const {
    productName,
    productDescription,
    productPrice,
    productCategory,
    productImage,
  } = req.body;
  // Here, you can add logic to save the product to a database
  try {
    const productData = await Product.findOne({ productName });
    if (productData) {
      res.json({ message: "Product Already Exist" });
    } else {
      const newProduct = new Product({
        productName,
        productDescription,
        productPrice,
        productCategory,
        productImage,
      });
      await newProduct.save();
      res.json({ message: "Product Save Successfully" });
    }
  } catch (error) {
    console.error("Error during Product", error);
    res.status(500).json({ message: "Error during Post data on Product" });
  }

  res.status(201).json({ message: "Product added successfully" });
});

// Product get api
app.get("/product", async (req, res) => {
  try {
    const product = await Product.find();
    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Product not found" });
  }
});

// Product get with id Product Details api
// Endpoint to get a specific product by ID
app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  try {
    const product = await Product.find({ _id: id });
    // console.log(product)
    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Product not found" });
  }
});


// update Product
// app.patch('/products/:id', (req, res) => {
//   const productIndex = products.findIndex(p => p.id === req.params.id);
//   if (productIndex === -1) {
//     return res.status(404).json({ message: 'Product not found' });
//   }

//   const updatedProduct = { ...products[productIndex], ...req.body };
//   products[productIndex] = updatedProduct;
//   res.json(updatedProduct);
// });

app.patch('/products/:id',async (req, res) => {
   const id = req.params.id;
  // console.log(id);
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to add a product to the cart
app.post("/api/cart/add", async (req, res) => {
  const { product, userId, quantity } = req.body;
  try {
    // const existingCartItem = CartItem.find(
    //   (item) => item.userId === userId && item.product === product
    // );
    // if(existingCartItem){
    //   existingCartItem.quantity += quantity;
    // res.status(200).json({ message: 'Product quantity updated in the cart', cart });
    // }else{
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
});

// cart get api
// app.get("/api/cart", async (req, res) => {
//   try {
//     const cartItems = await CartItem.find();
//     // console.log('cartItemsCart',cartItems.product)
//     // res.status(200).json(cartItems);
//   } catch (error) {
//     console.error("Error fetching cart items:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// cart get by id api
app.get("/api/cart/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const cartItems = await CartItem.find({ userId: id }).populate("product");
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update cart
app.patch('/cart/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
    // const result = await cart.populate("product");
    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quantity', error });
  }
});

// Update Profile Route
app.patch('/api/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  try {
    const updatedProfile = await User.findByIdAndUpdate(id, { name, email, bio }, { new: true });
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).send({message: 'Error updating quantity',error});
  }
});


// Route to remove an item from the cart
app.delete("/api/cart/:id", async (req, res) => {
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
});

// order api*************************
app.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const doc = await newOrder.save();
    res.status(201).json(doc);
    // res.status(201).json({message:"order"});
  } catch (error) {
    console.log("Internal Server Error backend");
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const id = req.params.id;
  // console.log("iddd",id);
  try {
    const orders = await Order.find({user:id});
    // const doc = await newOrder.save();
    res.status(200).json(orders);
    // res.status(201).json({message:"order"});
  } catch (error) {
    console.log("Internal Server Error backend");
    res.status(400).json({ message: "Internal Server Error", error });
  }
});

// Protected route
app.get("/protected-route", authenticateToken, (req, res) => {
  // Access user information from req.user
  const userId = req.user.userId;
  const userEmail = req.user.email;

  res.json({ Message: "This is a Protected Route", userId, userEmail });
});

app.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Define the minimum amount allowed for your currency (e.g., 50 cents for USD)
  const minimumAmount = 50; // in cents
  const currency = "inr"; // define your currency

  if (totalAmount < minimumAmount / 100) {
    return res.status(400).json({ message: `Amount must be at least ${minimumAmount / 100} ${currency}.` });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


