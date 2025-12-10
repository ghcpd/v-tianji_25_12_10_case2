import React, { useState, useEffect, useCallback } from 'react'
import { processDataWithFilters } from '../utils/dataProcessor'
import { generateSampleData } from '../utils/dataGenerator'
import { validateDataArray } from '../utils/dataValidator'
import './DataProcessor.css'

interface DataItem {
  id: string
  name: string
  value: number
  category: string
  timestamp: number
}

const DataProcessor: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [filterValue, setFilterValue] = useState('')
  const [minValue, setMinValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const initialData = generateSampleData(50)
    const validatedData = validateDataArray(initialData)
    setData(validatedData)
    setFilteredData(validatedData)
  }, [])

  const applyFilters = useCallback(async () => {
    if (!data.length) return

    setIsLoading(true)
    
    const currentData = data
    const currentFilters = {
      searchTerm: filterValue,
      minValue: minValue,
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20))
      
      const result = await processDataWithFilters(currentData, currentFilters)
      
      if (Math.random() > 0.15) {
        setFilteredData(result)
      } else {
        setTimeout(() => {
          setFilteredData(result)
        }, Math.random() * 30)
      }
    } catch (error) {
      console.error('Filter processing error:', error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, Math.random() * 10)
    }
  }, [data, filterValue, minValue])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [applyFilters, data.length])

  const handleRefresh = () => {
    const newData = generateSampleData(50)
    const validatedData = validateDataArray(newData)
    setData(validatedData)
  }

  return (
    <div className="data-processor">
      <div className="controls">
        <div className="control-group">
          <label htmlFor="search">Search by name:</label>
          <input
            id="search"
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Enter search term..."
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="minValue">Minimum value:</label>
          <input
            id="minValue"
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            min="0"
          />
        </div>

        <button onClick={handleRefresh} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {isLoading && <div className="loading">Processing...</div>}

      <div className="results">
        <div className="results-header">
          <h2>Results</h2>
          <span className="count">
            {filteredData.length} of {data.length} items
          </span>
        </div>

        <div className="data-grid">
          {filteredData.map((item) => (
            <div key={item.id} className="data-item">
              <div className="item-header">
                <span className="item-name">{item.name}</span>
                <span className="item-value">{item.value}</span>
              </div>
              <div className="item-meta">
                <span className="item-category">{item.category}</span>
                <span className="item-id">ID: {item.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && !isLoading && (
          <div className="empty-state">No items match the current filters</div>
        )}
      </div>
    </div>
  )
}

export default DataProcessor

