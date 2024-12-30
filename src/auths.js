const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your-secret-key"; // Replace with a secure key

mongoose.connect("mongodb://localhost:27017/UserTask", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
});

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true },
  select: { type: String, required: true },
  textarea: { type: String, required: true },
  completed: { type: Boolean, required: true },
});

const Task = mongoose.model("Task", taskSchema);

// User Registration
app.post("/api/auth/signup", async (req, res) => {
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
app.post("/api/auth/login", async (req, res) => {
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

// Get All Tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const task = await Task.find();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Add a Task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);

    await task.save();
    res.json({ message: "Task added successfully!", task });
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Update a Task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task updated successfully!", updatedTask });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a Task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id, "ids");
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully!", deletedTask });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.listen(5000, () =>
  console.log(`Server running on ${"https://task-manager-8.netlify.app"}`)
);
