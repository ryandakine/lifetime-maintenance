const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class WorkflowAutomationService {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/maintenance.db');
    this.db = new sqlite3.Database(this.dbPath);
    
    // Workflow rules configuration
    this.rules = {
      criticalIssues: {
        condition: (analysis) => analysis.damages?.hasCriticalIssues || analysis.assessment?.priority === 'Critical',
        action: 'create_urgent_task',
        priority: 'Critical',
        timeToComplete: '4 hours',
        autoAssign: true
      },
      safetyRisks: {
        condition: (analysis) => analysis.damages?.hasSafetyRisks || analysis.assessment?.overallCondition === 'Poor',
        action: 'create_safety_task',
        priority: 'High',
        timeToComplete: '2 hours',
        autoAssign: true
      },
      componentReplacement: {
        condition: (analysis) => analysis.components?.needsReplacement > 0,
        action: 'create_replacement_task',
        priority: 'High',
        timeToComplete: '6 hours',
        autoAssign: false
      },
      routineMaintenance: {
        condition: (analysis) => analysis.assessment?.overallCondition === 'Good' && analysis.damages?.totalIssues > 0,
        action: 'create_maintenance_task',
        priority: 'Medium',
        timeToComplete: '1 hour',
        autoAssign: false
      },
      preventiveMaintenance: {
        condition: (analysis) => analysis.assessment?.overallCondition === 'Excellent' && analysis.components?.needsAttention > 0,
        action: 'create_preventive_task',
        priority: 'Low',
        timeToComplete: '30 minutes',
        autoAssign: false
      }
    };

    // Equipment-specific maintenance schedules
    this.maintenanceSchedules = {
      'Treadmill': {
        routine: 'weekly',
        preventive: 'monthly',
        inspection: 'daily'
      },
      'Elliptical': {
        routine: 'weekly',
        preventive: 'monthly',
        inspection: 'daily'
      },
      'Weight Machine': {
        routine: 'bi-weekly',
        preventive: 'monthly',
        inspection: 'weekly'
      },
      'Exercise Bike': {
        routine: 'weekly',
        preventive: 'monthly',
        inspection: 'daily'
      }
    };

    // Task templates
    this.taskTemplates = {
      create_urgent_task: {
        title: 'URGENT: Critical Equipment Issue',
        description: 'Critical issue detected requiring immediate attention',
        category: 'Emergency',
        estimatedTime: '4 hours'
      },
      create_safety_task: {
        title: 'SAFETY: Equipment Safety Risk',
        description: 'Safety risk detected requiring immediate resolution',
        category: 'Safety',
        estimatedTime: '2 hours'
      },
      create_replacement_task: {
        title: 'REPLACEMENT: Component Replacement Required',
        description: 'Component replacement needed based on analysis',
        category: 'Repair',
        estimatedTime: '6 hours'
      },
      create_maintenance_task: {
        title: 'MAINTENANCE: Routine Maintenance Required',
        description: 'Routine maintenance needed based on analysis',
        category: 'Maintenance',
        estimatedTime: '1 hour'
      },
      create_preventive_task: {
        title: 'PREVENTIVE: Preventive Maintenance',
        description: 'Preventive maintenance to avoid future issues',
        category: 'Preventive',
        estimatedTime: '30 minutes'
      }
    };
  }

  /**
   * Process photo analysis and generate tasks automatically
   * @param {Object} analysis - AI analysis results
   * @param {Object} context - Additional context (equipment, location, etc.)
   * @returns {Promise<Array>} Generated tasks
   */
  async processPhotoAnalysis(analysis, context = {}) {
    try {
      console.log('🔄 Processing photo analysis for workflow automation...');
      
      const generatedTasks = [];
      const triggeredRules = [];

      // Evaluate each rule
      for (const [ruleName, rule] of Object.entries(this.rules)) {
        if (rule.condition(analysis)) {
          console.log(`✅ Rule triggered: ${ruleName}`);
          triggeredRules.push(ruleName);
          
          const task = await this.generateTask(rule, analysis, context);
          if (task) {
            generatedTasks.push(task);
          }
        }
      }

      // Generate scheduled maintenance tasks
      const scheduledTasks = await this.generateScheduledTasks(analysis, context);
      generatedTasks.push(...scheduledTasks);

      // Create task dependencies if multiple tasks generated
      if (generatedTasks.length > 1) {
        await this.createTaskDependencies(generatedTasks);
      }

      // Send notifications
      await this.sendNotifications(generatedTasks, context);

      console.log(`✅ Generated ${generatedTasks.length} tasks from photo analysis`);
      
      return {
        success: true,
        tasks: generatedTasks,
        triggeredRules,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Workflow automation error:', error);
      return {
        success: false,
        error: error.message,
        tasks: [],
        triggeredRules: []
      };
    }
  }

  /**
   * Generate a task based on a triggered rule
   */
  async generateTask(rule, analysis, context) {
    try {
      const template = this.taskTemplates[rule.action];
      if (!template) {
        console.warn(`⚠️ No template found for action: ${rule.action}`);
        return null;
      }

      // Generate task details
      const taskDetails = this.generateTaskDetails(template, analysis, context);
      
      // Create task in database
      const taskId = await this.createTaskInDatabase(taskDetails);
      
      if (taskId) {
        // Auto-assign if configured
        if (rule.autoAssign) {
          await this.autoAssignTask(taskId, context);
        }

        // Link to photo analysis
        await this.linkTaskToPhoto(taskId, context.photoId);

        return {
          id: taskId,
          ...taskDetails,
          rule: rule.action,
          priority: rule.priority,
          autoAssigned: rule.autoAssign
        };
      }

      return null;
    } catch (error) {
      console.error('Error generating task:', error);
      return null;
    }
  }

  /**
   * Generate task details from template and analysis
   */
  generateTaskDetails(template, analysis, context) {
    const equipment = analysis.equipment?.type || context.equipmentType || 'Unknown Equipment';
    const location = context.location || 'Unknown Location';
    
    let title = template.title;
    let description = template.description;
    
    // Customize based on analysis results
    if (analysis.damages?.hasCriticalIssues) {
      title = `URGENT: Critical Issue - ${equipment}`;
      description = `Critical issue detected on ${equipment} at ${location}. Immediate attention required.`;
      
      if (analysis.damages.issues && analysis.damages.issues.length > 0) {
        const criticalIssues = analysis.damages.issues.filter(issue => issue.severity === 'Critical');
        if (criticalIssues.length > 0) {
          description += `\n\nCritical Issues:\n${criticalIssues.map(issue => `- ${issue.type}: ${issue.description}`).join('\n')}`;
        }
      }
    } else if (analysis.damages?.hasSafetyRisks) {
      title = `SAFETY: Safety Risk - ${equipment}`;
      description = `Safety risk detected on ${equipment} at ${location}. Safety inspection required.`;
      
      const safetyIssues = analysis.damages.issues.filter(issue => issue.safetyRisk);
      if (safetyIssues.length > 0) {
        description += `\n\nSafety Issues:\n${safetyIssues.map(issue => `- ${issue.type}: ${issue.description}`).join('\n')}`;
      }
    } else if (analysis.components?.needsReplacement > 0) {
      title = `REPLACEMENT: Component Replacement - ${equipment}`;
      description = `Component replacement needed on ${equipment} at ${location}.`;
      
      const replacementComponents = analysis.components.identified.filter(comp => comp.maintenanceStatus === 'replace');
      if (replacementComponents.length > 0) {
        description += `\n\nComponents to Replace:\n${replacementComponents.map(comp => `- ${comp.name}: ${comp.notes}`).join('\n')}`;
      }
    } else if (analysis.assessment?.overallCondition === 'Good' && analysis.damages?.totalIssues > 0) {
      title = `MAINTENANCE: Routine Maintenance - ${equipment}`;
      description = `Routine maintenance needed on ${equipment} at ${location}.`;
      
      if (analysis.assessment.maintenanceRecommendations) {
        description += `\n\nRecommendations:\n${analysis.assessment.maintenanceRecommendations.map(rec => `- ${rec}`).join('\n')}`;
      }
    } else {
      title = `PREVENTIVE: Preventive Maintenance - ${equipment}`;
      description = `Preventive maintenance recommended for ${equipment} at ${location}.`;
      
      if (analysis.assessment.maintenanceRecommendations) {
        description += `\n\nRecommendations:\n${analysis.assessment.maintenanceRecommendations.map(rec => `- ${rec}`).join('\n')}`;
      }
    }

    // Add parts needed
    if (analysis.assessment?.partsNeeded && analysis.assessment.partsNeeded.length > 0) {
      description += `\n\nParts Needed:\n${analysis.assessment.partsNeeded.map(part => `- ${part}`).join('\n')}`;
    }

    // Add estimated repair time
    if (analysis.assessment?.estimatedRepairTime) {
      description += `\n\nEstimated Time: ${analysis.assessment.estimatedRepairTime}`;
    }

    return {
      title,
      description,
      category: template.category,
      priority: this.determinePriority(analysis),
      estimatedTime: template.estimatedTime,
      equipmentId: context.equipmentId,
      location: location,
      status: 'pending',
      creationDate: new Date().toISOString()
    };
  }

  /**
   * Determine task priority based on analysis
   */
  determinePriority(analysis) {
    if (analysis.damages?.hasCriticalIssues) return 'Critical';
    if (analysis.damages?.hasSafetyRisks) return 'High';
    if (analysis.components?.needsReplacement > 0) return 'High';
    if (analysis.assessment?.overallCondition === 'Good') return 'Medium';
    return 'Low';
  }

  /**
   * Generate scheduled maintenance tasks
   */
  async generateScheduledTasks(analysis, context) {
    try {
      const equipmentType = analysis.equipment?.type || context.equipmentType;
      const schedule = this.maintenanceSchedules[equipmentType];
      
      if (!schedule) {
        return [];
      }

      const scheduledTasks = [];
      const now = new Date();
      const lastMaintenance = await this.getLastMaintenanceDate(context.equipmentId);

      // Check if routine maintenance is due
      if (this.isMaintenanceDue(lastMaintenance, schedule.routine)) {
        const routineTask = await this.createScheduledTask('routine', equipmentType, context);
        if (routineTask) scheduledTasks.push(routineTask);
      }

      // Check if preventive maintenance is due
      if (this.isMaintenanceDue(lastMaintenance, schedule.preventive)) {
        const preventiveTask = await this.createScheduledTask('preventive', equipmentType, context);
        if (preventiveTask) scheduledTasks.push(preventiveTask);
      }

      return scheduledTasks;
    } catch (error) {
      console.error('Error generating scheduled tasks:', error);
      return [];
    }
  }

  /**
   * Check if maintenance is due based on schedule
   */
  isMaintenanceDue(lastMaintenance, schedule) {
    if (!lastMaintenance) return true;
    
    const now = new Date();
    const lastDate = new Date(lastMaintenance);
    const daysSinceLast = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    switch (schedule) {
      case 'daily': return daysSinceLast >= 1;
      case 'weekly': return daysSinceLast >= 7;
      case 'bi-weekly': return daysSinceLast >= 14;
      case 'monthly': return daysSinceLast >= 30;
      default: return false;
    }
  }

  /**
   * Create a scheduled maintenance task
   */
  async createScheduledTask(type, equipmentType, context) {
    const templates = {
      routine: {
        title: `SCHEDULED: Routine Maintenance - ${equipmentType}`,
        description: `Scheduled routine maintenance for ${equipmentType}`,
        category: 'Scheduled',
        priority: 'Medium',
        estimatedTime: '1 hour'
      },
      preventive: {
        title: `SCHEDULED: Preventive Maintenance - ${equipmentType}`,
        description: `Scheduled preventive maintenance for ${equipmentType}`,
        category: 'Scheduled',
        priority: 'Low',
        estimatedTime: '30 minutes'
      }
    };

    const template = templates[type];
    if (!template) return null;

    const taskDetails = {
      ...template,
      equipmentId: context.equipmentId,
      location: context.location || 'Unknown',
      status: 'pending',
      creationDate: new Date().toISOString(),
      isScheduled: true,
      scheduleType: type
    };

    const taskId = await this.createTaskInDatabase(taskDetails);
    if (taskId) {
      return {
        id: taskId,
        ...taskDetails
      };
    }

    return null;
  }

  /**
   * Create task in database
   */
  async createTaskInDatabase(taskDetails) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Tasks (title, description, status, priority, category, equipment_id, location, estimated_time, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime(?))
      `;
      
      const params = [
        taskDetails.title,
        taskDetails.description,
        taskDetails.status,
        taskDetails.priority,
        taskDetails.category,
        taskDetails.equipmentId,
        taskDetails.location,
        taskDetails.estimatedTime,
        taskDetails.creationDate
      ];

      this.db.run(query, params, function(err) {
        if (err) {
          console.error('Error creating task:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Auto-assign task to available technician
   */
  async autoAssignTask(taskId, context) {
    try {
      // Get available technicians (simplified - in real system would check availability, skills, etc.)
      const technicians = await this.getAvailableTechnicians();
      
      if (technicians.length > 0) {
        // Simple assignment logic - could be more sophisticated
        const assignedTechnician = technicians[0];
        
        await this.assignTaskToTechnician(taskId, assignedTechnician.id);
        
        console.log(`✅ Auto-assigned task ${taskId} to ${assignedTechnician.name}`);
        return assignedTechnician;
      }
      
      return null;
    } catch (error) {
      console.error('Error auto-assigning task:', error);
      return null;
    }
  }

  /**
   * Get available technicians
   */
  async getAvailableTechnicians() {
    return new Promise((resolve, reject) => {
      // Simplified - in real system would check availability, skills, workload
      const query = 'SELECT id, name, email FROM Technicians WHERE status = "available" LIMIT 5';
      
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Assign task to technician
   */
  async assignTaskToTechnician(taskId, technicianId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Tasks SET assigned_to = ?, assignment_date = datetime("now") WHERE id = ?';
      
      this.db.run(query, [technicianId, taskId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Link task to photo
   */
  async linkTaskToPhoto(taskId, photoId) {
    if (!photoId) return;
    
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Photos SET task_id = ? WHERE id = ?';
      
      this.db.run(query, [taskId, photoId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Create task dependencies
   */
  async createTaskDependencies(tasks) {
    try {
      // Sort tasks by priority (Critical > High > Medium > Low)
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      // Create dependencies (higher priority tasks block lower priority ones)
      for (let i = 0; i < tasks.length - 1; i++) {
        const currentTask = tasks[i];
        const nextTask = tasks[i + 1];
        
        if (priorityOrder[currentTask.priority] > priorityOrder[nextTask.priority]) {
          await this.addTaskDependency(nextTask.id, currentTask.id);
        }
      }
    } catch (error) {
      console.error('Error creating task dependencies:', error);
    }
  }

  /**
   * Add task dependency
   */
  async addTaskDependency(taskId, dependsOnTaskId) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO TaskDependencies (task_id, depends_on_task_id) VALUES (?, ?)';
      
      this.db.run(query, [taskId, dependsOnTaskId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Send notifications for generated tasks
   */
  async sendNotifications(tasks, context) {
    try {
      for (const task of tasks) {
        if (task.priority === 'Critical' || task.priority === 'High') {
          await this.sendUrgentNotification(task, context);
        } else {
          await this.sendStandardNotification(task, context);
        }
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  /**
   * Send urgent notification
   */
  async sendUrgentNotification(task, context) {
    console.log(`🚨 URGENT NOTIFICATION: ${task.title}`);
    console.log(`   Equipment: ${context.equipmentType || 'Unknown'}`);
    console.log(`   Location: ${context.location || 'Unknown'}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Estimated Time: ${task.estimatedTime}`);
    
    // In real system, would send email/SMS/push notification
    // For now, just log the notification
  }

  /**
   * Send standard notification
   */
  async sendStandardNotification(task, context) {
    console.log(`📧 NOTIFICATION: ${task.title}`);
    console.log(`   Equipment: ${context.equipmentType || 'Unknown'}`);
    console.log(`   Priority: ${task.priority}`);
    
    // In real system, would send email notification
    // For now, just log the notification
  }

  /**
   * Get last maintenance date for equipment
   */
  async getLastMaintenanceDate(equipmentId) {
    if (!equipmentId) return null;
    
    return new Promise((resolve, reject) => {
      const query = `
        SELECT MAX(completion_date) as last_maintenance
        FROM Tasks
        WHERE equipment_id = ? AND status = 'completed' AND category IN ('Maintenance', 'Repair')
      `;
      
      this.db.get(query, [equipmentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.last_maintenance || null);
        }
      });
    });
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(dateRange = '30d') {
    try {
      const startDate = this.calculateStartDate(dateRange);
      
      const stats = await Promise.all([
        this.getTasksGenerated(startDate),
        this.getTasksCompleted(startDate),
        this.getAverageCompletionTime(startDate),
        this.getPriorityDistribution(startDate)
      ]);

      return {
        tasksGenerated: stats[0],
        tasksCompleted: stats[1],
        averageCompletionTime: stats[2],
        priorityDistribution: stats[3],
        automationEfficiency: this.calculateEfficiency(stats[0], stats[1])
      };
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      return null;
    }
  }

  /**
   * Calculate automation efficiency
   */
  calculateEfficiency(generated, completed) {
    if (generated === 0) return 0;
    return Math.round((completed / generated) * 100);
  }

  /**
   * Calculate start date for date range
   */
  calculateStartDate(dateRange) {
    const now = new Date();
    switch (dateRange) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Helper methods for statistics
  async getTasksGenerated(startDate) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM Tasks WHERE creation_date >= datetime(?)';
      this.db.get(query, [startDate.toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }

  async getTasksCompleted(startDate) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM Tasks WHERE completion_date >= datetime(?) AND status = "completed"';
      this.db.get(query, [startDate.toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }

  async getAverageCompletionTime(startDate) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT AVG(julianday(completion_date) - julianday(creation_date)) as avg_days
        FROM Tasks
        WHERE completion_date >= datetime(?) AND status = "completed"
      `;
      this.db.get(query, [startDate.toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row?.avg_days || 0);
      });
    });
  }

  async getPriorityDistribution(startDate) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT priority, COUNT(*) as count
        FROM Tasks
        WHERE creation_date >= datetime(?)
        GROUP BY priority
      `;
      this.db.all(query, [startDate.toISOString()], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new WorkflowAutomationService(); 