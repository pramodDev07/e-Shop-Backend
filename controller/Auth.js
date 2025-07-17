require("dotenv").config();
const { User } = require("../model/User");
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { sendMail } = require("../services/common");

exports.createUser = async (req, res) => {
    const { name, email, password, gender } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User Already Registered");
        return res.status(409).json({ message: "User Already Registered" });
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create new user
        const newUser = new User({ name, email, gender, password: hashedPassword });
        await newUser.save();
  
        // Generate JWT Token
        const token = jwt.sign(
          { userId: newUser._id, email: newUser.email },
          process.env.JWT_SECRET_KEY,
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
  }

exports.loginUser =  async (req, res) => {
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
          process.env.JWT_SECRET_KEY,
          { expiresIn: "30d" }
        );
        res.status(200).json({ id: user._id, role: user.role, token });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ Message: "Error during Post data on login" });
    }
  }

  exports.checkAuth =  async (req, res) => {
    const user = req.user;
    if (user) {
      res.json(user);
    } else {
      res.sendStatus(401);
    }
  }

  exports.resetPasswordRequest = async(req,res)=>{
    const { email } = req.body;
    try {
      const user = await User.findOne({email})
      if (!user) {
        return res.status(400).send('User with this email does not exist.');
      }
  
      // Generate reset token and expiration time
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour
  
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();
  
      // Also set token in email
      const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
      const subject = "reset password for e-commerce";
      const html = `<p>Click <a href='${resetURL}'>here</a> to Reset Password</p>`;
  
      // lets send email and a token in the mail body so we can verify that user has checked right link
      if (email) {
        const response = await sendMail({ to: email, subject, html });
        res.json(response);
      } else {
        res.sendStatus(400);
      }
      // res.send('Password reset link sent to your email.');
    } catch (error) {
      res.status(500).send('Something went wrong.');
    }
  
  }

  exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).send('Invalid or expired token.');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
  
      res.send('Password has been reset.');
    } catch (error) {
      res.status(500).send('Something went wrong.');
    }
  }