import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Maintenance from './components/Maintenance'
import Email from './components/Email'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/maintenance" replace />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/email" element={<Email />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 