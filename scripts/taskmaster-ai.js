#!/usr/bin/env node

/**
 * TaskMaster AI - Agent-Based System Development Manager
 * Helps track, manage, and optimize development tasks for the Lifetime Maintenance system
 */

const fs = require('fs');
const path = require('path');

class TaskMasterAI {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentPhase = 1;
    this.currentTask = 1;
  }

  // Load tasks from the plan
  loadTasks() {
    return {
      phase1: {
        name: "MVP Foundation & Core (Weeks 1-2)",
        tasks: [
          {
            id: "1.1",
            name: "Environment Setup (Week 1)",
            priority: "Critical",
            duration: "3 days",
            dependencies: [],
            subtasks: [
              "Set up Node.js/Express backend with REST APIs",
              "Configure Perplexity Pro API and Ollama local backup",
              "Set up SQLite DB with schema; use Prisma for migrations",
              "Initialize React app with WebSockets and error boundaries",
              "Test basic API connectivity (health check endpoint)",
              "Set up staging environment; configure .env variables",
              "Add CORS configuration for React/API communication"
            ],
            status: "pending",
            progress: 0
          },
          {
            id: "1.2",
            name: "Core Agents Implementation (Week 1-2)",
            priority: "Critical",
            duration: "5 days",
            dependencies: ["1.1"],
            subtasks: [
              "Implement CEO Agent (NLP via Perplexity/Ollama)",
              "Implement Equipment Agent (photo analysis with Multer)",
              "Implement Task Agent (creation/tracking)",
              "Add manual override routes",
              "Integrate with DB and WebSockets for updates",
              "Add Express rate limiter to APIs"
            ],
            status: "pending",
            progress: 0
          },
          {
            id: "1.3",
            name: "Basic React UI Integration (Week 2)",
            priority: "High",
            duration: "3 days",
            dependencies: ["1.2"],
            subtasks: [
              "Add VoiceInput and VisualMaintenance components",
              "Display task lists and recommendations",
              "Implement real-time updates via WebSockets",
              "Add simple admin panel for config/export",
              "Test end-to-end (photo → analysis → task)"
            ],
            status: "pending",
            progress: 0
          }
        ]
      },
      phase2: {
        name: "MVP Testing & Refinement (Week 3)",
        tasks: [
          {
            id: "2.1",
            name: "Manual Testing & Feedback",
            priority: "High",
            duration: "4 days",
            dependencies: ["1.3"],
            subtasks: [
              "Manual test core features (20 scenarios for photo/task)",
              "Automated tests only for critical paths (API router)",
              "Demo to 2-3 maintenance staff; gather feedback",
              "Refine based on input (UI tweaks)",
              "Document issues/fixes"
            ],
            status: "pending",
            progress: 0
          }
        ]
      },
      phase3: {
        name: "MVP Deployment (Week 4)",
        tasks: [
          {
            id: "3.1",
            name: "Deployment & User Acceptance",
            priority: "High",
            duration: "4 days",
            dependencies: ["2.1"],
            subtasks: [
              "Deploy to staging (GitHub Actions for CI/CD)",
              "Add basic monitoring (health checks)",
              "Conduct user acceptance testing with staff",
              "Lock MVP; no new features until Week 5",
              "Measure initial metrics (adoption)"
            ],
            status: "pending",
            progress: 0
          }
        ]
      }
    };
  }

  // Display current status
  showStatus() {
    console.log('🤖 TaskMaster AI - Development Status\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    Object.keys(this.tasks).forEach(phaseKey => {
      const phase = this.tasks[phaseKey];
      console.log(`📋 ${phase.name} (Phase ${phaseKey.slice(-1)})\n`);

      phase.tasks.forEach(task => {
        const statusIcon = this.getStatusIcon(task.status);
        const progressBar = this.getProgressBar(task.progress);
        
        console.log(`${statusIcon} Task ${task.id}: ${task.name}`);
        console.log(`   Priority: ${task.priority} | Duration: ${task.duration}`);
        console.log(`   Status: ${task.status} | Progress: ${task.progress}%`);
        console.log(`   ${progressBar}`);
        
        if (task.dependencies.length > 0) {
          console.log(`   Dependencies: ${task.dependencies.join(', ')}`);
        }
        
        if (task.status === 'in-progress') {
          console.log(`   Next: ${this.getNextSubtask(task)}`);
        }
        
        console.log('');
      });
    });

    this.showMetrics();
  }

  // Get status icon
  getStatusIcon(status) {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'blocked': return '🚫';
      case 'pending': return '⏳';
      default: return '❓';
    }
  }

  // Get progress bar
  getProgressBar(progress) {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
  }

  // Get next subtask
  getNextSubtask(task) {
    const completedSubtasks = Math.floor((task.progress / 100) * task.subtasks.length);
    if (completedSubtasks < task.subtasks.length) {
      return task.subtasks[completedSubtasks];
    }
    return 'All subtasks completed';
  }

  // Show metrics
  showMetrics() {
    console.log('📊 Project Metrics\n');
    
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let blockedTasks = 0;

    Object.values(this.tasks).forEach(phase => {
      phase.tasks.forEach(task => {
        totalTasks++;
        switch (task.status) {
          case 'completed': completedTasks++; break;
          case 'in-progress': inProgressTasks++; break;
          case 'blocked': blockedTasks++; break;
        }
      });
    });

    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Completed: ${completedTasks} (${completionRate}%)`);
    console.log(`In Progress: ${inProgressTasks}`);
    console.log(`Blocked: ${blockedTasks}`);
    console.log(`Pending: ${totalTasks - completedTasks - inProgressTasks - blockedTasks}\n`);
  }

  // Start a task
  startTask(taskId) {
    const task = this.findTask(taskId);
    if (!task) {
      console.log(`❌ Task ${taskId} not found`);
      return;
    }

    // Check dependencies
    const blockedDependencies = task.dependencies.filter(dep => {
      const depTask = this.findTask(dep);
      return depTask && depTask.status !== 'completed';
    });

    if (blockedDependencies.length > 0) {
      console.log(`🚫 Task ${taskId} is blocked by: ${blockedDependencies.join(', ')}`);
      return;
    }

    task.status = 'in-progress';
    console.log(`🔄 Started Task ${taskId}: ${task.name}`);
    console.log(`Next: ${task.subtasks[0]}`);
  }

  // Update task progress
  updateProgress(taskId, progress) {
    const task = this.findTask(taskId);
    if (!task) {
      console.log(`❌ Task ${taskId} not found`);
      return;
    }

    task.progress = Math.min(100, Math.max(0, progress));
    
    if (task.progress === 100) {
      task.status = 'completed';
      console.log(`✅ Completed Task ${taskId}: ${task.name}`);
    } else {
      console.log(`📈 Updated Task ${taskId} progress: ${task.progress}%`);
    }
  }

  // Find task by ID
  findTask(taskId) {
    for (const phase of Object.values(this.tasks)) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  // Get next recommended task
  getNextTask() {
    for (const phase of Object.values(this.tasks)) {
      for (const task of phase.tasks) {
        if (task.status === 'pending') {
          // Check if dependencies are met
          const dependenciesMet = task.dependencies.every(dep => {
            const depTask = this.findTask(dep);
            return depTask && depTask.status === 'completed';
          });
          
          if (dependenciesMet) {
            return task;
          }
        }
      }
    }
    return null;
  }

  // Show next recommended task
  showNextTask() {
    const nextTask = this.getNextTask();
    if (nextTask) {
      console.log('🎯 Next Recommended Task:\n');
      console.log(`Task ${nextTask.id}: ${nextTask.name}`);
      console.log(`Priority: ${nextTask.priority}`);
      console.log(`Duration: ${nextTask.duration}`);
      console.log(`Subtasks:`);
      nextTask.subtasks.forEach((subtask, index) => {
        console.log(`  ${index + 1}. ${subtask}`);
      });
      console.log(`\nTo start: npm run taskmaster start ${nextTask.id}`);
    } else {
      console.log('🎉 All tasks are completed or in progress!');
    }
  }

  // Generate development report
  generateReport() {
    console.log('📋 TaskMaster AI - Development Report\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    this.showStatus();
    this.showNextTask();
    
    console.log('\n🚀 Quick Actions:');
    console.log('  npm run taskmaster status     - Show current status');
    console.log('  npm run taskmaster next       - Show next recommended task');
    console.log('  npm run taskmaster start 1.1  - Start a specific task');
    console.log('  npm run taskmaster progress 1.1 50 - Update task progress');
  }
}

// CLI Interface
function main() {
  const taskmaster = new TaskMasterAI();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'status':
      taskmaster.showStatus();
      break;
    case 'next':
      taskmaster.showNextTask();
      break;
    case 'start':
      if (arg) {
        taskmaster.startTask(arg);
      } else {
        console.log('❌ Please specify a task ID (e.g., npm run taskmaster start 1.1)');
      }
      break;
    case 'progress':
      if (arg && process.argv[4]) {
        taskmaster.updateProgress(arg, parseInt(process.argv[4]));
      } else {
        console.log('❌ Please specify task ID and progress (e.g., npm run taskmaster progress 1.1 50)');
      }
      break;
    case 'report':
      taskmaster.generateReport();
      break;
    default:
      taskmaster.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TaskMasterAI; 