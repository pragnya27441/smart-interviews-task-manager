const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const filter = {
      user: req.userId,
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    const tasks = await Task.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
    });

    const stats = {
      total: tasks.length,
      todo: 0,
      inProgress: 0,
      done: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    tasks.forEach((task) => {
      if (task.status === "Todo") {
        stats.todo++;
      }

      if (task.status === "In Progress") {
        stats.inProgress++;
      }

      if (task.status === "Done") {
        stats.done++;
      }

      if (task.priority === "High") {
        stats.high++;
      }

      if (task.priority === "Medium") {
        stats.medium++;
      }

      if (task.priority === "Low") {
        stats.low++;
      }
    });

    res.json({
      stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
};