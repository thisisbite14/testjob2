const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 📌 เชื่อมต่อ Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "!Thisisbite14",
  database: "task_manager",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: ", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// 📌 สร้างงานใหม่ (Create Task)
app.post("/tasks", (req, res) => {
    const { title, description, due_date } = req.body;
    const sql = "INSERT INTO tasks (title, description, due_date, created_at) VALUES (?, ?, ?, NOW())";
    db.query(sql, [title, description, due_date], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({
        id: result.insertId,
        title,
        description,
        due_date,
        created_at: new Date().toISOString(), // ส่ง timestamp กลับไป
        status: "Pending",
      });
    });
  });
  

// 📌 ดึงรายการงานทั้งหมด (Get All Tasks)
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 📌 ดึงรายละเอียดของงาน (Get Task by ID)
app.get("/tasks/:id", (req, res) => {
  const sql = "SELECT * FROM tasks WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Task not found" });
    res.json(result[0]);
  });
});

// 📌 อัปเดตงาน (Update Task)
app.put("/tasks/:id", (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "✅ Task updated successfully" });
  });
});

// 📌 อัปเดตชื่อของงาน (Update Task Title)
app.put("/tasks/:id/title", (req, res) => {
  const { title } = req.body;
  const taskId = req.params.id;

  if (!title.trim()) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  db.query("UPDATE tasks SET title = ? WHERE id = ?", [title, taskId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task title updated successfully" });
  });
});


// 📌 ลบงาน (Delete Task)
app.delete("/tasks/:id", (req, res) => {
  db.query("DELETE FROM tasks WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "🗑️ Task deleted successfully" });
  });
});

// 📌 รันเซิร์ฟเวอร์
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
