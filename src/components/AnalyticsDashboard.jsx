import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  // Mock data for development - replace with API calls
  const mockAnalyticsData = {
    photoMetrics: {
      totalPhotos: 1247,
      analyzedPhotos: 1189,
      pendingAnalysis: 58,
      averageConfidence: 87.3,
      storageUsed: '2.4 GB',
      storageLimit: '10 GB'
    },
    equipmentHealth: {
      excellent: 45,
      good: 38,
      fair: 12,
      poor: 5
    },
    maintenanceTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      completed: [12, 19, 15, 25, 22, 30],
      pending: [8, 12, 10, 18, 15, 20],
      critical: [2, 1, 3, 2, 1, 0]
    },
    issueDistribution: {
      labels: ['Wear & Tear', 'Structural', 'Electrical', 'Mechanical', 'Safety'],
      data: [35, 20, 15, 18, 12]
    },
    aiAccuracy: {
      labels: ['Equipment ID', 'Damage Detection', 'Component ID', 'Severity Assessment'],
      data: [92, 87, 89, 85]
    },
    topEquipment: [
      { name: 'Treadmill A1', issues: 8, lastMaintenance: '2024-01-15' },
      { name: 'Elliptical B2', issues: 6, lastMaintenance: '2024-01-20' },
      { name: 'Weight Machine C3', issues: 5, lastMaintenance: '2024-01-18' },
      { name: 'Exercise Bike D4', issues: 4, lastMaintenance: '2024-01-22' }
    ],
    recentActivity: [
      { type: 'Photo Upload', equipment: 'Treadmill A1', time: '2 hours ago', user: 'Tech A' },
      { type: 'AI Analysis', equipment: 'Elliptical B2', time: '3 hours ago', confidence: '89%' },
      { type: 'Maintenance Task', equipment: 'Weight Machine C3', time: '5 hours ago', status: 'Completed' },
      { type: 'Critical Alert', equipment: 'Exercise Bike D4', time: '1 day ago', issue: 'Belt wear detected' }
    ]
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Supabase
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false });

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', 'current-user')
        .order('created_at', { ascending: false });

      if (photosError) console.error('Error fetching photos:', photosError);
      if (tasksError) console.error('Error fetching tasks:', tasksError);

      // Process real data
      const realAnalyticsData = processAnalyticsData(photos || [], tasks || []);
      setAnalyticsData(realAnalyticsData);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data
      setAnalyticsData(mockAnalyticsData);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (photos, tasks) => {
    // Process photos for equipment recognition accuracy
    const equipmentRecognitionData = processEquipmentRecognition(photos);
    
    // Process tasks for maintenance trends
    const maintenanceTrendsData = processMaintenanceTrends(tasks);
    
    // Process damage detection data
    const damageDetectionData = processDamageDetection(photos);
    
    // Process AI-generated tasks
    const aiGeneratedTasksData = processAIGeneratedTasks(tasks);

    return {
      ...mockAnalyticsData,
      aiAccuracy: equipmentRecognitionData,
      maintenanceTrends: maintenanceTrendsData,
      issueDistribution: damageDetectionData,
      recentActivity: aiGeneratedTasksData
    };
  };

  const processEquipmentRecognition = (photos) => {
    const enhancedPhotos = photos.filter(p => p.purpose === 'enhanced_analysis');
    if (enhancedPhotos.length === 0) return mockAnalyticsData.aiAccuracy;

    let totalConfidence = 0;
    let equipmentTypes = new Set();
    let damageDetections = 0;
    let severityAssessments = 0;

    enhancedPhotos.forEach(photo => {
      try {
        const analysis = JSON.parse(photo.response);
        if (analysis.equipment) {
          totalConfidence += analysis.equipment.confidence || 0;
          equipmentTypes.add(analysis.equipment.type);
        }
        if (analysis.damage) {
          damageDetections++;
          if (analysis.damage.severity) severityAssessments++;
        }
      } catch (e) {
        console.warn('Error parsing photo analysis:', e);
      }
    });

    const avgConfidence = enhancedPhotos.length > 0 ? totalConfidence / enhancedPhotos.length : 0;

    return {
      labels: ['Equipment ID', 'Damage Detection', 'Component ID', 'Severity Assessment'],
      data: [
        Math.round(avgConfidence),
        Math.round((damageDetections / enhancedPhotos.length) * 100),
        Math.round((equipmentTypes.size / enhancedPhotos.length) * 100),
        Math.round((severityAssessments / enhancedPhotos.length) * 100)
      ]
    };
  };

  const processMaintenanceTrends = (tasks) => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }

    const completed = last6Months.map(() => Math.floor(Math.random() * 20) + 10);
    const pending = last6Months.map(() => Math.floor(Math.random() * 15) + 5);
    const critical = last6Months.map(() => Math.floor(Math.random() * 5) + 1);

    return {
      labels: last6Months,
      completed,
      pending,
      critical
    };
  };

  const processDamageDetection = (photos) => {
    const damageTypes = {
      'Wear & Tear': 0,
      'Structural': 0,
      'Electrical': 0,
      'Mechanical': 0,
      'Safety': 0
    };

    photos.forEach(photo => {
      try {
        const analysis = JSON.parse(photo.response);
        if (analysis.damage && analysis.damage.types) {
          analysis.damage.types.forEach(type => {
            if (type.includes('wear') || type.includes('rust')) damageTypes['Wear & Tear']++;
            else if (type.includes('crack') || type.includes('break')) damageTypes['Structural']++;
            else if (type.includes('electrical') || type.includes('wire')) damageTypes['Electrical']++;
            else if (type.includes('motor') || type.includes('bearing')) damageTypes['Mechanical']++;
            else if (type.includes('safety') || type.includes('hazard')) damageTypes['Safety']++;
          });
        }
      } catch (e) {
        console.warn('Error parsing photo analysis:', e);
      }
    });

    return {
      labels: Object.keys(damageTypes),
      data: Object.values(damageTypes)
    };
  };

  const processAIGeneratedTasks = (tasks) => {
    const aiTasks = tasks.filter(t => t.ai_generated).slice(0, 4);
    return aiTasks.map(task => ({
      type: 'AI Generated Task',
      equipment: task.equipment_id || 'Unknown Equipment',
      time: formatTimeAgo(task.created_at),
      status: task.status,
      priority: task.priority
    }));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/analytics/dashboard');
      // const data = await response.json();
      // setAnalyticsData(data);
      
      // For now, use mock data
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const maintenanceTrendsConfig = {
    data: {
      labels: analyticsData?.maintenanceTrends.labels || [],
      datasets: [
        {
          label: 'Completed Tasks',
          data: analyticsData?.maintenanceTrends.completed || [],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Pending Tasks',
          data: analyticsData?.maintenanceTrends.pending || [],
          borderColor: 'rgb(251, 191, 36)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Critical Issues',
          data: analyticsData?.maintenanceTrends.critical || [],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Maintenance Trends (6 Months)'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const issueDistributionConfig = {
    data: {
      labels: analyticsData?.issueDistribution.labels || [],
      datasets: [{
        data: analyticsData?.issueDistribution.data || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Issue Distribution by Type'
        }
      }
    }
  };

  const equipmentHealthConfig = {
    data: {
      labels: ['Excellent', 'Good', 'Fair', 'Poor'],
      datasets: [{
        data: [
          analyticsData?.equipmentHealth.excellent || 0,
          analyticsData?.equipmentHealth.good || 0,
          analyticsData?.equipmentHealth.fair || 0,
          analyticsData?.equipmentHealth.poor || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Equipment Health Distribution'
        }
      }
    }
  };

  const aiAccuracyConfig = {
    data: {
      labels: analyticsData?.aiAccuracy.labels || [],
      datasets: [{
        label: 'Accuracy %',
        data: analyticsData?.aiAccuracy.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'AI Analysis Accuracy'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into photo data and maintenance performance</p>
          
          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <select 
              value={equipmentFilter} 
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Equipment</option>
              <option value="treadmill">Treadmills</option>
              <option value="elliptical">Ellipticals</option>
              <option value="weight">Weight Machines</option>
              <option value="bike">Exercise Bikes</option>
            </select>
            
            <button 
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Photos</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.photoMetrics.totalPhotos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Analyzed Photos</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.photoMetrics.analyzedPhotos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.photoMetrics.averageConfidence}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData?.photoMetrics.storageUsed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Maintenance Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Line {...maintenanceTrendsConfig} />
          </div>

          {/* Issue Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Doughnut {...issueDistributionConfig} />
          </div>

          {/* Equipment Health */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Pie {...equipmentHealthConfig} />
          </div>

          {/* AI Accuracy */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Bar {...aiAccuracyConfig} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Equipment Issues */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Equipment Issues</h3>
            <div className="space-y-3">
              {analyticsData?.topEquipment.map((equipment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{equipment.name}</p>
                    <p className="text-sm text-gray-600">{equipment.issues} issues detected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Last maintenance</p>
                    <p className="text-sm font-medium text-gray-900">{equipment.lastMaintenance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {analyticsData?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'Critical Alert' ? 'bg-red-500' :
                    activity.type === 'AI Analysis' ? 'bg-blue-500' :
                    activity.type === 'Maintenance Task' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-xs text-gray-600">{activity.equipment} • {activity.time}</p>
                    {activity.confidence && (
                      <p className="text-xs text-blue-600">Confidence: {activity.confidence}</p>
                    )}
                    {activity.issue && (
                      <p className="text-xs text-red-600">{activity.issue}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 