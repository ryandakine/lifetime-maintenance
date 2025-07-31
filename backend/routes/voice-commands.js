const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Database connection
const dbPath = path.join(__dirname, '../database/maintenance.db')
const db = new sqlite3.Database(dbPath)

// Log voice command interaction
router.post('/log', async (req, res) => {
  try {
    const {
      command_text,
      action_type,
      parameters,
      confidence,
      success,
      processing_time_ms,
      user_id,
      session_id,
      device_info,
      browser_info
    } = req.body

    if (!command_text) {
      return res.status(400).json({ error: 'Command text is required' })
    }

    const sql = `
      INSERT INTO voice_commands (
        command_text, action_type, parameters, confidence, success,
        processing_time_ms, user_id, session_id, device_info, browser_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      command_text,
      action_type || null,
      parameters ? JSON.stringify(parameters) : null,
      confidence || 0.0,
      success !== undefined ? success : true,
      processing_time_ms || null,
      user_id || 'anonymous',
      session_id || null,
      device_info || null,
      browser_info || null
    ]

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error logging voice command:', err)
        return res.status(500).json({ error: 'Failed to log voice command' })
      }

      res.json({
        success: true,
        id: this.lastID,
        message: 'Voice command logged successfully'
      })
    })

  } catch (error) {
    console.error('Error in voice command logging:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get voice command history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0, user_id, action_type, success } = req.query

    let sql = 'SELECT * FROM voice_commands WHERE 1=1'
    const params = []

    if (user_id) {
      sql += ' AND user_id = ?'
      params.push(user_id)
    }

    if (action_type) {
      sql += ' AND action_type = ?'
      params.push(action_type)
    }

    if (success !== undefined) {
      sql += ' AND success = ?'
      params.push(success === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error fetching voice history:', err)
        return res.status(500).json({ error: 'Failed to fetch voice history' })
      }

      // Parse parameters JSON
      const commands = rows.map(row => ({
        ...row,
        parameters: row.parameters ? JSON.parse(row.parameters) : null,
        success: Boolean(row.success)
      }))

      res.json({
        success: true,
        commands,
        total: commands.length
      })
    })

  } catch (error) {
    console.error('Error fetching voice history:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get voice analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query

    const sql = `
      SELECT 
        date,
        total_commands,
        successful_commands,
        failed_commands,
        average_confidence,
        average_processing_time_ms,
        most_used_actions,
        unique_users
      FROM voice_analytics 
      WHERE date >= date('now', '-${days} days')
      ORDER BY date DESC
    `

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error fetching voice analytics:', err)
        return res.status(500).json({ error: 'Failed to fetch voice analytics' })
      }

      // Parse most_used_actions JSON
      const analytics = rows.map(row => ({
        ...row,
        most_used_actions: row.most_used_actions ? JSON.parse(row.most_used_actions) : [],
        success_rate: row.total_commands > 0 ? (row.successful_commands / row.total_commands * 100).toFixed(1) : 0
      }))

      res.json({
        success: true,
        analytics,
        summary: {
          total_commands: analytics.reduce((sum, day) => sum + day.total_commands, 0),
          total_successful: analytics.reduce((sum, day) => sum + day.successful_commands, 0),
          total_failed: analytics.reduce((sum, day) => sum + day.failed_commands, 0),
          average_confidence: analytics.length > 0 ? (analytics.reduce((sum, day) => sum + day.average_confidence, 0) / analytics.length).toFixed(2) : 0
        }
      })
    })

  } catch (error) {
    console.error('Error fetching voice analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get most used commands
router.get('/most-used', async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query

    const sql = `
      SELECT 
        action_type,
        COUNT(*) as usage_count,
        AVG(confidence) as avg_confidence,
        AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate
      FROM voice_commands 
      WHERE created_at >= date('now', '-${days} days')
        AND action_type IS NOT NULL
      GROUP BY action_type
      ORDER BY usage_count DESC
      LIMIT ?
    `

    db.all(sql, [parseInt(limit)], (err, rows) => {
      if (err) {
        console.error('Error fetching most used commands:', err)
        return res.status(500).json({ error: 'Failed to fetch most used commands' })
      }

      const commands = rows.map(row => ({
        ...row,
        success_rate: (row.success_rate * 100).toFixed(1),
        avg_confidence: (row.avg_confidence * 100).toFixed(1)
      }))

      res.json({
        success: true,
        commands
      })
    })

  } catch (error) {
    console.error('Error fetching most used commands:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add custom voice command
router.post('/custom', async (req, res) => {
  try {
    const {
      user_id,
      command_phrase,
      action_type,
      action_parameters
    } = req.body

    if (!command_phrase || !action_type) {
      return res.status(400).json({ error: 'Command phrase and action type are required' })
    }

    const sql = `
      INSERT INTO voice_custom_commands (
        user_id, command_phrase, action_type, action_parameters
      ) VALUES (?, ?, ?, ?)
    `

    const params = [
      user_id || 'anonymous',
      command_phrase.toLowerCase(),
      action_type,
      action_parameters ? JSON.stringify(action_parameters) : null
    ]

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error adding custom command:', err)
        return res.status(500).json({ error: 'Failed to add custom command' })
      }

      res.json({
        success: true,
        id: this.lastID,
        message: 'Custom command added successfully'
      })
    })

  } catch (error) {
    console.error('Error adding custom command:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get custom commands
router.get('/custom', async (req, res) => {
  try {
    const { user_id } = req.query

    let sql = 'SELECT * FROM voice_custom_commands WHERE is_active = 1'
    const params = []

    if (user_id) {
      sql += ' AND user_id = ?'
      params.push(user_id)
    }

    sql += ' ORDER BY usage_count DESC, created_at DESC'

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error fetching custom commands:', err)
        return res.status(500).json({ error: 'Failed to fetch custom commands' })
      }

      const commands = rows.map(row => ({
        ...row,
        action_parameters: row.action_parameters ? JSON.parse(row.action_parameters) : null
      }))

      res.json({
        success: true,
        commands
      })
    })

  } catch (error) {
    console.error('Error fetching custom commands:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update custom command usage
router.put('/custom/:id/usage', async (req, res) => {
  try {
    const { id } = req.params

    const sql = `
      UPDATE voice_custom_commands 
      SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    db.run(sql, [id], function(err) {
      if (err) {
        console.error('Error updating custom command usage:', err)
        return res.status(500).json({ error: 'Failed to update usage' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Custom command not found' })
      }

      res.json({
        success: true,
        message: 'Usage updated successfully'
      })
    })

  } catch (error) {
    console.error('Error updating custom command usage:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add training data
router.post('/training', async (req, res) => {
  try {
    const {
      command_text,
      expected_action,
      expected_parameters,
      user_feedback,
      training_session_id,
      accuracy_score
    } = req.body

    if (!command_text || !expected_action) {
      return res.status(400).json({ error: 'Command text and expected action are required' })
    }

    const sql = `
      INSERT INTO voice_training_data (
        command_text, expected_action, expected_parameters,
        user_feedback, training_session_id, accuracy_score
      ) VALUES (?, ?, ?, ?, ?, ?)
    `

    const params = [
      command_text,
      expected_action,
      expected_parameters ? JSON.stringify(expected_parameters) : null,
      user_feedback || null,
      training_session_id || null,
      accuracy_score || 0.0
    ]

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error adding training data:', err)
        return res.status(500).json({ error: 'Failed to add training data' })
      }

      res.json({
        success: true,
        id: this.lastID,
        message: 'Training data added successfully'
      })
    })

  } catch (error) {
    console.error('Error adding training data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get training data
router.get('/training', async (req, res) => {
  try {
    const { limit = 100, training_session_id } = req.query

    let sql = 'SELECT * FROM voice_training_data'
    const params = []

    if (training_session_id) {
      sql += ' WHERE training_session_id = ?'
      params.push(training_session_id)
    }

    sql += ' ORDER BY created_at DESC LIMIT ?'
    params.push(parseInt(limit))

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error fetching training data:', err)
        return res.status(500).json({ error: 'Failed to fetch training data' })
      }

      const trainingData = rows.map(row => ({
        ...row,
        expected_parameters: row.expected_parameters ? JSON.parse(row.expected_parameters) : null
      }))

      res.json({
        success: true,
        training_data: trainingData
      })
    })

  } catch (error) {
    console.error('Error fetching training data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Export voice data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', days = 30 } = req.query

    const sql = `
      SELECT 
        vc.*,
        vcc.command_phrase as custom_command,
        vtd.expected_action as training_expected_action
      FROM voice_commands vc
      LEFT JOIN voice_custom_commands vcc ON vc.action_type = vcc.action_type
      LEFT JOIN voice_training_data vtd ON vc.command_text = vtd.command_text
      WHERE vc.created_at >= date('now', '-${days} days')
      ORDER BY vc.created_at DESC
    `

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error exporting voice data:', err)
        return res.status(500).json({ error: 'Failed to export voice data' })
      }

      const exportData = {
        export_date: new Date().toISOString(),
        days_exported: parseInt(days),
        total_records: rows.length,
        voice_commands: rows.map(row => ({
          ...row,
          parameters: row.parameters ? JSON.parse(row.parameters) : null,
          success: Boolean(row.success)
        }))
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(exportData.voice_commands)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="voice-data-${new Date().toISOString().split('T')[0]}.csv"`)
        res.send(csv)
      } else {
        res.json({
          success: true,
          data: exportData
        })
      }
    })

  } catch (error) {
    console.error('Error exporting voice data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return `"${String(value || '').replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

module.exports = router 