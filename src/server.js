const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://localhost:27017/tasksDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Define Task Schema
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true },
  select: { type: String, required: true },
  textarea: { type: String, required: true },
  completed: { type: Boolean, required: true },
});

// db.tasks.insertOne({ text: "Test Task", completed: false });

// Create Task Model
const Task = mongoose.model("Task", taskSchema);

// API Endpoints

// Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Add a Task
app.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);

    await task.save();
    res.json({ message: "Task added successfully!", task });
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Update a Task
app.put("/tasks/:id", async (req, res) => {
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

async function updateCourse(id, task) {
  const course = await Course.findById(id);
  if (!course) return;
  course.set({
    ...task,
  });
  const result = await course.save();
}

// Delete a Task
app.delete("/tasks/:id", async (req, res) => {
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

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mongoose = require("mongoose");

// mongoose
//   .connect("mongodb://localhost:27017/taskManager")
//   .then(() => console.log("connected to MongoBD..."))
//   .catch((err) => console.error("Could not connect to mongoDB....", err));

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const taskSchema = new mongoose.Schema({
//   text: String,
//   date: String,
//   select: String,
//   textarea: String,
// });

// const Course = mongoose.model("course", taskSchema);

// let tasks = [];
// let taskId = 1; // Start with an ID

// // Get All Tasks

// app.get("/tasks", async (req, res) => {
//   const tasks = await Course.find();
//   res.json(tasks);
// });

// // Add a Task

// async function createCourse(courses) {
//   const course = new Course({
//     text: courses.text,
//     date: courses.date,
//     select: courses.select,
//     textarea: courses.textarea,
//   });

//   const result = await course.save();
//   console.log(result);
// }

// app.post("/tasks", async (req, res) => {
//   // const task = { ...req.body, id: taskId++ }; // Add unique ID
//   const task = res.body;
//   const course = new Course({
//     text: task.text,
//     date: task.date,
//     select: task.select,
//     textarea: task.textarea,
//   });
//   const result = await course.save();
//   tasks.push(result);
//   // tasks.push(task);
//   res.json({ message: "Task added successfully!", result });
// });

// // Update a Task

// async function updateCourse(id, task) {
//   const course = await Course.findById(id);
//   if (!course) return;
//   course.set({
//     ...task,
//   });
//   const result = await course.save();
// }

// app.put("/tasks/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const task = req.body;
//   updateCourse(id, task);
//   const index = tasks.findIndex((task) => task.id === id);
//   if (index !== -1) {
//     tasks[index] = { ...tasks[index], ...req.body };
//     res.json({ message: "Task updated successfully!", tasks });
//   } else {
//     res.status(404).json({ message: "Task not found!" });
//   }
// });

// // Delete a Task

// async function deleteCourse(id) {
//   //   const result = await Course.deleteOne({ _id: id });
//   const result = await Course.findByIdAndRemove(id);
//   console.log(result);
// }

// app.delete("/tasks/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   deleteCourse(id);
//   tasks = tasks.filter((task) => task.id !== id);
//   res.json({ message: "Task deleted successfully!", tasks });
// });

// // Start Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
