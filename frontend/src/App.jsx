import { validateTaskTitle } from "./taskValidation";
import { getCompletionStats } from "./taskUtils";
import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  getSubjects,
  createSubject,
  createTask,
  updateTask,
  deleteSubject,
} from "./api";
import {
  createNotificationFactories,
  InlineNotificationService,
  NotificationServiceAdapter,
} from "./notificationPatterns";
import { DashboardProgressObserver, TaskEventSubject } from "./taskObservers";

import "./App.css";

const initialTasks = [
  { id: 1, title: "Complete Software Engineering lab", subject: "Software Engineering", due: "Today", priority: "High", done: false },
  { id: 2, title: "Revise generic algorithms", subject: "Artificial Intelligence", due: "Tomorrow", priority: "Medium", done: false },
  { id: 3, title: "Practice graph algorithms", subject: "Algorithms", due: "Oct 30", priority: "High", done: true },
  { id: 4, title: "Prepare DSP class notes", subject: "Digital Signal Processing", due: "Oct 31", priority: "Low", done: false },
];

const initialSubjects = [
  { id: 1, name: "Software Engineering", code: "CSE 3205", color: "#7C6CF2" },
  { id: 2, name: "Operating Systems", code: "CSE 3101", color: "#E9A23B" },
   { id: 3, name: "Digital Signal Processing", code: "CSE 3209", color: "#E87891" },
  { id: 4, name: "Data Communication", code: "CSE 3203", color: "#31A88A" },

   { id: 5, name: "Artificial Intelligence", code: "CSE 3207", color: "#852727" },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [tasks, setTasks] = useState([]);
const [subjects, setSubjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [taskStats, setTaskStats] = useState(() => getCompletionStats([]));
  const notificationFactories = useMemo(() => createNotificationFactories(), []);
  const notificationService = useMemo(
    () => new NotificationServiceAdapter(new InlineNotificationService(setNotice)),
    []
  );
  const taskSubject = useMemo(() => new TaskEventSubject(), []);
  const showNotification = (type, message) => {
    const factory = notificationFactories[type];
    if (!factory) throw new Error(`Unknown notification type: ${type}`);
    factory.createNotification(message).show(notificationService);
  };
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState("Software Engineering");
  const [showSubjectForm, setShowSubjectForm] = useState(false);
const [subjectName, setSubjectName] = useState("");
const [subjectCode, setSubjectCode] = useState("");
const [subjectColor, setSubjectColor] = useState("#31A88A");
  useEffect(() => {
  async function loadData() {
    try {
      setError("");

      const [taskData, subjectData] = await Promise.all([
        getTasks(),
        getSubjects(),
      ]);

      const loadedTasks = taskData.map((task) => ({
        ...task,
        subject: task.subject || "No subject",
        due: task.due_date || "Not set",
        done: Boolean(task.completed),
      }));
      setTasks(loadedTasks);
      taskSubject.notify(loadedTasks);

      setSubjects(subjectData);
    } catch (err) {
      setError("Could not load data. Check that the backend is running.");
      showNotification("error", "Could not load data. Check that the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

  // Observer registration: dashboard progress listens for task-list changes.
  useEffect(() => {
    const dashboardObserver = new DashboardProgressObserver(setTaskStats);
    taskSubject.attach(dashboardObserver);
    return () => taskSubject.detach(dashboardObserver);
  }, [taskSubject]);

  const { completed, progress } = taskStats;

  async function addTask(event) {
  event.preventDefault();

  if (!validateTaskTitle(newTask)) {
  setError("Please enter a valid task title.");
  return;
}

  const selectedSubject = subjects.find(
    (subject) => subject.name === newSubject
  );

  try {
    setError("");

    const savedTask = await createTask({
      title: newTask.trim(),
      subject_id: selectedSubject?.id ?? null,
      priority: "Medium",
    });

    const updatedTasks = [
      {
        ...savedTask,
        subject: selectedSubject?.name || "No subject",
        due: savedTask.due_date || "Not set",
        done: Boolean(savedTask.completed),
      },
      ...tasks,
    ];
    setTasks(updatedTasks);
    taskSubject.notify(updatedTasks);

    setNewTask("");
    setShowForm(false);
    showNotification("success", "Study task created successfully.");
  } catch (err) {
    setError("");
    showNotification("error", "Could not save the task. Please try again.");
    console.error(err);
  }
}


async function addSubject(event) {
  event.preventDefault();

  if (!subjectName.trim() || !subjectCode.trim()) {
    setError("Please enter both a subject name and course code.");
    return;
  }

  try {
    setError("");

    const savedSubject = await createSubject({
      name: subjectName.trim(),
      code: subjectCode.trim(),
      color: subjectColor,
    });

    setSubjects((currentSubjects) => [
      ...currentSubjects,
      savedSubject,
    ]);

    setSubjectName("");
    setSubjectCode("");
    setSubjectColor("#31A88A");
    setShowSubjectForm(false);
    showNotification("success", "Subject created successfully.");
  } catch (err) {
    setError("");
    showNotification("error", "Could not save the subject. Please try again.");
    console.error(err);
  }
}

async function handleDeleteSubject(subject) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${subject.name}"?`
  );

  if (!confirmed) return;

  try {
    await deleteSubject(subject.id);

    setSubjects((currentSubjects) =>
      currentSubjects.filter((item) => item.id !== subject.id)
    );
    showNotification("success", "Subject deleted successfully.");
  } catch (err) {
    setError("");
    showNotification("error", err.message || "Failed to delete subject.");
  }
}


  async function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) return;

  const newCompleted = !task.done;

  // Update the UI immediately and notify registered task observers.
  const optimisticTasks = tasks.map((item) =>
    item.id === id ? { ...item, done: newCompleted } : item
  );
  setTasks(optimisticTasks);
  taskSubject.notify(optimisticTasks);

  try {
    await updateTask(id, newCompleted);
    showNotification("success", newCompleted ? "Task marked as completed." : "Task marked as incomplete.");
  } catch (err) {
    // Revert the UI if saving fails
    const revertedTasks = tasks.map((item) =>
      item.id === id ? { ...item, done: task.done } : item
    );
    setTasks(revertedTasks);
    taskSubject.notify(revertedTasks);

    setError("");
    showNotification("error", "Could not update task status.");
    console.error(err);
  }
}

  const visibleTasks =
    activePage === "Study Tasks"
      ? tasks
      : activePage === "Deadline Tracker"
        ? tasks.filter((task) => !task.done)
        : tasks.slice(0, 4);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
         <div className="brand-icon" role="img" aria-label="StudyTrack books">
  📚</div>
          <div>
            <h2>StudyTrack</h2>
            <span>YOUR STUDY SPACE</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        {[
          ["Dashboard", "◫"],
          ["Subjects", "▤"],
          ["Assignments", "▣"],
          ["Study Tasks", "✓"],
          ["Deadline Tracker", "◷"],
        ].map(([name, icon]) => (
          <button
            key={name}
            className={`nav-item ${activePage === name ? "active" : ""}`}
            onClick={() => setActivePage(name)}
          >
            <span className="nav-icon">{icon}</span>
            {name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="study-tip">
           <span>📖</span>
            <h4>Small steps, big results.</h4>
            <p>Stay consistent. Your future self will thank you.</p>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Student</strong>
              <p>Keep learning</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {loading && (
  <p className="empty-note">Loading your study data...</p>
)}

{error && (
  <p className="error-message" role="alert">
    {error}
  </p>
)}
        {notice && (
          <div className={`app-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
            <span>{notice.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button>
          </div>
        )}
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL STUDY PLANNER</p>
            <h1>{activePage}</h1>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Add task
          </button>
        </header>

        {activePage === "Dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <span className="welcome-tag">📖 YOUR LEARNING JOURNEY</span>
                <h2>A little progress<br />every day adds up.</h2>
                <p>You don't have to do everything today.<br />Just take the next step.</p>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <div className="art-circle"></div>
                <div className="art-book">📖</div>
               
              </div>
            </section>

            <section className="stats-grid">
              <StatCard label="Total tasks" value={tasks.length} icon="▤" tone="purple" />
              <StatCard label="Completed" value={completed} icon="✓" tone="green" />
              <StatCard label="Remaining" value={tasks.length - completed} icon="◷" tone="orange" />
              <StatCard label="Subjects" value={subjects.length} icon="▣" tone="pink" />
            </section>

            <section className="content-grid">
              <div className="panel tasks-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Today's focus</h3>
                    <p>A few things to move you forward</p>
                  </div>
                  <button className="text-button" onClick={() => setActivePage("Study Tasks")}>
                    View all →
                  </button>
                </div>

                <TaskList tasks={visibleTasks} onToggle={toggleTask} />
              </div>

              <div className="panel progress-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Your progress</h3>
                    <p>Every completed task counts</p>
                  </div>
                </div>
                <div className="progress-ring" style={{ "--progress": `${progress}%` }}>
                  <div className="progress-inner">
                    <strong>{progress}%</strong>
                    <span>completed</span>
                  </div>
                </div>
                <p className="progress-caption">
                  {completed} of {tasks.length} tasks completed
                </p>
                <div className="progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>
              </div>
            </section>

            <section className="panel subjects-panel">
              <div className="panel-heading">
                <div>
                  <h3>Your subjects</h3>
                  <p>Keep all your coursework organized</p>
                </div>
                <button className="text-button" onClick={() => setActivePage("Subjects")}>
                  View subjects →
                </button>
              </div>
              <div className="subjects-grid">
                {subjects.map((subject) => (
                  <div className="subject-card" key={subject.id}>
                    <div className="subject-mark" style={{ background: subject.color }}>
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{subject.name}</strong>
                      <p>{subject.code}</p>
                    </div>
                    <span className="subject-arrow">↗</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activePage === "Study Tasks" && (
          <section className="panel page-panel">
            <div className="panel-heading">
              <div>
                <h3>All study tasks</h3>
                <p>Check off each task as you finish it.</p>
              </div>
            </div>
            <TaskList tasks={visibleTasks} onToggle={toggleTask} />
          </section>
        )}

        {activePage === "Deadline Tracker" && (
          <section className="panel page-panel">
            <div className="panel-heading">
              <div>
                <h3>Pending deadlines</h3>
                <p>Stay aware of the work you still need to finish.</p>
              </div>
            </div>
            <TaskList tasks={visibleTasks} onToggle={toggleTask} />
          </section>
        )}

        {activePage === "Subjects" && (
          <section className="panel page-panel">
            <div className="panel-heading">
  <div>
    <h3>Your subjects</h3>
    <p>Your courses in one place.</p>
  </div>

  <button
    type="button"
    className="primary-button"
    onClick={() => setShowSubjectForm(true)}
  >
    ＋ Add Subject
  </button>
</div>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div className="subject-card" key={subject.id}>
                  <div className="subject-mark" style={{ background: subject.color }}>
                    {subject.name.charAt(0)}
                  </div>
                  <div className="subject-info">
  <strong>{subject.name}</strong>
  <p>{subject.code}</p>
</div>

<button
  type="button"
  className="delete-subject-button"
  onClick={() => handleDeleteSubject(subject)}
>
  Delete
</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activePage === "Assignments" && (
          <section className="panel page-panel">
            <div className="panel-heading">
              <div>
                <h3>Assignments</h3>
                <p>Assignment tracking will be expanded in the next stage.</p>
              </div>
            </div>
            <p className="empty-note">Your assignment module is coming next.</p>
          </section>
        )}


{showSubjectForm && (
  <div
    className="modal-backdrop"
    onClick={() => setShowSubjectForm(false)}
  >
    <form
      className="task-form"
      onSubmit={addSubject}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="panel-heading">
        <div>
          <h3>Add a subject</h3>
          <p>Add a course to organize your studies.</p>
        </div>
        <button
          type="button"
          className="close-button"
          onClick={() => setShowSubjectForm(false)}
        >
          ×
        </button>
      </div>

      <label>
        Subject name
        <input
          autoFocus
          required
          value={subjectName}
          onChange={(event) => {
            setSubjectName(event.target.value);
            setError("");
          }}
          placeholder="e.g. Software Testing"
        />
      </label>

      <label>
        Course code
        <input
          required
          value={subjectCode}
          onChange={(event) => {
            setSubjectCode(event.target.value);
            setError("");
          }}
          placeholder="e.g. CSE 3211"
        />
      </label>

      <label>
        Subject color
        <input
          type="color"
          value={subjectColor}
          onChange={(event) => setSubjectColor(event.target.value)}
        />
      </label>

      <button
        className="primary-button full-button"
        type="submit"
      >
        Create subject
      </button>
    </form>
  </div>
)}


        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <form className="task-form" onSubmit={addTask} onClick={(event) => event.stopPropagation()}>
              <div className="panel-heading">
                <div>
                  <h3>Add a study task</h3>
                  <p>Write down your next small step.</p>
                </div>
                <button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button>
              </div>
              <label>
                Task title
                <input
                  autoFocus
                  required
                  value={newTask}
                  onChange={(event) => {
  setNewTask(event.target.value);
  setError("");
}}
                  placeholder="e.g. Revise chapter 3"
                />
              </label>
              <label>
                Subject
                <select value={newSubject} onChange={(event) => setNewSubject(event.target.value)}>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </label>
              <button className="primary-button full-button" type="submit">Create task</button>
            </form>
          </div>
        )}

        <footer>Made for your learning journey <span>📖</span> StudyTrack</footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function TaskList({ tasks, onToggle }) {
  if (tasks.length === 0) {
    return <p className="empty-note">No tasks here yet. Add one to get started!</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}>
          <button
            className={`task-check ${task.done ? "checked" : ""}`}
            onClick={() => onToggle(task.id)}
            aria-label={task.done ? "Mark task incomplete" : "Mark task complete"}
          >
            {task.done ? "✓" : ""}
          </button>
          <div className="task-info">
            <strong>{task.title}</strong>
            <p>{task.subject}</p>
          </div>
          <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span className="task-due">{task.due}</span>
        </div>
      ))}
    </div>
  );
}

export default App;
