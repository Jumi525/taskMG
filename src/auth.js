const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // For password reset emails
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your-secret-key"; // Replace with a secure key
const PORT = 5000;

mongoose.connect("mongodb://localhost:27017/tasksDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// User Registration
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Email or username already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Password Reset Request
// app.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const resetToken = jwt.sign({ id: user._id }, SECRET_KEY, {
//       expiresIn: "15m",
//     });
//     user.resetToken = resetToken;
//     await user.save();

//     // Send email (example with Nodemailer)
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: "your-email@gmail.com", // Replace with your email
//         pass: "your-email-password", // Replace with your email password
//       },
//     });

//     const mailOptions = {
//       from: "your-email@gmail.com",
//       to: user.email,
//       subject: "Password Reset",
//       text: `Click this link to reset your password: http://localhost:3000/reset-password/${resetToken}`,
//     };

//     await transporter.sendMail(mailOptions);
//     res.json({ message: "Password reset email sent" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Reset Password
// app.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
//     const decoded = jwt.verify(token, SECRET_KEY);
//     const user = await User.findById(decoded.id);

//     if (!user || user.resetToken !== token) {
//       return res.status(400).json({ error: "Invalid or expired token" });
//     }

//     user.password = await bcrypt.hash(password, 10);
//     user.resetToken = null; // Clear the reset token
//     await user.save();

//     res.json({ message: "Password reset successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Middleware for Authentication

// const token = localStorage.getItem("authToken");
// fetch("http://localhost:5000/profile", {
//   headers: {
//     Authorization: `Bearer ${token}`,
//   },
// })
//   .then((res) => res.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.error(err));

// const authenticate = (req, res, next) => {
//   //   const token = req.headers.authorization?.split(" ")[1];
// //   const token = localStorage.getItem("authToken");
//   console.log(token, "tokenss");
//   if (!token)
//     return res.status(401).json({ error: "Access denied. No token provided." });

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(400).json({ error: "Invalid token" });
//   }
// };

// // Example Authenticated Route
// app.get("/profile", authenticate, (req, res) => {
//   res.json({ message: `Welcome, ${req.user.username}` });
// });

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
