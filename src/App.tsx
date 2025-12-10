import React, { useState } from 'react'
import DataProcessor from './components/DataProcessor'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Advanced Data Processor</h1>
        <p>Process and analyze your data with real-time filtering</p>
      </header>
      <DataProcessor />
    </div>
  )
}

export default App
