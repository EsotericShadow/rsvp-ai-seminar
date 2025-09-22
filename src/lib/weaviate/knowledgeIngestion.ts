// Simplified knowledge ingestion - will be implemented later
export const knowledgeIngestion = {
  async ingestSystemKnowledge(): Promise<void> {
    console.log('Knowledge ingestion skipped - using pattern matching instead')
  },

  async searchKnowledge(query: string, limit: number = 5): Promise<any[]> {
    console.log('Knowledge search skipped - using pattern matching instead')
    return []
  },

  async searchBusinessData(query: string, limit: number = 5): Promise<any[]> {
    console.log('Business data search skipped - using pattern matching instead')
    return []
  }
}