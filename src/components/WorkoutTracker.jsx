import React, { useState } from 'react'

const WorkoutTracker = () => {
  console.log('Rendering WorkoutTracker')
  const [workout, setWorkout] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // handle submit
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ color: '#007BFF' }}>Workout Tracker</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="workout-type">Workout Type</label>
          <input
            id="workout-type"
            name="workout-type"
            type="text"
            value={workout}
            onChange={e => setWorkout(e.target.value)}
            placeholder="e.g. Cardio, Strength"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="workout-date">Date</label>
          <input
            id="workout-date"
            name="workout-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="workout-notes">Notes</label>
          <textarea
            id="workout-notes"
            name="workout-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any notes about your workout..."
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ background: '#007BFF', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: 4 }} aria-label="Save workout">
          Save
        </button>
      </form>
    </div>
  )
}

export default WorkoutTracker 