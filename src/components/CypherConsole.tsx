import React, { useState } from 'react'
import { Terminal, Play, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react'

interface QueryResult {
  success: boolean
  rows: number
  time: string
  data?: any[]
  error?: string
}

const CypherConsole: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true)
  const [query, setQuery] = useState('')
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const sampleQueries = [
    'MATCH (n) RETURN n LIMIT 25',
    'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 10',
    'MATCH (n:Supplier) RETURN n',
    'MATCH path = (start:Node)-[*]->(end:Node) RETURN path LIMIT 5'
  ]

  const executeQuery = async () => {
    if (!query.trim()) return

    setIsExecuting(true)
    setQueryHistory(prev => [query, ...prev].slice(0, 10))

    // Simulate query execution
    setTimeout(() => {
      const mockResult: QueryResult = {
        success: Math.random() > 0.2,
        rows: Math.floor(Math.random() * 50) + 1,
        time: `${(Math.random() * 2 + 0.5).toFixed(2)}s`,
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `node_${i}`,
          label: `Node ${i}`,
          category: ['Manufacturing', 'Logistics', 'Raw Materials'][i % 3]
        }))
      }

      if (!mockResult.success) {
        mockResult.error = 'Query syntax error: unexpected token at position 15'
      }

      setCurrentResult(mockResult)
      setIsExecuting(false)
    }, 1000)
  }

  const clearConsole = () => {
    setQuery('')
    setCurrentResult(null)
  }

  const copyQuery = (text: string) => {
    setQuery(text)
  }

  return (
    <div className={`cypher-console ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="console-header" onClick={() => setIsMinimized(!isMinimized)}>
        <Terminal size={20} className="console-icon" />
        <h3>Cypher Console</h3>
        <div className="console-actions">
          <button className="action-icon-button" onClick={clearConsole} title="Clear">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="console-content">
          {/* Query Input */}
          <div className="query-section">
            <div className="query-header">
              <span className="query-prompt">neo4j{'>'}</span>
              <textarea
                className="query-input"
                placeholder="Enter Cypher query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    executeQuery()
                  }
                }}
              />
            </div>
            <div className="query-actions">
              <button 
                className={`execute-button ${isExecuting ? 'executing' : ''}`}
                onClick={executeQuery}
                disabled={!query.trim() || isExecuting}
              >
                {isExecuting ? (
                  <>
                    <div className="spinner-small"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Execute (Ctrl+Enter)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="sample-queries">
            <h4>Sample Queries</h4>
            <div className="query-list">
              {sampleQueries.map((sampleQuery, index) => (
                <div 
                  key={index} 
                  className="sample-query"
                  onClick={() => copyQuery(sampleQuery)}
                >
                  <code>{sampleQuery}</code>
                  <Copy size={14} className="copy-icon" />
                </div>
              ))}
            </div>
          </div>

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="query-history">
              <h4>Query History</h4>
              <div className="history-list">
                {queryHistory.map((historyQuery, index) => (
                  <div 
                    key={index} 
                    className="history-item"
                    onClick={() => copyQuery(historyQuery)}
                  >
                    <code>{historyQuery}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {currentResult && (
            <div className="query-results">
              <div className="results-header">
                <div className="results-status">
                  {currentResult.success ? (
                    <CheckCircle size={16} className="status-icon success" />
                  ) : (
                    <XCircle size={16} className="status-icon error" />
                  )}
                  <span className="status-text">
                    {currentResult.success ? 'Query executed successfully' : 'Query failed'}
                  </span>
                </div>
                <div className="results-stats">
                  <span>{currentResult.rows} rows</span>
                  <span>{currentResult.time}</span>
                </div>
              </div>

              {currentResult.success && currentResult.data ? (
                <div className="results-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Label</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult.data.map((row, index) => (
                        <tr key={index}>
                          <td>{row.id}</td>
                          <td>{row.label}</td>
                          <td>{row.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="error-message">
                  {currentResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CypherConsole
