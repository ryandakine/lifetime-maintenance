const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../database/maintenance.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run database queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run single row queries
function runQuerySingle(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to run insert/update/delete queries
function runQueryExecute(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// GET /api/tasks - List all tasks with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM Tasks WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY creation_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const tasks = await runQuery(query, params);
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: tasks.length
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// GET /api/tasks/:id - Get single task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await runQuerySingle(
      'SELECT * FROM Tasks WHERE id = ?',
      [id]
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'pending', category, equipment_id } = req.body;
    
    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const result = await runQueryExecute(
      `INSERT INTO Tasks (title, description, priority, status, category, equipment_id, creation_date) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [title, description, priority, status, category, equipment_id]
    );
    
    const newTask = await runQuerySingle(
      'SELECT * FROM Tasks WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, category, equipment_id, completion_date } = req.body;
    
    // Check if task exists
    const existingTask = await runQuerySingle(
      'SELECT * FROM Tasks WHERE id = ?',
      [id]
    );
    
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (equipment_id !== undefined) {
      updates.push('equipment_id = ?');
      params.push(equipment_id);
    }
    if (completion_date !== undefined) {
      updates.push('completion_date = ?');
      params.push(completion_date);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    params.push(id);
    const query = `UPDATE Tasks SET ${updates.join(', ')} WHERE id = ?`;
    
    await runQueryExecute(query, params);
    
    const updatedTask = await runQuerySingle(
      'SELECT * FROM Tasks WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const existingTask = await runQuerySingle(
      'SELECT * FROM Tasks WHERE id = ?',
      [id]
    );
    
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    await runQueryExecute('DELETE FROM Tasks WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

// GET /api/tasks/stats - Get task statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await runQuerySingle(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority_tasks,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority_tasks
      FROM Tasks
    `);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task statistics',
      message: error.message
    });
  }
});

// Task Agent routes - placeholder for now
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    agent_type: 'Task Agent',
    capabilities: [
      'Task creation',
      'Task tracking',
      'Priority management'
    ],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 