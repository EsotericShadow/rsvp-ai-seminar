import { fetchLeadMineBusinesses } from '@/lib/leadMine'

async function analyzeBusinessData() {
  console.log('🔍 Analyzing LeadMine business data to understand segmentation...')
  
  try {
    // Fetch a sample of businesses to analyze
    const response = await fetchLeadMineBusinesses({
      limit: 100,
      hasEmail: true,
    })
    
    console.log(`📊 Found ${response.data.length} businesses with emails`)
    console.log('\n📋 Sample business data structure:')
    
    // Show first few businesses to understand the data
    response.data.slice(0, 5).forEach((business, index) => {
      console.log(`\n--- Business ${index + 1} ---`)
      console.log(`Name: ${business.name}`)
      console.log(`Email: ${business.contact.primaryEmail}`)
      console.log(`Contact Person: ${business.contact.contactPerson}`)
      console.log(`Tags: ${JSON.stringify(business.contact.tags)}`)
      console.log(`Website: ${business.website}`)
      console.log(`Address: ${business.address}`)
    })
    
    // Analyze patterns in business names
    console.log('\n🔍 Analyzing business name patterns...')
    
    const namePatterns = {
      numbered: [],
      personalNames: [],
      chains: [],
      identifiable: [],
      unclear: []
    }
    
    response.data.forEach(business => {
      const name = business.name || ''
      
      // Check for numbered businesses (like "Business 123", "Company #456")
      if (/^\w+\s*[#\d]+\s*$|^\w+\s+\d+$/.test(name.trim())) {
        namePatterns.numbered.push({ name, email: business.contact.primaryEmail })
      }
      // Check for personal names without business identifiers
      else if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim()) && 
               !name.toLowerCase().includes('inc') && 
               !name.toLowerCase().includes('llc') && 
               !name.toLowerCase().includes('corp') &&
               !name.toLowerCase().includes('ltd') &&
               !name.toLowerCase().includes('group') &&
               !name.toLowerCase().includes('company')) {
        namePatterns.personalNames.push({ name, email: business.contact.primaryEmail })
      }
      // Check for known chains/franchises (basic patterns)
      else if (name.toLowerCase().includes('mcdonald') ||
               name.toLowerCase().includes('starbucks') ||
               name.toLowerCase().includes('subway') ||
               name.toLowerCase().includes('pizza hut') ||
               name.toLowerCase().includes('dominos') ||
               name.toLowerCase().includes('kfc') ||
               name.toLowerCase().includes('burger king') ||
               name.toLowerCase().includes('wendys') ||
               name.toLowerCase().includes('tim hortons') ||
               name.toLowerCase().includes('dunkin') ||
               name.toLowerCase().includes('walgreens') ||
               name.toLowerCase().includes('cvs') ||
               name.toLowerCase().includes('walmart') ||
               name.toLowerCase().includes('target') ||
               name.toLowerCase().includes('home depot') ||
               name.toLowerCase().includes('lowes')) {
        namePatterns.chains.push({ name, email: business.contact.primaryEmail })
      }
      // Everything else is potentially identifiable
      else {
        namePatterns.identifiable.push({ name, email: business.contact.primaryEmail })
      }
    })
    
    console.log('\n📈 Pattern Analysis Results:')
    console.log(`Numbered Businesses: ${namePatterns.numbered.length}`)
    console.log(`Personal Names: ${namePatterns.personalNames.length}`)
    console.log(`Chains/Franchises: ${namePatterns.chains.length}`)
    console.log(`Identifiable Businesses: ${namePatterns.identifiable.length}`)
    
    // Show examples of each category
    console.log('\n🔢 Numbered Business Examples:')
    namePatterns.numbered.slice(0, 5).forEach(b => console.log(`  - ${b.name} (${b.email})`))
    
    console.log('\n👤 Personal Name Examples:')
    namePatterns.personalNames.slice(0, 5).forEach(b => console.log(`  - ${b.name} (${b.email})`))
    
    console.log('\n🏢 Chain/Franchise Examples:')
    namePatterns.chains.slice(0, 5).forEach(b => console.log(`  - ${b.name} (${b.email})`))
    
    console.log('\n✅ Identifiable Business Examples:')
    namePatterns.identifiable.slice(0, 10).forEach(b => console.log(`  - ${b.name} (${b.email})`))
    
    // Analyze tags to understand business categories
    console.log('\n🏷️ Analyzing business tags...')
    const allTags = new Set<string>()
    response.data.forEach(business => {
      business.contact.tags.forEach(tag => allTags.add(tag))
    })
    
    console.log(`Found ${allTags.size} unique tags:`)
    Array.from(allTags).sort().forEach(tag => console.log(`  - ${tag}`))
    
    console.log('\n📋 Next Steps:')
    console.log('1. Create audience groups based on these patterns')
    console.log('2. Start with "Numbered Businesses" group')
    console.log('3. Then "Personal Names" group') 
    console.log('4. Then "Chains/Franchises" (to avoid)')
    console.log('5. Finally segment "Identifiable Businesses" by industry/tags')
    
  } catch (error) {
    console.error('❌ Failed to analyze business data:', error)
    throw error
  }
}

analyzeBusinessData()
  .then(() => {
    console.log('\n✅ Business data analysis complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })
