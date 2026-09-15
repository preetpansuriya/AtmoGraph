export interface NLPSentiment {
  label: 'positive' | 'negative' | 'neutral'
  score: number
}

export interface NLPEntity {
  text: string
  label: string
  confidence: number
}

export interface NLPAnalysis {
  sentiment: NLPSentiment
  entities: NLPEntity[]
  summary: string
  keywords: string[]
  confidence: number
}

export class NLPPipeline {
  private isInitialized: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    // Initialize NLP models and resources
    this.isInitialized = true
  }

  public async analyzeText(text: string): Promise<NLPAnalysis> {
    if (!this.isInitialized) {
      throw new Error('NLP Pipeline not initialized')
    }

    // Simulate NLP analysis
    await new Promise(resolve => setTimeout(resolve, 1000))

    const sentiment = this.analyzeSentiment(text)
    const entities = this.extractEntities(text)
    const summary = this.generateSummary(text)
    const keywords = this.extractKeywords(text)
    const confidence = 0.8 + Math.random() * 0.2

    return {
      sentiment,
      entities,
      summary,
      keywords,
      confidence
    }
  }

  public async analyzeBatch(texts: string[]): Promise<NLPAnalysis[]> {
    return Promise.all(texts.map(text => this.analyzeText(text)))
  }

  private analyzeSentiment(text: string): NLPSentiment {
    const lowerText = text.toLowerCase()
    
    let positiveScore = 0
    let negativeScore = 0

    const positiveWords = ['success', 'good', 'great', 'excellent', 'improved', 'growth', 'profit', 'efficient']
    const negativeWords = ['failure', 'bad', 'poor', 'disruption', 'delay', 'loss', 'inefficient', 'risk']

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++
    })

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++
    })

    if (positiveScore > negativeScore) {
      return { label: 'positive', score: 0.7 + Math.random() * 0.3 }
    } else if (negativeScore > positiveScore) {
      return { label: 'negative', score: 0.7 + Math.random() * 0.3 }
    } else {
      return { label: 'neutral', score: 0.6 + Math.random() * 0.3 }
    }
  }

  private extractEntities(text: string): NLPEntity[] {
    const entities: NLPEntity[] = []
    const entityPatterns = [
      { label: 'ORGANIZATION', patterns: ['corp', 'inc', 'ltd', 'company', 'supplier', 'manufacturer'] },
      { label: 'LOCATION', patterns: ['shanghai', 'beijing', 'new york', 'london', 'tokyo', 'region'] },
      { label: 'PRODUCT', patterns: ['steel', 'plastic', 'electronics', 'machinery', 'material'] }
    ]

    const lowerText = text.toLowerCase()

    entityPatterns.forEach(entity => {
      entity.patterns.forEach(pattern => {
        if (lowerText.includes(pattern)) {
          entities.push({
            text: pattern,
            label: entity.label,
            confidence: 0.7 + Math.random() * 0.3
          })
        }
      })
    })

    return entities.slice(0, 5) // Limit to 5 entities
  }

  private generateSummary(text: string): string {
    if (text.length <= 100) return text
    return text.substring(0, 97) + '...'
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 8)

    return [...new Set(keywords)] // Remove duplicates
  }

  public async classifySupplyChainEvent(text: string): Promise<{
    category: string
    subcategory: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> {
    await this.analyzeText(text)
    
    const categories = ['disruption', 'delay', 'quality', 'compliance', 'financial']
    const subcategories = ['shipping', 'production', 'supplier', 'demand', 'inventory']
    
    return {
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
    }
  }
}

// Singleton instance
export const nlpPipeline = new NLPPipeline()
