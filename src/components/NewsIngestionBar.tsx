import React, { useState } from 'react'
import { Newspaper, Send, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

interface NewsAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  entities: string[]
  summary: string
}

const NewsIngestionBar: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<NewsAnalysis[]>([])

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    
    // Simulate NLP analysis
    setTimeout(() => {
      const mockAnalysis: NewsAnalysis = {
        sentiment: inputText.toLowerCase().includes('disruption') || 
                   inputText.toLowerCase().includes('delay') ? 'negative' : 
                   inputText.toLowerCase().includes('success') ? 'positive' : 'neutral',
        confidence: Math.floor(Math.random() * 20) + 80,
        entities: ['Supply Chain', 'Logistics', 'Manufacturing'],
        summary: inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText
      }
      
      setAnalysis(mockAnalysis)
      setRecentAnalyses(prev => [mockAnalysis, ...prev].slice(0, 5))
      setIsAnalyzing(false)
    }, 1500)
  }

  const getSentimentIcon = (sentiment: NewsAnalysis['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle size={16} className="sentiment-icon positive" />
      case 'negative':
        return <AlertCircle size={16} className="sentiment-icon negative" />
      case 'neutral':
        return <Sparkles size={16} className="sentiment-icon neutral" />
    }
  }

  const getSentimentColor = (sentiment: NewsAnalysis['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return '#48bb78'
      case 'negative':
        return '#f56565'
      case 'neutral':
        return '#a0aec0'
    }
  }

  return (
    <div className="news-ingestion-bar">
      <div className="news-input-container">
        <Newspaper size={20} className="news-icon" />
        <input
          type="text"
          className="news-input"
          placeholder="Enter news article or supply chain update for NLP analysis..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button 
          className={`analyze-button ${isAnalyzing ? 'analyzing' : ''}`}
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner-small"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Send size={16} />
              Analyze
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="analysis-result">
          <div className="analysis-header">
            {getSentimentIcon(analysis.sentiment)}
            <span className="analysis-sentiment" style={{ color: getSentimentColor(analysis.sentiment) }}>
              {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} Sentiment
            </span>
            <span className="analysis-confidence">{analysis.confidence}% confidence</span>
          </div>
          <div className="analysis-summary">{analysis.summary}</div>
          <div className="analysis-entities">
            <span className="entities-label">Detected Entities:</span>
            {analysis.entities.map(entity => (
              <span key={entity} className="entity-tag">{entity}</span>
            ))}
          </div>
        </div>
      )}

      {recentAnalyses.length > 0 && (
        <div className="recent-analyses">
          <h4>Recent Analyses</h4>
          <div className="analyses-list">
            {recentAnalyses.map((item, index) => (
              <div key={index} className="analysis-item">
                {getSentimentIcon(item.sentiment)}
                <span className="item-summary">{item.summary}</span>
                <span className="item-confidence">{item.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsIngestionBar
