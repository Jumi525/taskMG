const baseUrl = "http://localhost:5000/tasks"; // Backend API base URL

// DOM Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const editTaskBtn = document.getElementById("editTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
let store = {};

// Task Data
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save Tasks to Local Storage
function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Fetch Tasks from Backend and Sync to Local Storage
async function fetchTasks() {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    tasks = await response.json();
    saveTasksToLocalStorage(); // Sync backend tasks to local storage
    renderTasks();
  } catch (error) {
    console.error(
      "Error fetching tasks from backend. Using local storage:",
      error
    );
    renderTasks(); // Render tasks from local storage
  }
}

// Add Task to Backend and Local Storage
async function addTaskToBackend(task) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error("Failed to add task to backend");
    fetchTasks(); // Refresh tasks after adding
  } catch (error) {
    console.error("Error adding task to backend. Adding locally:", error);
    tasks.push({ ...task, id: Date.now() }); // Add with a unique local ID
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Update Task in Backend and Local Storage
async function updateTaskInBackend(id, updatedTask) {
  try {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    if (!response.ok) throw new Error("Failed to update task in backend");
    fetchTasks(); // Refresh tasks after updating
  } catch (error) {
    console.error("Error updating task in backend. Updating locally:", error);
    tasks = tasks.map((task) => (task.id === id ? updatedTask : task));
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Delete Task from Backend and Local Storage
async function deleteTaskFromBackend(id) {
  try {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete task from backend");
    fetchTasks(); // Refresh tasks after deleting
  } catch (error) {
    console.error("Error deleting task from backend. Deleting locally:", error);
    tasks = tasks.filter((task) => task.id !== id);
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Function to create a toast
function showToast(message, type = "success", duration = 3000) {
  const toastContainer = document.getElementById("toast-container");

  // Create the toast element
  const toast = document.createElement("div");
  toast.className = `flex items-center bg-gray-900 text-white p-4 max-w-sm w-full bg-${
    type === "success" ? "green" : "red"
  }-100 text-${type === "success" ? "green" : "red"}-800 border-2 border-${
    type === "success" ? "green" : "red"
  }-200 rounded-lg shadow-lg animate-fadeIn`;

  toast.innerHTML = `
<span class="mr-2">
${
  type === "success"
    ? "✅" // Success icon
    : "❌" // Error icon
}
</span>
<span class="flex-grow">${message}</span>
<button
class="ml-4 text-${type === "success" ? "green" : "red"}-600 hover:text-${
    type === "success" ? "green" : "red"
  }-800 focus:outline-none"
>
✖
</button>
`;

  // Append toast to container
  toastContainer.appendChild(toast);

  // Add event listener to close button
  toast.querySelector("button").addEventListener("click", () => {
    toast.classList.replace("animate-fadeIn", "animate-fadeOut");
    setTimeout(() => toast.remove(), 300);
  });

  // Automatically remove toast after the specified duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.replace("animate-fadeIn", "animate-fadeOut");
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Add animation classes
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
@keyframes fadeIn {
from { opacity: 0; transform: translateY(10px); }
to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
from { opacity: 1; transform: translateY(0); }
to { opacity: 0; transform: translateY(10px); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
.animate-fadeOut { animation: fadeOut 0.3s ease-out forwards; }
</style>`
);

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";
  const filterValue = filterSelect.value;
  const searchQuery = searchInput.value.toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "completed" && task.completed) ||
      (filterValue === "pending" && !task.completed);
    const matchesSearch = task.text.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300";

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.className = `flex-1 cursor-pointer ${
      task.completed ? "line-through text-gray-500" : "text-gray-200"
    }`;
    taskText.addEventListener("click", () =>
      toggleTaskCompletion(task.id, task)
    );

    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<ion-icon name="create-outline" class='size-6'></ion-icon>`;
    editBtn.className =
      "grid place-content-center p-1 border-[2px] mr-2 border-solid border-blue-500 rounded-md text-white hover:text-blue-600";
    editBtn.addEventListener("click", () => {
      editTaskBtn.classList.remove("hidden");
      addTaskBtn.classList.add("hidden");
      taskInput.value = task.text;
      store = task;
      // editTask(task.id, task);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<ion-icon name="trash-outline" class='size-6'></ion-icon>`;
    deleteBtn.className =
      "grid place-content-center p-1 border-[2px] border-solid border-red-500 rounded-md text-white hover:text-red-600";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(taskText);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const task = { text: taskText, completed: false };
    taskInput.value = "";
    showToast(`Success!, Added "${taskText}" to the list`, "success");
    addTaskToBackend(task); // Save to backend
  }
});

// Toggle Task Completion
function toggleTaskCompletion(id, task) {
  !task.completed && showToast(`Success!, completed Todo`, "success");
  task.completed && showToast(`Success!, Pending Todo`, "success");
  const updatedTask = { ...task, completed: !task.completed };
  updateTaskInBackend(id, updatedTask); // Update backend
}

// Edit Task
function editTask() {
  console.log("called");
  const newTaskText = taskInput.value;
  if (newTaskText !== null) {
    const updatedTask = { ...store, text: newTaskText.trim() };
    taskInput.value = "";
    editTaskBtn.classList.add("hidden");
    addTaskBtn.classList.remove("hidden");
    showToast(
      `Success!, Updated "${store.text}" to "${newTaskText}"`,
      "success"
    );
    updateTaskInBackend(store.id, updatedTask); // Update backend
  }
}
editTaskBtn.addEventListener("click", editTask);

// Delete Task
function deleteTask(id) {
  showToast(`Successfully deleted`, "success");
  deleteTaskFromBackend(id); // Delete from backend
}

// Search and Filter
searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

// Initial Fetch
fetchTasks();
