
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create or open the SQLite database
const db = new Database("studytrack.db");

// Create the subjects table
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT DEFAULT '#0fa4af'
  );
`);

// Create the tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject_id INTEGER,
    due_date TEXT,
    priority TEXT DEFAULT 'Medium',
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );
`);


const subjectCount = db.prepare(
  "SELECT COUNT(*) AS count FROM subjects"
).get().count;

if (subjectCount === 0) {
  const insertSubject = db.prepare(`
    INSERT INTO subjects (name, code, color)
    VALUES (?, ?, ?)
  `);

  const seedSubjects = db.transaction(() => {
    insertSubject.run("Software Engineering", "CSE 3205", "#7C6CF2");
    insertSubject.run("Operating Systems", "CSE 3101", "#E9A23B");
    insertSubject.run("Digital Signal Processing", "CSE 3209", "#E87891");
    insertSubject.run("Data Communication", "CSE 3203", "#31A88A");
    insertSubject.run("Artificial Intelligence", "CSE 3207", "#852727");
  });

  seedSubjects();
}

// Check whether the backend is running
app.get("/api/health", (req, res) => {
  res.json({ message: "StudyTrack API is running!" });
});

// Get all subjects
app.get("/api/subjects", (req, res) => {
  const subjects = db.prepare("SELECT * FROM subjects ORDER BY id").all();
  res.json(subjects);
});

// Add a subject
app.post("/api/subjects", (req, res) => {
  const { name, code, color } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof code !== "string" || !code.trim()
  ) {
    return res.status(400).json({
      error: "Subject name and code are required."
    });
  }

  const result = db.prepare(`
    INSERT INTO subjects (name, code, color)
    VALUES (?, ?, ?)
  `).run(name.trim(), code.trim(), color || "#0fa4af");

  const subject = db
    .prepare("SELECT * FROM subjects WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(subject);
});

// Get all tasks, including their subject names
app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare(`
    SELECT
      tasks.*,
      subjects.name AS subject
    FROM tasks
    LEFT JOIN subjects ON tasks.subject_id = subjects.id
    ORDER BY tasks.id DESC
  `).all();

  res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const { title, subject_id, due_date, priority } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required."
    });
  }

  const result = db.prepare(`
    INSERT INTO tasks (title, subject_id, due_date, priority)
    VALUES (?, ?, ?, ?)
  `).run(
    title.trim(),
    subject_id || null,
    due_date || null,
    priority || "Medium"
  );

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(task);
});

// Mark a task complete or incomplete
app.patch("/api/tasks/:id", (req, res) => {
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Completed must be true or false."
    });
  }

  const result = db.prepare(`
    UPDATE tasks SET completed = ? WHERE id = ?
  `).run(completed ? 1 : 0, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Task not found." });
  }

  const task = db.prepare(`
    SELECT * FROM tasks WHERE id = ?
  `).get(req.params.id);

  res.json(task);
});

// Start the server
app.listen(PORT, () => {
  console.log(`StudyTrack API running at http://localhost:${PORT}`);
});
