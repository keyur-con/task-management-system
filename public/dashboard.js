const API_URL = "/api/todos";

let currentTodoId = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadTodos();
});

async function loadTodos() {
  const res = await fetch(API_URL, {
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = "/login.html";
    return;
  }
  const todos = await res.json();

  const pendingList = document.getElementById("pendingList");
  const completedList = document.getElementById("completedList");
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  todos.forEach((todo) => {
    const card = document.createElement("div");
    card.className = "todo-card";
    card.innerHTML = `
        <div class="card-header">
            <span>Due: ${todo.dueDate ? todo.dueDate.split("T")[0] : " - "}</span>
            <span class="priority-${todo.priority.toLowerCase()}">Priority: ${todo.priority}</span>
        </div>
        <div class="card-body">
            <input type="checkbox" onchange="toggleTodo('${todo._id}')" ${todo.completed ? "checked" : ""}>
            <div class="card-content">
                <h3>${todo.title}</h3>
                <p>${todo.description}</p>
            </div>
        </div>
        <div class="card-buttons">
            <button class="btn-edit">Edit</button>
            <button onclick="deleteTodo('${todo._id}')" class="btn-delete">Delete</button>
        </div>
    `;

    const editBtn = card.querySelector(".btn-edit");
    editBtn.addEventListener("click", () => {
      openModal(
        todo._id,
        todo.title,
        todo.description,
        todo.dueDate ? todo.dueDate.split("T")[0] : "",
        todo.priority,
      );
    });

    if (todo.completed) {
      completedList.appendChild(card);
    } else {
      pendingList.appendChild(card);
    }
  });
}

document.getElementById("todoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;

  await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, dueDate, priority }),
  });

  document.getElementById("todoForm").reset();
  await loadTodos();
});

async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  await loadTodos();
}

async function toggleTodo(id) {
  await fetch(`${API_URL}/${id}/toggle`, {
    method: "PATCH",
    credentials: "include",
  });

  await loadTodos();
}

function openModal(id, title, description, dueDate, priority) {
  currentTodoId = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editDescription").value = description;
  document.getElementById("editDueDate").value = dueDate;
  document.getElementById("editPriority").value = priority;
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function saveTodo() {
  const title = document.getElementById("editTitle").value;
  const description = document.getElementById("editDescription").value;
  const dueDate = document.getElementById("editDueDate").value;
  const priority = document.getElementById("editPriority").value;

  await fetch(`${API_URL}/${currentTodoId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ title, description, dueDate, priority }),
  });
  closeModal();
  await loadTodos();
}
const urlParams = new URLSearchParams(window.location.search);

document.addEventListener('DOMContentLoaded', function () {
  var emailEl = document.getElementById('userEmail');
  var logoutBtn = document.getElementById('logoutBtn');

  if (emailEl) emailEl.textContent = 'Loading...';

  fetch('/profile', {
    method: 'GET',
    credentials: 'include', 
    headers: { 'Content-Type': 'application/json' }
  })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.message) ? data.message : 'Failed to load profile';
          throw new Error(msg);
        }
        return data;
      });
    })
    .then(function (data) {
      if (data && data.user && data.user.email) {
        if (emailEl) emailEl.textContent = data.user.email;
      } else {
        if (emailEl) emailEl.textContent = 'No user info';
      }
    })
    .catch(function (err) {
      console.error('Profile fetch error:', err);
      try { localStorage.removeItem('token'); } catch (e) {}
      window.location.href = 'login.html';
    });

  if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
          await fetch('/logout', {
              method: 'POST',
              credentials: 'include'
          });
          window.location.href = 'login.html';
      });
  }
});
