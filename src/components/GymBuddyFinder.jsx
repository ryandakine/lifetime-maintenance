import React, { useState, useEffect } from 'react';
import './GymBuddyFinder.css';

const GymBuddyFinder = () => {
  const [isLookingForBuddy, setIsLookingForBuddy] = useState(false);
  const [workoutType, setWorkoutType] = useState('strength');
  const [duration, setDuration] = useState('30min');
  const [availableBuddies, setAvailableBuddies] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: 'John D.',
    level: 'Intermediate',
    location: 'Weight Room',
    status: 'Available'
  });

  // Update user status based on toggle
  useEffect(() => {
    setUserProfile(prev => ({
      ...prev,
      status: isLookingForBuddy ? `Looking for ${workoutType === 'strength' ? 'a spotter' : 'a workout partner'}` : 'Available'
    }));
  }, [isLookingForBuddy, workoutType]);

  // Simulate available buddies
  useEffect(() => {
    if (isLookingForBuddy) {
      const mockBuddies = [
        {
          id: 1,
          name: 'Sarah M.',
          level: 'Advanced',
          workoutType: 'strength',
          location: 'Weight Room',
          status: 'Looking for spotter',
          timeAvailable: '30min',
          avatar: '👩‍💪'
        },
        {
          id: 2,
          name: 'Mike R.',
          level: 'Intermediate',
          workoutType: 'cardio',
          location: 'Cardio Area',
          status: 'Want to run together',
          timeAvailable: '45min',
          avatar: '🏃‍♂️'
        },
        {
          id: 3,
          name: 'Lisa K.',
          level: 'Beginner',
          workoutType: 'strength',
          location: 'Weight Room',
          status: 'Need workout partner',
          timeAvailable: '60min',
          avatar: '💪'
        }
      ];
      setAvailableBuddies(mockBuddies);
    } else {
      setAvailableBuddies([]);
    }
  }, [isLookingForBuddy]);

  const toggleBuddySearch = () => {
    setIsLookingForBuddy(!isLookingForBuddy);
  };

  const connectWithBuddy = (buddy) => {
    alert(`Connecting you with ${buddy.name} for ${buddy.workoutType} workout!`);
    // In real app, this would send a connection request
  };

  return (
    <div className="gym-buddy-container">
      <div className="buddy-header">
        <h2>🏋️‍♂️ Gym Buddy Finder</h2>
        <p>Find workout partners, spotters, and fitness buddies at your Lifetime Fitness location</p>
      </div>

      {/* User Status Toggle */}
      <div className="status-toggle-section">
        <div className="user-profile">
          <div className="profile-avatar">👨‍💪</div>
          <div className="profile-info">
            <h3>{userProfile.name}</h3>
            <p>{userProfile.level} • {userProfile.location}</p>
            <span className={`status-badge ${userProfile.status.toLowerCase()}`}>
              {userProfile.status}
            </span>
          </div>
        </div>

        <div className="toggle-section">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isLookingForBuddy}
              onChange={toggleBuddySearch}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">
            {isLookingForBuddy ? '🏋️‍♂️ Looking for a workout partner!' : '❌ Not looking for a partner'}
          </span>
        </div>
      </div>

      {/* Workout Preferences */}
      {isLookingForBuddy && (
        <div className="preferences-section">
          <h3>Workout Preferences</h3>
          <div className="preference-grid">
            <div className="preference-item">
              <label>Workout Type:</label>
              <select 
                value={workoutType} 
                onChange={(e) => setWorkoutType(e.target.value)}
                className="form-select"
              >
                <option value="strength">🏋️‍♂️ Strength Training (Need Spotter)</option>
                <option value="cardio">🏃‍♂️ Cardio Partner</option>
                <option value="flexibility">🧘‍♀️ Flexibility/Stretching</option>
                <option value="general">💪 General Workout Partner</option>
              </select>
            </div>
            <div className="preference-item">
              <label>Duration:</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="30min">30 minutes</option>
                <option value="45min">45 minutes</option>
                <option value="60min">1 hour</option>
                <option value="90min">1.5 hours</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Available Buddies */}
      {isLookingForBuddy && availableBuddies.length > 0 && (
        <div className="buddies-section">
          <h3>Available Workout Buddies</h3>
          <div className="buddies-grid">
            {availableBuddies.map((buddy) => (
              <div key={buddy.id} className="buddy-card">
                <div className="buddy-avatar">{buddy.avatar}</div>
                <div className="buddy-info">
                  <h4>{buddy.name}</h4>
                  <p className="buddy-level">{buddy.level}</p>
                  <p className="buddy-location">📍 {buddy.location}</p>
                  <p className="buddy-status">{buddy.status}</p>
                  <p className="buddy-time">⏱️ {buddy.timeAvailable}</p>
                </div>
                <button
                  className="connect-btn"
                  onClick={() => connectWithBuddy(buddy)}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Features */}
      <div className="safety-section">
        <h3>🛡️ Safety & Privacy Features</h3>
        <div className="safety-grid">
          <div className="safety-item">
            <span className="safety-icon">✅</span>
            <div>
              <h4>Member Verification</h4>
              <p>All users are verified Lifetime Fitness members</p>
            </div>
          </div>
          <div className="safety-item">
            <span className="safety-icon">🔒</span>
            <div>
              <h4>Privacy Controls</h4>
              <p>You control who can see your availability</p>
            </div>
          </div>
          <div className="safety-item">
            <span className="safety-icon">🚨</span>
            <div>
              <h4>Quick Disconnect</h4>
              <p>Instantly stop sharing your status</p>
            </div>
          </div>
          <div className="safety-item">
            <span className="safety-icon">📱</span>
            <div>
              <h4>In-App Messaging</h4>
              <p>Safe communication within the app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits for Lifetime */}
      <div className="benefits-section">
        <h3>💪 Benefits for Lifetime Fitness Members</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <h4>🏋️‍♂️ Better Workouts</h4>
            <p>Find spotters and workout partners instantly</p>
          </div>
          <div className="benefit-item">
            <h4>🤝 Community Building</h4>
            <p>Connect with fellow fitness enthusiasts</p>
          </div>
          <div className="benefit-item">
            <h4>📈 Increased Motivation</h4>
            <p>Workout partners help you stay consistent</p>
          </div>
          <div className="benefit-item">
            <h4>🎯 Goal Achievement</h4>
            <p>Find partners with similar fitness goals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymBuddyFinder; 