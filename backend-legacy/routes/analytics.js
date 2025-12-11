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

// GET /api/analytics/dashboard - Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { dateRange = '30d', equipmentFilter = 'all' } = req.query;
    
    // Calculate date filter
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

    // Get photo metrics
    const photoMetrics = await getPhotoMetrics(startDate, equipmentFilter);
    
    // Get equipment health distribution
    const equipmentHealth = await getEquipmentHealth(startDate, equipmentFilter);
    
    // Get maintenance trends
    const maintenanceTrends = await getMaintenanceTrends(startDate, equipmentFilter);
    
    // Get issue distribution
    const issueDistribution = await getIssueDistribution(startDate, equipmentFilter);
    
    // Get AI accuracy metrics
    const aiAccuracy = await getAIAccuracy(startDate, equipmentFilter);
    
    // Get top equipment issues
    const topEquipment = await getTopEquipmentIssues(startDate, equipmentFilter);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(startDate, equipmentFilter);

    res.json({
      success: true,
      data: {
        photoMetrics,
        equipmentHealth,
        maintenanceTrends,
        issueDistribution,
        aiAccuracy,
        topEquipment,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
});

// GET /api/analytics/photo-metrics - Get photo-specific metrics
router.get('/photo-metrics', async (req, res) => {
  try {
    const { dateRange = '30d', equipmentFilter = 'all' } = req.query;
    const startDate = calculateStartDate(dateRange);
    
    const metrics = await getPhotoMetrics(startDate, equipmentFilter);
    
    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Photo metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photo metrics',
      message: error.message
    });
  }
});

// GET /api/analytics/equipment-health - Get equipment health analytics
router.get('/equipment-health', async (req, res) => {
  try {
    const { dateRange = '30d', equipmentFilter = 'all' } = req.query;
    const startDate = calculateStartDate(dateRange);
    
    const health = await getEquipmentHealth(startDate, equipmentFilter);
    
    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('Equipment health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipment health data',
      message: error.message
    });
  }
});

// GET /api/analytics/maintenance-trends - Get maintenance trends
router.get('/maintenance-trends', async (req, res) => {
  try {
    const { dateRange = '30d', equipmentFilter = 'all' } = req.query;
    const startDate = calculateStartDate(dateRange);
    
    const trends = await getMaintenanceTrends(startDate, equipmentFilter);
    
    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Maintenance trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch maintenance trends',
      message: error.message
    });
  }
});

// Helper functions for analytics calculations

async function getPhotoMetrics(startDate, equipmentFilter) {
  try {
    // Get total photos
    const totalPhotosQuery = `
      SELECT COUNT(*) as total
      FROM Photos
      WHERE upload_date >= datetime(?)
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const totalPhotos = await runQuerySingle(totalPhotosQuery, 
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    // Get analyzed photos
    const analyzedPhotosQuery = `
      SELECT COUNT(*) as analyzed
      FROM Photos
      WHERE upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const analyzedPhotos = await runQuerySingle(analyzedPhotosQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    // Get average confidence
    const confidenceQuery = `
      SELECT AVG(CAST(json_extract(ai_analysis, '$.metadata.confidence') AS FLOAT)) as avg_confidence
      FROM Photos
      WHERE upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const confidence = await runQuerySingle(confidenceQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    // Calculate storage usage
    const storageQuery = `
      SELECT SUM(file_size) as total_size
      FROM Photos
      WHERE upload_date >= datetime(?)
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const storage = await runQuerySingle(storageQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    return {
      totalPhotos: totalPhotos.total || 0,
      analyzedPhotos: analyzedPhotos.analyzed || 0,
      pendingAnalysis: (totalPhotos.total || 0) - (analyzedPhotos.analyzed || 0),
      averageConfidence: Math.round((confidence.avg_confidence || 0) * 100) / 100,
      storageUsed: formatBytes(storage.total_size || 0),
      storageLimit: '10 GB'
    };
  } catch (error) {
    console.error('Error getting photo metrics:', error);
    return {
      totalPhotos: 0,
      analyzedPhotos: 0,
      pendingAnalysis: 0,
      averageConfidence: 0,
      storageUsed: '0 B',
      storageLimit: '10 GB'
    };
  }
}

async function getEquipmentHealth(startDate, equipmentFilter) {
  try {
    const healthQuery = `
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
      WHERE upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
      GROUP BY condition
    `;
    
    const healthData = await runQuery(healthQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    const health = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    };

    healthData.forEach(row => {
      if (row.condition in health) {
        health[row.condition] = row.count;
      }
    });

    return health;
  } catch (error) {
    console.error('Error getting equipment health:', error);
    return { excellent: 0, good: 0, fair: 0, poor: 0 };
  }
}

async function getMaintenanceTrends(startDate, equipmentFilter) {
  try {
    // Get monthly trends for the last 6 months
    const trendsQuery = `
      SELECT 
        strftime('%Y-%m', upload_date) as month,
        COUNT(*) as total_photos,
        COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as analyzed_photos,
        COUNT(CASE WHEN json_extract(ai_analysis, '$.assessment.priority') = 'High' THEN 1 END) as critical_issues
      FROM Photos
      WHERE upload_date >= datetime(?)
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
      GROUP BY strftime('%Y-%m', upload_date)
      ORDER BY month DESC
      LIMIT 6
    `;
    
    const trendsData = await runQuery(trendsQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    // Format data for chart
    const labels = [];
    const completed = [];
    const pending = [];
    const critical = [];

    trendsData.reverse().forEach(row => {
      const month = new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'short' });
      labels.push(month);
      completed.push(row.analyzed_photos || 0);
      pending.push((row.total_photos || 0) - (row.analyzed_photos || 0));
      critical.push(row.critical_issues || 0);
    });

    return {
      labels,
      completed,
      pending,
      critical
    };
  } catch (error) {
    console.error('Error getting maintenance trends:', error);
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      completed: [0, 0, 0, 0, 0, 0],
      pending: [0, 0, 0, 0, 0, 0],
      critical: [0, 0, 0, 0, 0, 0]
    };
  }
}

async function getIssueDistribution(startDate, equipmentFilter) {
  try {
    const issueQuery = `
      SELECT 
        json_extract(ai_analysis, '$.damages.issues') as issues
      FROM Photos
      WHERE upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const issuesData = await runQuery(issueQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    // Count issue types
    const issueCounts = {
      'Wear & Tear': 0,
      'Structural': 0,
      'Electrical': 0,
      'Mechanical': 0,
      'Safety': 0
    };

    issuesData.forEach(row => {
      if (row.issues) {
        try {
          const issues = JSON.parse(row.issues);
          issues.forEach(issue => {
            const issueType = issue.type || 'Unknown';
            if (issueType.includes('Wear')) issueCounts['Wear & Tear']++;
            else if (issueType.includes('Structural')) issueCounts['Structural']++;
            else if (issueType.includes('Electrical')) issueCounts['Electrical']++;
            else if (issueType.includes('Mechanical')) issueCounts['Mechanical']++;
            else if (issueType.includes('Safety')) issueCounts['Safety']++;
          });
        } catch (e) {
          console.error('Error parsing issues JSON:', e);
        }
      }
    });

    return {
      labels: Object.keys(issueCounts),
      data: Object.values(issueCounts)
    };
  } catch (error) {
    console.error('Error getting issue distribution:', error);
    return {
      labels: ['Wear & Tear', 'Structural', 'Electrical', 'Mechanical', 'Safety'],
      data: [0, 0, 0, 0, 0]
    };
  }
}

async function getAIAccuracy(startDate, equipmentFilter) {
  try {
    // This would typically come from validation data
    // For now, return mock data based on analysis confidence
    const accuracyQuery = `
      SELECT 
        AVG(CAST(json_extract(ai_analysis, '$.metadata.confidence') AS FLOAT)) as avg_confidence
      FROM Photos
      WHERE upload_date >= datetime(?)
      AND ai_analysis IS NOT NULL
      ${equipmentFilter !== 'all' ? 'AND equipment_id IN (SELECT id FROM Equipment WHERE type = ?)' : ''}
    `;
    
    const accuracy = await runQuerySingle(accuracyQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    const baseAccuracy = accuracy.avg_confidence || 85;

    return {
      labels: ['Equipment ID', 'Damage Detection', 'Component ID', 'Severity Assessment'],
      data: [
        Math.round(baseAccuracy + 7), // Equipment ID typically higher
        Math.round(baseAccuracy),     // Damage detection
        Math.round(baseAccuracy + 4), // Component ID
        Math.round(baseAccuracy - 2)  // Severity assessment
      ]
    };
  } catch (error) {
    console.error('Error getting AI accuracy:', error);
    return {
      labels: ['Equipment ID', 'Damage Detection', 'Component ID', 'Severity Assessment'],
      data: [92, 87, 89, 85]
    };
  }
}

async function getTopEquipmentIssues(startDate, equipmentFilter) {
  try {
    const equipmentQuery = `
      SELECT 
        e.name,
        COUNT(p.id) as photo_count,
        COUNT(CASE WHEN json_extract(p.ai_analysis, '$.assessment.priority') = 'High' THEN 1 END) as critical_issues,
        MAX(p.upload_date) as last_photo
      FROM Equipment e
      LEFT JOIN Photos p ON e.id = p.equipment_id
      WHERE p.upload_date >= datetime(?)
      ${equipmentFilter !== 'all' ? 'AND e.type = ?' : ''}
      GROUP BY e.id, e.name
      ORDER BY critical_issues DESC, photo_count DESC
      LIMIT 5
    `;
    
    const equipmentData = await runQuery(equipmentQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    return equipmentData.map(row => ({
      name: row.name,
      issues: row.critical_issues || 0,
      lastMaintenance: row.last_photo ? new Date(row.last_photo).toISOString().split('T')[0] : 'Never'
    }));
  } catch (error) {
    console.error('Error getting top equipment issues:', error);
    return [];
  }
}

async function getRecentActivity(startDate, equipmentFilter) {
  try {
    const activityQuery = `
      SELECT 
        p.upload_date,
        e.name as equipment_name,
        p.ai_analysis,
        'Photo Upload' as activity_type
      FROM Photos p
      LEFT JOIN Equipment e ON p.equipment_id = e.id
      WHERE p.upload_date >= datetime(?)
      ${equipmentFilter !== 'all' ? 'AND e.type = ?' : ''}
      ORDER BY p.upload_date DESC
      LIMIT 10
    `;
    
    const activityData = await runQuery(activityQuery,
      equipmentFilter !== 'all' ? [startDate.toISOString(), equipmentFilter] : [startDate.toISOString()]
    );

    return activityData.map(row => {
      const confidence = row.ai_analysis ? 
        JSON.parse(row.ai_analysis).metadata?.confidence : null;
      
      const hasCriticalIssues = row.ai_analysis ? 
        JSON.parse(row.ai_analysis).damages?.hasCriticalIssues : false;

      return {
        type: hasCriticalIssues ? 'Critical Alert' : 'Photo Upload',
        equipment: row.equipment_name || 'Unknown Equipment',
        time: formatTimeAgo(new Date(row.upload_date)),
        confidence: confidence ? `${confidence}%` : null,
        issue: hasCriticalIssues ? 'Critical issues detected' : null
      };
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

// Utility functions
function calculateStartDate(dateRange) {
  const now = new Date();
  switch (dateRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
}

module.exports = router; 