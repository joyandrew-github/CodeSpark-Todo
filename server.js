const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

let users = []; // Temporary in-memory store

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Async email sending function
async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}:`, info.response);
    return { success: true, info };
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// API routes
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ name, email, password });
  res.json({ message: "Registration successful" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful" });
});

app.post("/task/completed", async (req, res) => {
  const { email, taskName } = req.body;
  const subject = "Task Completed!";
  const text = `Congratulations! You have completed the task: ${taskName}.`;

  const result = await sendEmail(email, subject, text);
  res.json({
    message: result.success
      ? "Completion email sent"
      : "Failed to send completion email",
    ...result,
  });
});

app.post("/task/deadline", async (req, res) => {
  const { email, taskName, deadline } = req.body;
  const subject = "Task Deadline Reminder";
  const text = `Reminder: Your task "${taskName}" is due on ${deadline}.`;

  const result = await sendEmail(email, subject, text);
  res.json({
    message: result.success
      ? "Deadline reminder email sent"
      : "Failed to send reminder email",
    ...result,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
