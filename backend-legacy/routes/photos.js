const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = path.join(__dirname, '../database/maintenance.db');
const db = new sqlite3.Database(dbPath);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `maintenance_photo_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

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

// POST /api/photos/upload - Upload new photo
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file provided'
      });
    }

    const { description, task_id, equipment_id } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Insert photo record into database
    const result = await runQueryExecute(
      `INSERT INTO Photos (file_path, file_name, file_size, mime_type, description, task_id, equipment_id, upload_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [filePath, fileName, fileSize, mimeType, description, task_id, equipment_id]
    );

    const newPhoto = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      data: {
        ...newPhoto,
        url: `/uploads/${fileName}`
      },
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    
    // Clean up uploaded file if database insert failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload photo',
      message: error.message
    });
  }
});

// GET /api/photos - List all photos with filtering
router.get('/', async (req, res) => {
  try {
    const { task_id, equipment_id, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM Photos WHERE 1=1';
    const params = [];
    
    if (task_id) {
      query += ' AND task_id = ?';
      params.push(task_id);
    }
    
    if (equipment_id) {
      query += ' AND equipment_id = ?';
      params.push(equipment_id);
    }
    
    query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const photos = await runQuery(query, params);
    
    // Add URL to each photo
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/${photo.file_name}`
    }));
    
    res.json({
      success: true,
      data: photosWithUrls,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: photosWithUrls.length
      }
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos',
      message: error.message
    });
  }
});

// GET /api/photos/:id - Get single photo details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [id]
    );
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...photo,
        url: `/uploads/${photo.file_name}`
      }
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo',
      message: error.message
    });
  }
});

// PUT /api/photos/:id - Update photo metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, task_id, equipment_id, ai_analysis } = req.body;
    
    // Check if photo exists
    const existingPhoto = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [id]
    );
    
    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (task_id !== undefined) {
      updates.push('task_id = ?');
      params.push(task_id);
    }
    if (equipment_id !== undefined) {
      updates.push('equipment_id = ?');
      params.push(equipment_id);
    }
    if (ai_analysis !== undefined) {
      updates.push('ai_analysis = ?');
      params.push(JSON.stringify(ai_analysis));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    params.push(id);
    const query = `UPDATE Photos SET ${updates.join(', ')} WHERE id = ?`;
    
    await runQueryExecute(query, params);
    
    const updatedPhoto = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...updatedPhoto,
        url: `/uploads/${updatedPhoto.file_name}`
      },
      message: 'Photo updated successfully'
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update photo',
      message: error.message
    });
  }
});

// DELETE /api/photos/:id - Delete photo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if photo exists
    const existingPhoto = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [id]
    );
    
    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    // Delete file from filesystem
    try {
      await fs.unlink(existingPhoto.file_path);
    } catch (unlinkError) {
      console.error('Failed to delete file:', unlinkError);
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from database
    await runQueryExecute('DELETE FROM Photos WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      message: error.message
    });
  }
});

// GET /api/tasks/:id/photos - Get photos for specific task
router.get('/tasks/:taskId/photos', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const photos = await runQuery(
      'SELECT * FROM Photos WHERE task_id = ? ORDER BY upload_date DESC LIMIT ? OFFSET ?',
      [taskId, parseInt(limit), parseInt(offset)]
    );
    
    // Add URL to each photo
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/${photo.file_name}`
    }));
    
    res.json({
      success: true,
      data: photosWithUrls,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: photosWithUrls.length
      }
    });
  } catch (error) {
    console.error('Error fetching task photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task photos',
      message: error.message
    });
  }
});

// POST /api/photos/:id/analyze - Trigger AI analysis
router.post('/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const { context = {} } = req.body;
    
    // Check if photo exists
    const photo = await runQuerySingle(
      'SELECT * FROM Photos WHERE id = ?',
      [id]
    );
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    // Import AI analysis service
    const aiAnalysisService = require('../services/ai_analysis');
    
    // Perform AI analysis
    const analysisResult = await aiAnalysisService.analyzePhoto(
      photo.file_path,
      {
        equipmentType: context.equipmentType,
        taskDescription: context.taskDescription,
        location: context.location,
        photoId: id
      }
    );
    
    // Update photo with analysis results
    await runQueryExecute(
      'UPDATE Photos SET ai_analysis = ? WHERE id = ?',
      [JSON.stringify(analysisResult), id]
    );
    
    res.json({
      success: true,
      data: analysisResult,
      message: 'AI analysis completed successfully'
    });
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger AI analysis',
      message: error.message
    });
  }
});

module.exports = router; 