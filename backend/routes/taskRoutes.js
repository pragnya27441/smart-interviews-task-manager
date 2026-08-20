const express = require("express");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTask);

router.get("/", protect, getTasks);
router.get("/stats", protect, getTaskStats);

router.put("/:id", protect, updateTask);

router.delete("/:id", protect, deleteTask);

module.exports = router;