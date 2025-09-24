import weaviate, { WeaviateClient } from 'weaviate-client'

let client: WeaviateClient | null = null

export async function getClient(): Promise<WeaviateClient> {
  if (client) {
    return client
  }

  const weaviateUrl = process.env.WEAVIATE_URL || 'rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud'
  const weaviateApiKey = process.env.WEAVIATE_API_KEY || 'enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw'

  try {
    // Use the correct 2025 API format
    client = await weaviate.connectToWeaviateCloud(
      weaviateUrl,
      weaviateApiKey ? { authCredentials: new weaviate.ApiKey(weaviateApiKey) } : undefined
    )
    
    console.log('✅ Connected to Weaviate Cloud')
    return client
  } catch (error) {
    console.error('❌ Failed to connect to Weaviate:', error)
    throw error
  }
}

export async function testWeaviateConnection(): Promise<boolean> {
  try {
    const client = await getClient()
    // Simple connection test - just try to get the client
    console.log('Weaviate connection successful')
    return true
  } catch (error) {
    console.error('Weaviate connection test failed:', error)
    return false
  }
}

export async function initializeWeaviateSchema(): Promise<void> {
  const client = await getClient()

  try {
    // Create KnowledgeBase collection
    await client.collections.create({
      name: 'KnowledgeBase',
      properties: [
        {
          name: 'title',
          dataType: 'text',
        },
        {
          name: 'content',
          dataType: 'text',
        },
        {
          name: 'category',
          dataType: 'text',
        },
        {
          name: 'metadata',
          dataType: 'text', // JSON string
        },
        {
          name: 'source',
          dataType: 'text',
        },
        {
          name: 'tags',
          dataType: 'text[]',
        }
      ],
      vectorizers: weaviate.configure.vectorizer.none(),
    })

    // Create BusinessData collection
    await client.collections.create({
      name: 'BusinessData',
      properties: [
        {
          name: 'businessName',
          dataType: 'text',
        },
        {
          name: 'industry',
          dataType: 'text',
        },
        {
          name: 'description',
          dataType: 'text',
        },
        {
          name: 'contactInfo',
          dataType: 'text', // JSON string
        },
        {
          name: 'campaignHistory',
          dataType: 'text', // JSON string
        },
        {
          name: 'audienceGroup',
          dataType: 'text',
        },
        {
          name: 'lastInteraction',
          dataType: 'date',
        }
      ],
      vectorizers: weaviate.configure.vectorizer.none(),
    })

    console.log('✅ Weaviate schema initialized')
  } catch (error) {
    console.error('❌ Failed to initialize Weaviate schema:', error)
    throw error
  }
}