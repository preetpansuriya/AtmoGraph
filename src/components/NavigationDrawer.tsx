import React, { useState } from 'react'
import { Filter, Search, Layers, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'

interface FilterState {
  region: string[]
  category: string[]
  riskLevel: string[]
  timeRange: string
}

const NavigationDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    region: [],
    category: [],
    riskLevel: [],
    timeRange: 'all'
  })
  const [expandedSections, setExpandedSections] = useState({
    region: true,
    category: true,
    riskLevel: true,
    timeRange: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = prev[type] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [type]: newArray }
    })
  }

  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']
  const categories = ['Manufacturing', 'Logistics', 'Raw Materials', 'Technology', 'Services']
  const riskLevels = ['Low', 'Medium', 'High', 'Critical']
  const timeRanges = ['Last 24h', 'Last 7 days', 'Last 30 days', 'All time']

  return (
    <aside className={`navigation-drawer ${isOpen ? 'open' : 'closed'}`}>
      <div className="drawer-header">
        <Filter size={20} />
        <h3>Filters</h3>
        <button 
          className="toggle-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="drawer-content">
          {/* Search */}
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search nodes..." />
          </div>

          {/* Region Filter */}
          <div className="filter-section">
            <div className="filter-header" onClick={() => toggleSection('region')}>
              <Layers size={16} />
              <span>Region</span>
              {expandedSections.region ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.region && (
              <div className="filter-options">
                {regions.map(region => (
                  <label key={region} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.region.includes(region)}
                      onChange={() => toggleFilter('region', region)}
                    />
                    <span>{region}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <div className="filter-header" onClick={() => toggleSection('category')}>
              <Layers size={16} />
              <span>Category</span>
              {expandedSections.category ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.category && (
              <div className="filter-options">
                {categories.map(category => (
                  <label key={category} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Risk Level Filter */}
          <div className="filter-section">
            <div className="filter-header" onClick={() => toggleSection('riskLevel')}>
              <AlertTriangle size={16} />
              <span>Risk Level</span>
              {expandedSections.riskLevel ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.riskLevel && (
              <div className="filter-options">
                {riskLevels.map(level => (
                  <label key={level} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.riskLevel.includes(level)}
                      onChange={() => toggleFilter('riskLevel', level)}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Time Range Filter */}
          <div className="filter-section">
            <div className="filter-header" onClick={() => toggleSection('timeRange')}>
              <Clock size={16} />
              <span>Time Range</span>
              {expandedSections.timeRange ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {expandedSections.timeRange && (
              <div className="filter-options">
                {timeRanges.map(range => (
                  <label key={range} className="filter-option">
                    <input
                      type="radio"
                      name="timeRange"
                      checked={filters.timeRange === range}
                      onChange={() => setFilters(prev => ({ ...prev, timeRange: range }))}
                    />
                    <span>{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button className="apply-filters-button">Apply Filters</button>
        </div>
      )}
    </aside>
  )
}

export default NavigationDrawer
