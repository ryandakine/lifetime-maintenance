import React, { useState, useEffect } from 'react';
import './PersonalMaintenanceDashboard.css';

const PersonalMaintenanceDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [serviceChannelOrders, setServiceChannelOrders] = useState([]);
  const [lastWeekTasks, setLastWeekTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading data
    setServiceChannelOrders([
      { id: 1, description: 'Treadmill belt slipping in cardio room A', priority: 'high', status: 'pending' },
      { id: 2, description: 'Elliptical making noise in room B', priority: 'medium', status: 'pending' },
      { id: 3, description: 'Pool chlorine levels need adjustment', priority: 'high', status: 'pending' }
    ]);

    setLastWeekTasks([
      { id: 1, description: 'Fixed treadmill in room C', completed: true, date: '2024-01-15' },
      { id: 2, description: 'Replaced elliptical belt', completed: true, date: '2024-01-16' },
      { id: 3, description: 'Pool maintenance completed', completed: true, date: '2024-01-17' }
    ]);

    setTasks([
      { id: 1, description: 'Treadmill belt slipping in cardio room A', priority: 'high', status: 'pending', tools: [], parts: [] },
      { id: 2, description: 'Elliptical making noise in room B', priority: 'medium', status: 'pending', tools: [], parts: [] },
      { id: 3, description: 'Pool chlorine levels need adjustment', priority: 'high', status: 'pending', tools: [], parts: [] }
    ]);
  }, []);

  const handleVoiceInput = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      // Process voice input
      console.log('Voice input processed');
    }, 3000);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate AI analysis
      console.log('Photo uploaded for AI analysis:', file.name);
      // Here we would send to AI for analysis
    }
  };

  const startTask = (task) => {
    setCurrentTask(task);
    setCurrentView('task-detail');
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
    setCurrentView('dashboard');
    setCurrentTask(null);
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Maintenance Dashboard</h1>
        <div className="quick-actions">
          <button onClick={handleVoiceInput} className={`voice-btn ${isRecording ? 'recording' : ''}`}>
            {isRecording ? '🎤 Recording...' : '🎤 Voice Report'}
          </button>
          <label className="photo-btn">
            📷 Photo Analysis
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Service Channel Orders */}
        <div className="dashboard-card">
          <h3>📋 Service Channel Orders</h3>
          <div className="task-list">
            {serviceChannelOrders.map(order => (
              <div key={order.id} className="task-item">
                <span className={`priority ${order.priority}`}>{order.priority}</span>
                <span className="description">{order.description}</span>
                <button onClick={() => startTask(order)} className="start-btn">Start</button>
              </div>
            ))}
          </div>
        </div>

        {/* This Week's Tasks */}
        <div className="dashboard-card">
          <h3>✅ This Week's Tasks</h3>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <span className={`priority ${task.priority}`}>{task.priority}</span>
                <span className="description">{task.description}</span>
                <span className={`status ${task.status}`}>{task.status}</span>
                {task.status === 'pending' && (
                  <button onClick={() => startTask(task)} className="start-btn">Start</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Last Week's Completed */}
        <div className="dashboard-card">
          <h3>📅 Last Week's Completed</h3>
          <div className="task-list">
            {lastWeekTasks.map(task => (
              <div key={task.id} className="task-item completed">
                <span className="description">{task.description}</span>
                <span className="date">{task.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="dashboard-card">
          <h3>📚 Knowledge Base</h3>
          <div className="knowledge-links">
            <button className="knowledge-btn">🔧 Equipment Manuals</button>
            <button className="knowledge-btn">⚡ Breaker Knowledge</button>
            <button className="knowledge-btn">🏊 Pool Maintenance</button>
            <button className="knowledge-btn">🏃 Treadmill Repair</button>
            <button className="knowledge-btn">🔧 General Maintenance</button>
          </div>
        </div>

        {/* Parts & Supplies */}
        <div className="dashboard-card">
          <h3>🛒 Parts & Supplies</h3>
          <div className="supplies-section">
            <button className="supply-btn grainger">🔍 Grainger Search</button>
            <button className="supply-btn home-depot">🏠 Home Depot</button>
            <button className="supply-btn inventory">📦 Check Inventory</button>
          </div>
        </div>

        {/* Meeting with Mason */}
        <div className="dashboard-card">
          <h3>👔 Meeting with Mason</h3>
          <div className="meeting-info">
            <p><strong>Next Meeting:</strong> Wednesday 10:00 AM</p>
            <button className="meeting-btn">📝 Add Notes</button>
            <button className="meeting-btn">📋 View Previous</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaskDetail = () => (
    <div className="task-detail">
      <div className="task-header">
        <button onClick={() => setCurrentView('dashboard')} className="back-btn">← Back to Dashboard</button>
        <h2>Task: {currentTask?.description}</h2>
      </div>

      <div className="task-content">
        <div className="task-section">
          <h3>📸 Photo Analysis</h3>
          <div className="photo-upload">
            <label className="upload-btn">
              📷 Upload Before Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </label>
            <div className="ai-analysis">
              <h4>AI Analysis Results:</h4>
              <div className="analysis-content">
                <p><strong>Equipment Type:</strong> Treadmill</p>
                <p><strong>Issue:</strong> Belt slipping</p>
                <p><strong>Recommended Action:</strong> Belt replacement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="task-section">
          <h3>🛠️ Required Tools</h3>
          <ul className="tools-list">
            <li>Socket wrench set</li>
            <li>Allen wrenches</li>
            <li>Belt tension gauge</li>
          </ul>
        </div>

        <div className="task-section">
          <h3>📦 Required Parts</h3>
          <div className="parts-section">
            <div className="part-item">
              <span>Treadmill belt</span>
              <button className="grainger-btn">🔍 Grainger</button>
              <button className="home-depot-btn">🏠 Home Depot</button>
            </div>
            <div className="part-item">
              <span>Belt tensioner</span>
              <button className="grainger-btn">🔍 Grainger</button>
              <button className="home-depot-btn">🏠 Home Depot</button>
            </div>
          </div>
        </div>

        <div className="task-section">
          <h3>📋 Step-by-Step Instructions</h3>
          <ol className="instructions-list">
            <li>Turn off treadmill and unplug from power</li>
            <li>Remove motor cover to access belt</li>
            <li>Loosen belt tension and remove old belt</li>
            <li>Install new belt and adjust tension</li>
            <li>Test operation and verify proper tension</li>
          </ol>
        </div>

        <div className="task-actions">
          <button className="complete-btn" onClick={() => completeTask(currentTask.id)}>
            ✅ Mark Complete
          </button>
          <label className="upload-btn">
            📷 Upload Completion Photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="personal-maintenance-dashboard">
      {currentView === 'dashboard' ? renderDashboard() : renderTaskDetail()}
    </div>
  );
};

export default PersonalMaintenanceDashboard; 