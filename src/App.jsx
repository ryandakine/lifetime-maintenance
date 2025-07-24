import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Maintenance from './components/Maintenance'
import Email from './components/Email'
import Tasks from './components/Tasks'
import Shopping from './components/Shopping'
import Photos from './components/Photos'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/maintenance" replace />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/email" element={<Email />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/photos" element={<Photos />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 