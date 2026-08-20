import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
  total: 0,
  todo: 0,
  inProgress: 0,
  done: 0,
  high: 0,
  medium: 0,
  low: 0,
});
 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
const tasksPerPage = 3;
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Todo");
  const [dueDate, setDueDate] = useState("");
  const dateInputRef = useRef(null);
  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
       setLoading(true);

      try {
        const response = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
      finally {
  setLoading(false);
}
    };

    fetchTasks();
     const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tasks/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  fetchStats();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      alert("Login successful!");
      window.location.reload();
    } catch (error) {
      alert("Cannot connect to server");
    }
  };
 const handleSignup = async (e) => {
  e.preventDefault();

  if (!name || !email || !password) {
    alert("Name, email and password are required");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    alert("Signup successful! Please login.");

    setIsSignup(false);
    setName("");
    setEmail("");
    setPassword("");
  } catch (error) {
    alert("Cannot connect to server");
  }
};

  // =========================
  // DASHBOARD
  // =========================
const filteredAndSortedTasks = [...tasks]
  .filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  )
  .filter((task) =>
    statusFilter === "All" || task.status === statusFilter
  )
  .filter((task) =>
    priorityFilter === "All" || task.priority === priorityFilter
  )
  .sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortBy === "dueSoon") {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    if (sortBy === "dueLate") {
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    if (sortBy === "priorityHigh") {
  const order = { High: 3, Medium: 2, Low: 1 };
  return order[b.priority] - order[a.priority];
}

if (sortBy === "priorityLow") {
  const order = { High: 3, Medium: 2, Low: 1 };
  return order[a.priority] - order[b.priority];
}
    return 0;
  });

const totalPages = Math.ceil(
  filteredAndSortedTasks.length / tasksPerPage
);

const startIndex = (currentPage - 1) * tasksPerPage;

const paginatedTasks = filteredAndSortedTasks.slice(
  startIndex,
  startIndex + tasksPerPage
);


  if (token) {
    return (
     <div className={darkMode ? "app dark-mode" : "app"}>

  <header className="dashboard-header">

    <button
      className="dark-mode-btn"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>

    <h1>Smart Interviews Task Manager</h1>

    <button
      className="logout-btn"
      onClick={() => {
        localStorage.removeItem("token");
        window.location.reload();
      }}
    >
      Logout
    </button>

  </header>
        <h2 className="section-title">Analytics</h2>

<div className="analytics">

  <div className="analytics-card">
    <strong>Total Tasks</strong>
    <p>{stats.total}</p>
  </div>

  <div className="analytics-card">
    <strong>Completed</strong>
    <p>{stats.done}</p>
  </div>

  <div className="analytics-card">
    <strong>Pending</strong>
    <p>{stats.todo + stats.inProgress}</p>
  </div>

  <div className="analytics-card">
    <strong>High Priority</strong>
    <p>{stats.high}</p>
  </div>

</div>


        {/* =========================
            CREATE TASK
        ========================= */}
<div className="dashboard-grid">

  <section className="create-panel">
    <h3>Create Task</h3>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />
        <br />
      <div className="date-input-wrapper">
  <input
    ref={dateInputRef}
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    onClick={() => {
      if (dateInputRef.current?.showPicker) {
        dateInputRef.current.showPicker();
      }
    }}
  />
</div>
<br />
<br />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <br />
        <br />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <br />
        <br />

        <button
          onClick={async () => {
            if (!title) {
              alert("Enter a task title");
              return;
            }

            try {
              const response = await fetch(
                "http://localhost:5000/api/tasks",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    title,
                    description,
                    status,
                    priority,
                    dueDate,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                alert(data.message || "Failed to create task");
                return;
              }

              setTasks([...tasks, data.task]);
              setStats({
  ...stats,
  total: stats.total + 1,
});

              setTitle("");
              setDescription("");
              setPriority("Medium");
              setStatus("Todo");
              setDueDate("");

              alert("Task created successfully!");
            } catch (error) {
              alert("Cannot connect to server");
            }
          }}
        >
          Add Task
        </button>
          </section>

        {/* =========================
            YOUR TASKS
        ========================= */}
 <section className="tasks-panel">

  
        <h3>Your Tasks</h3>
        {loading && <p>Loading tasks...</p>}
     

        {loading ? (
  <p>Loading tasks...</p>
) : tasks.length === 0 ? (
  <p>No tasks found.</p>
) : (
          paginatedTasks.map((task) => (
    
           <div className="task" key={task._id}>
              <h4>{task.title}</h4>

              <p>{task.description}</p>

              <p>Status: {task.status}</p>

              <p>Priority: {task.priority}</p>
              <p>Due Date: {task.dueDate}</p>

              {/* =========================
                  EDIT BUTTON
              ========================= */}

              <button
  onClick={() => setEditingTask(task)}
>
  Edit
</button>

              {" "}

              {/* =========================
                  DELETE BUTTON
              ========================= */}

              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `http://localhost:5000/api/tasks/${task._id}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      alert(
                        data.message ||
                          "Failed to delete task"
                      );
                      return;
                    }

                    setTasks(
                      tasks.filter(
                        (t) => t._id !== task._id
                      )
                    );
                    setStats({
  ...stats,
  total: stats.total - 1,
});

                    alert("Task deleted successfully!");
                  } catch (error) {
                    alert("Cannot connect to server");
                  }
                }}
              >
                Delete
              </button>
{editingTask && editingTask._id === task._id && (
  <div className="edit-form">
    <h4>Edit Task</h4>

    <input
      type="text"
      value={editingTask.title}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          title: e.target.value,
        })
      }
    />

    <br />
    <br />

    <input
      type="text"
      value={editingTask.description}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          description: e.target.value,
        })
      }
    />

    <br />
    <br />

    <select
      value={editingTask.status}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          status: e.target.value,
        })
      }
    >
      <option value="Todo">Todo</option>
      <option value="In Progress">In Progress</option>
      <option value="Done">Done</option>
    </select>

    <br />
    <br />

    <select
      value={editingTask.priority}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          priority: e.target.value,
        })
      }
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>

    <br />
    <br />

    <button
  onClick={async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks/${editingTask._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingTask.title,
            description: editingTask.description,
            status: editingTask.status,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update task");
        return;
      }

      setTasks(
        tasks.map((t) =>
          t._id === editingTask._id ? data.task : t
        )
      );

      setEditingTask(null);

      alert("Task updated successfully!");
    } catch (error) {
      alert("Cannot connect to server");
    }
  }}
>
  Save Changes
</button>

    <button
      onClick={() => setEditingTask(null)}
    >
      Cancel
    </button>
  </div>
)}

<hr />
              <hr />
            </div>
          ))
        )}
  <div className="pagination">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    Previous
  </button>

  <span>
    {" "}Page {currentPage} of {totalPages || 1}{" "}
  </span>

  <button
    disabled={currentPage === totalPages || totalPages === 0}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next
  </button>
</div>
</section>

<section className="filters-panel">

  <h3>Filters</h3>

  <label>Search</label>
  <input
    type="text"
    placeholder="Search tasks by title..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <label>Status</label>
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="All">All Status</option>
    <option value="Todo">Todo</option>
    <option value="In Progress">In Progress</option>
    <option value="Done">Done</option>
  </select>

  <label>Priority</label>
  <select
    value={priorityFilter}
    onChange={(e) => setPriorityFilter(e.target.value)}
  >
    <option value="All">All Priority</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>

  <label>Sort By</label>
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="dueSoon">Due Date: Soonest</option>
    <option value="dueLate">Due Date: Latest</option>
    <option value="priorityHigh">Priority: High → Low</option>
    <option value="priorityLow">Priority: Low → High</option>
  </select>

</section>

</div>

<br />

        {/* =========================
            LOGOUT
        ========================= */}

      </div>
    );
  }

  // =========================
  // LOGIN PAGE
  // =========================

  return (
  <div className="auth-page">
    <div className="auth-card">

      <div className="brand">
        <div className="brand-icon">✓</div>

        <h1>Smart Interviews</h1>
        <p>Task Manager</p>
      </div>

      <div className="auth-heading">
        <h2>
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p>
          {isSignup
            ? "Create an account to manage your tasks"
            : "Login to continue to your task manager"}
        </p>
      </div>

      <form onSubmit={isSignup ? handleSignup : handleLogin}>

        {isSignup && (
          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="primary-btn"
          type="submit"
        >
          {isSignup ? "Create Account" : "Login"}
        </button>

      </form>

      <div className="auth-switch">
        <span>
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}
        </span>

        <button
          type="button"
          className="link-btn"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Login" : "Sign Up"}
        </button>
      </div>

    </div>
  </div>
);
}

export default App;