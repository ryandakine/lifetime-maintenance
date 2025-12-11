const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../database/maintenance.db');
const db = new sqlite3.Database(dbPath);

// Helper function for database queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function runQuerySingle(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// GET /api/equipment/:id/photos - Get equipment photo gallery
router.get('/:id/photos', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { filter, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT p.*, e.name as equipment_name, e.type as equipment_type
      FROM Photos p
      LEFT JOIN Equipment e ON p.equipment_id = e.id
      WHERE p.equipment_id = ?
    `;
    
    const params = [equipmentId];

    // Apply filters
    if (filter === 'maintenance') {
      sql += ` AND (p.task_id IS NOT NULL OR p.description LIKE '%maintenance%')`;
    } else if (filter === 'issues') {
      sql += ` AND p.ai_analysis IS NOT NULL AND (
        json_extract(p.ai_analysis, '$.damages.totalIssues') > 0 OR
        json_extract(p.ai_analysis, '$.assessment.priority') = 'High'
      )`;
    } else if (filter === 'before-after') {
      sql += ` AND (p.description LIKE '%before%' OR p.description LIKE '%after%')`;
    }

    sql += ` ORDER BY p.upload_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const photos = await runQuery(sql, params);

    // Process photos to include AI analysis
    const processedPhotos = photos.map(photo => {
      if (photo.ai_analysis) {
        try {
          photo.ai_analysis = JSON.parse(photo.ai_analysis);
        } catch (e) {
          photo.ai_analysis = null;
        }
      }
      return photo;
    });

    res.json({
      success: true,
      data: processedPhotos,
      count: processedPhotos.length
    });
  } catch (error) {
    console.error('Error fetching equipment photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment photos'
    });
  }
});

// GET /api/equipment/:id/condition - Get equipment condition analysis
router.get('/:id/condition', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { dateRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get condition breakdown
    const conditionSql = `
      SELECT 
        CASE 
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Excellent' THEN 'excellent'
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Good' THEN 'good'
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Fair' THEN 'fair'
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Poor' THEN 'poor'
          ELSE 'unknown'
        END as condition,
        COUNT(*) as count
      FROM Photos
      WHERE equipment_id = ? 
      AND upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      GROUP BY condition
    `;

    const conditions = await runQuery(conditionSql, [equipmentId, startDate.toISOString()]);

    // Calculate overall condition score
    const scoreSql = `
      SELECT 
        AVG(CASE 
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Excellent' THEN 100
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Good' THEN 80
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Fair' THEN 60
          WHEN json_extract(ai_analysis, '$.assessment.overallCondition') = 'Poor' THEN 30
          ELSE 50
        END) as avg_score,
        COUNT(*) as total_photos
      FROM Photos
      WHERE equipment_id = ? 
      AND upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
    `;

    const scoreData = await runQuerySingle(scoreSql, [equipmentId, startDate.toISOString()]);

    // Get recent issues
    const issuesSql = `
      SELECT 
        p.id,
        p.upload_date,
        json_extract(p.ai_analysis, '$.damages.issues') as issues,
        json_extract(p.ai_analysis, '$.assessment.priority') as priority
      FROM Photos p
      WHERE p.equipment_id = ? 
      AND p.upload_date >= datetime(?)
      AND p.ai_analysis IS NOT NULL
      AND (
        json_extract(p.ai_analysis, '$.damages.totalIssues') > 0 OR
        json_extract(p.ai_analysis, '$.assessment.priority') = 'High'
      )
      ORDER BY p.upload_date DESC
      LIMIT 10
    `;

    const issues = await runQuery(issuesSql, [equipmentId, startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        conditionBreakdown: conditions,
        overallScore: Math.round(scoreData.avg_score || 0),
        totalPhotos: scoreData.total_photos || 0,
        recentIssues: issues,
        dateRange,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching equipment condition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment condition'
    });
  }
});

// GET /api/equipment/:id/maintenance-history - Get maintenance history with photos
router.get('/:id/maintenance-history', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { limit = 20, offset = 0 } = req.query;

    const sql = `
      SELECT 
        t.*,
        COUNT(p.id) as photo_count,
        GROUP_CONCAT(p.id) as photo_ids
      FROM Tasks t
      LEFT JOIN Photos p ON t.id = p.task_id
      WHERE t.equipment_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const tasks = await runQuery(sql, [equipmentId, limit, offset]);

    // Get photos for each task
    const tasksWithPhotos = await Promise.all(
      tasks.map(async (task) => {
        if (task.photo_ids) {
          const photoIds = task.photo_ids.split(',').map(id => id.trim());
          const photosSql = `
            SELECT id, filename, upload_date, description, ai_analysis
            FROM Photos
            WHERE id IN (${photoIds.map(() => '?').join(',')})
            ORDER BY upload_date DESC
          `;
          const photos = await runQuery(photosSql, photoIds);
          task.photos = photos.map(photo => {
            if (photo.ai_analysis) {
              try {
                photo.ai_analysis = JSON.parse(photo.ai_analysis);
              } catch (e) {
                photo.ai_analysis = null;
              }
            }
            return photo;
          });
        } else {
          task.photos = [];
        }
        delete task.photo_ids;
        return task;
      })
    );

    res.json({
      success: true,
      data: tasksWithPhotos,
      count: tasksWithPhotos.length
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch maintenance history'
    });
  }
});

// GET /api/equipment/:id/photo-timeline - Get photo timeline
router.get('/:id/photo-timeline', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { months = 6 } = req.query;

    const sql = `
      SELECT 
        strftime('%Y-%m', upload_date) as month,
        COUNT(*) as total_photos,
        COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as analyzed_photos,
        COUNT(CASE WHEN json_extract(ai_analysis, '$.assessment.priority') = 'High' THEN 1 END) as critical_issues,
        COUNT(CASE WHEN task_id IS NOT NULL THEN 1 END) as maintenance_photos
      FROM Photos
      WHERE equipment_id = ?
      AND upload_date >= datetime('now', '-${months} months')
      GROUP BY strftime('%Y-%m', upload_date)
      ORDER BY month DESC
    `;

    const timeline = await runQuery(sql, [equipmentId]);

    res.json({
      success: true,
      data: timeline,
      months: parseInt(months)
    });
  } catch (error) {
    console.error('Error fetching photo timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo timeline'
    });
  }
});

// POST /api/equipment/:id/photos/compare - Compare two photos
router.post('/:id/photos/compare', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const { photo1Id, photo2Id } = req.body;

    if (!photo1Id || !photo2Id) {
      return res.status(400).json({
        success: false,
        error: 'Both photo IDs are required'
      });
    }

    const sql = `
      SELECT id, filename, upload_date, description, ai_analysis, file_path
      FROM Photos
      WHERE equipment_id = ? AND id IN (?, ?)
      ORDER BY upload_date ASC
    `;

    const photos = await runQuery(sql, [equipmentId, photo1Id, photo2Id]);

    if (photos.length !== 2) {
      return res.status(404).json({
        success: false,
        error: 'One or both photos not found'
      });
    }

    // Parse AI analysis for comparison
    const comparison = {
      photo1: {
        ...photos[0],
        ai_analysis: photos[0].ai_analysis ? JSON.parse(photos[0].ai_analysis) : null
      },
      photo2: {
        ...photos[1],
        ai_analysis: photos[1].ai_analysis ? JSON.parse(photos[1].ai_analysis) : null
      },
      comparison: {
        timeDifference: new Date(photos[1].upload_date) - new Date(photos[0].upload_date),
        conditionChange: null,
        issuesChange: null
      }
    };

    // Compare conditions if both have AI analysis
    if (comparison.photo1.ai_analysis && comparison.photo2.ai_analysis) {
      const condition1 = comparison.photo1.ai_analysis.assessment?.overallCondition;
      const condition2 = comparison.photo2.ai_analysis.assessment?.overallCondition;
      
      const conditionScores = {
        'Excellent': 100,
        'Good': 80,
        'Fair': 60,
        'Poor': 30
      };

      const score1 = conditionScores[condition1] || 50;
      const score2 = conditionScores[condition2] || 50;
      
      comparison.comparison.conditionChange = {
        from: condition1,
        to: condition2,
        scoreChange: score2 - score1,
        improved: score2 > score1
      };

      // Compare issues
      const issues1 = comparison.photo1.ai_analysis.damages?.totalIssues || 0;
      const issues2 = comparison.photo2.ai_analysis.damages?.totalIssues || 0;
      
      comparison.comparison.issuesChange = {
        from: issues1,
        to: issues2,
        change: issues2 - issues1,
        improved: issues2 < issues1
      };
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing photos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare photos'
    });
  }
});

// GET /api/equipment/:id/photo-stats - Get photo statistics
router.get('/:id/photo-stats', async (req, res) => {
  try {
    const equipmentId = req.params.id;

    const statsSql = `
      SELECT 
        COUNT(*) as total_photos,
        COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as analyzed_photos,
        COUNT(CASE WHEN task_id IS NOT NULL THEN 1 END) as maintenance_photos,
        COUNT(CASE WHEN json_extract(ai_analysis, '$.assessment.priority') = 'High' THEN 1 END) as critical_photos,
        MIN(upload_date) as first_photo,
        MAX(upload_date) as last_photo,
        AVG(CAST(file_size AS FLOAT)) as avg_file_size,
        SUM(CAST(file_size AS FLOAT)) as total_storage
      FROM Photos
      WHERE equipment_id = ?
    `;

    const stats = await runQuerySingle(statsSql, [equipmentId]);

    // Get monthly photo count
    const monthlySql = `
      SELECT 
        strftime('%Y-%m', upload_date) as month,
        COUNT(*) as count
      FROM Photos
      WHERE equipment_id = ?
      GROUP BY strftime('%Y-%m', upload_date)
      ORDER BY month DESC
      LIMIT 12
    `;

    const monthlyStats = await runQuery(monthlySql, [equipmentId]);

    res.json({
      success: true,
      data: {
        ...stats,
        monthlyStats,
        avgFileSizeKB: Math.round((stats.avg_file_size || 0) / 1024),
        totalStorageMB: Math.round((stats.total_storage || 0) / (1024 * 1024) * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching photo stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo statistics'
    });
  }
});

module.exports = router; 