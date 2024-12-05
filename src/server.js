const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let tasks = [];
let taskId = 1; // Start with an ID

// Get All Tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Add a Task
app.post("/tasks", (req, res) => {
  const task = { ...req.body, id: taskId++ }; // Add unique ID
  tasks.push(task);
  res.json({ message: "Task added successfully!", task });
});

// Update a Task
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...req.body };
    res.json({ message: "Task updated successfully!", tasks });
  } else {
    res.status(404).json({ message: "Task not found!" });
  }
});

// Delete a Task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter((task) => task.id !== id);
  res.json({ message: "Task deleted successfully!", tasks });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
