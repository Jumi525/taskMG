const baseUrl = `http://localhost:5000/api/tasks`; // Backend API base URL

// DOM Elements
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const selectInput = document.getElementById("selectInput");
const errormsg = document.getElementById("errormsg");
const textInput = document.getElementById("textInput");
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

const token = localStorage.getItem("authToken");
if (!token) {
  alert("You must be logged in to access this page.");
  window.location.href = "/src/auth.html#login"; // Redirect to the login page
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
      (filterValue === "low" && task.select === "low") ||
      (filterValue === "medium" && task.select === "medium") ||
      (filterValue === "high" && task.select === "high") ||
      (filterValue === "pending" && !task.completed);
    const matchesSearch = task.text.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `flex gap-4 items-center justify-between cursor-pointer p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${
      task.completed ? "line-through text-gray-500" : "text-gray-200"
    }`;

    // li.addEventListener("click", () => toggleTaskCompletion(task.id, task));

    const card = document.createElement("div");
    card.className = "flex flex-col";

    card.addEventListener("click", () => toggleTaskCompletion(task._id, task));

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.className = "flex-1";

    const div = document.createElement("div");
    div.className = "flex items-center justify-between";

    const dates = document.createElement("span");
    dates.textContent = `Date: ${task.date}`;
    dates.className = "";

    div.append(dates);

    const descript = document.createElement("span");
    descript.textContent = `Description: ${task.textarea}`;

    const btns = document.createElement("div");
    btns.className = "flex";

    const priority = document.createElement("span");
    priority.textContent = task.select;
    priority.className = `rounded-full px-2 py-1 border-[2px] ${
      (task.select === "low" && "border-green-500") ||
      (task.select === "medium" && "border-blue-500") ||
      (task.select === "high" && "border-red-500")
    } mr-2`;

    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<ion-icon name="create-outline" class='size-6'></ion-icon>`;
    editBtn.className =
      "grid place-content-center p-1 border-[2px] mr-2 border-solid border-blue-500 rounded-md text-white hover:text-blue-600";
    editBtn.addEventListener("click", () => {
      editTaskBtn.classList.remove("hidden");
      addTaskBtn.classList.add("hidden");
      // addTaskBtn.;
      taskInput.value = task.text;
      dateInput.value = task.date;
      selectInput.value = task.select;
      textInput.value = task.textarea;
      store = task;
      // editTask(task.id, task);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<ion-icon name="trash-outline" class='size-6'></ion-icon>`;
    deleteBtn.className =
      "grid place-content-center p-1 border-[2px] border-solid border-red-500 rounded-md text-white hover:text-red-600";
    deleteBtn.addEventListener("click", () => deleteTask(task._id));

    card.appendChild(taskText);
    card.appendChild(div);
    card.appendChild(descript);

    btns.appendChild(priority);
    btns.appendChild(editBtn);
    btns.appendChild(deleteBtn);

    li.appendChild(card);
    li.append(btns);

    taskList.appendChild(li);
  });
}

// Add Task
addTaskBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  const date = dateInput.value;
  const select = selectInput.value;
  const textarea = textInput.value;
  if (taskText && date && select && textarea) {
    const task = { text: taskText, date, select, textarea, completed: false };
    taskInput.value = "";
    dateInput.value = "";
    selectInput.value = "low";
    textInput.value = "";
    showToast(`Success!, Added "${taskText}" to the list`, "success");
    addTaskToBackend(task); // Save to backend
  } else {
    errormsg.innerHTML = `<p class="text-red-900">All input fields are required</p>`;
    setTimeout(() => errormsg.remove(), 2000);
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
editTaskBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const taskText = taskInput.value.trim();
  const date = dateInput.value;
  const select = selectInput.value;
  const textarea = textInput.value;
  if (taskText && date && select && textarea) {
    const updatedTask = {
      ...store,
      text: taskText.trim(),
      date,
      select,
      textarea,
      completed: store.completed,
    };
    taskInput.value = "";
    dateInput.value = "";
    selectInput.value = "low";
    textInput.value = "";

    editTaskBtn.classList.add("hidden");
    addTaskBtn.classList.remove("hidden");
    console.log(updatedTask);
    showToast(`Success!, Updated "${store.text}" to "${taskText}"`, "success");
    updateTaskInBackend(store._id, updatedTask); // Update backend
  }
});

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
