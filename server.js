const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const stripe = require("stripe")("sk_test_51OsUBIDflVYbhFY6omWgn8NOBTX5kB5lqmuP4h1N0QUME7BD4YHMNOjco9GE0E8LCeWoAnZcx2WbfpFvT5eaEXj60008PYCfol");

const app = express();
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
  email: String,
  password: String,
  role: { type: String, required: true, default: "user" },
  token: String,
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
  }
);

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
  product:{type: Schema.Types.ObjectId, ref: 'Product', required:true},
  quantity: Number,
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

app.post("/Signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User Already Registered");
      res.json({ message: "User Already Registered" });
    } else {

       // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

       // Generate JWT Token
       const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        "your_secret_key",
        { expiresIn: "30d",}
      );
      res.json({ token,newUser: newUser._id , role:newUser.role,  message: "Signup successfully" });
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
        { id: user._id, email: user.email, },
        "your_secret_key",
        { expiresIn: "30d",}
      );
      res.status(200).json({id: user._id,role: user.role,token });
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

  const user = req.user
  // console.log('authTokenDATA',authenticateToken.authToken)
  // const user = await User.findById(req.user.userId);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(401);
  };

});

// fetch user
app.get("/users/own",authenticateToken,async(req, res)=>{
  const {id} = req.user;
    try {
        const user = await User.findById(id);
        res.status(200).json({id:user.id, addresses:user.addresses, email:user.email, role:user.role})
    } catch (err) {
        res.status(400).json(err);
    }

})

// Update User API
app.post("/updateUser/:id",async(req, res)=>{
  const {id} = req.params;
  const addresses = req.body
  try {
    const user = await User.findByIdAndUpdate(id,addresses, {new:true});
      res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }

})


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

// Endpoint to add a product to the cart
app.post("/api/cart/add", async (req, res) => {
  const { product, userId, quantity } = req.body;
  try {
    const cartItem = new CartItem({
      product,
      userId,
      quantity,
    });

   const result = await cartItem.save();
    res.status(201).json({ message: "Product added to the cart", result });
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
    const cartItems = await CartItem.find({ userId: id })
    .populate("product");
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to remove an item from the cart
app.delete('/api/cart/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    // Find the cart item by its ID and remove it
    const removedItem = await CartItem.findOneAndDelete({ _id: itemId });


    if (removedItem) { 
      res.status(200).json({ message: 'Item removed from cart successfully' });
    } else {
      res.status(404).json({ message: 'Item not found in the cart' });
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
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
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // Amount in cents,
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
