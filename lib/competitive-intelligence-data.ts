/**
 * Competitive Intelligence Data Generator
 * Generates data for competitive dashboard and market share analysis
 * Last updated: 2024
 */

import { CHART_COLORS } from '@/lib/chart-theme'

export interface Proposition {
  title: string
  description: string
  category: string
}

export interface CompanyData {
  id: string
  name: string
  headquarters: string
  ceo: string
  yearEstablished: number
  portfolio: string
  strategies: string[]
  regionalStrength: string
  overallRevenue: number // in USD Mn
  segmentalRevenue: number // in USD Mn for 2024
  marketShare: number // percentage
  propositions?: Proposition[] // Dynamic propositions array
}

export interface MarketShareData {
  company: string
  marketShare: number
  color: string
}

export interface CompetitiveIntelligenceData {
  metadata: {
    market: string
    year: number
    currency: string
    revenue_unit: string
    total_companies: number
  }
  companies: CompanyData[]
  market_share_data: MarketShareData[]
}

let cachedData: CompetitiveIntelligenceData | null = null

/**
 * Parse competitive intelligence CSV row and extract propositions
 */
function parsePropositionsFromRow(row: Record<string, any>): Proposition[] {
  const propositions: Proposition[] = []
  
  // Look for proposition fields (Proposition 1 Title, Proposition 1 Description, etc.)
  let propIndex = 1
  while (true) {
    const titleKey = `Proposition ${propIndex} Title`
    const descKey = `Proposition ${propIndex} Description`
    const catKey = `Proposition ${propIndex} Category`
    
    const title = row[titleKey]?.toString().trim()
    const description = row[descKey]?.toString().trim()
    const category = row[catKey]?.toString().trim()
    
    // If no title, stop looking for more propositions
    if (!title || title === 'N/A' || title === '') {
      break
    }
    
    propositions.push({
      title,
      description: description || '',
      category: category || 'General'
    })
    
    propIndex++
    
    // Safety limit - prevent infinite loops
    if (propIndex > 10) break
  }
  
  return propositions
}

/**
 * Parse competitive intelligence data from CSV/JSON format
 */
export function parseCompetitiveIntelligenceFromData(rows: Record<string, any>[]): CompanyData[] {
  return rows.map((row, index) => {
    const marketShare = parseFloat(row['Market Share (%)']?.toString().replace('%', '') || '0')
    const revenue = generateRevenue(marketShare)
    
    // Parse propositions from row
    const propositions = parsePropositionsFromRow(row)
    
    // Get company name for color lookup
    const companyName = row['Company Name']?.toString() || ''
    const color = companyColors[companyName] || companyColors['Others'] || '#94a3b8'
    
    return {
      id: (row['Company ID'] || companyName.toLowerCase().replace(/\s+/g, '-') || `company-${index}`).toString(),
      name: companyName,
      headquarters: row['Headquarters']?.toString() || '',
      ceo: row['CEO']?.toString() || '',
      yearEstablished: parseInt(row['Year Established']?.toString() || '0'),
      portfolio: row['Product/Service Portfolio']?.toString() || '',
      strategies: (row['Strategies (comma-separated)']?.toString() || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      regionalStrength: row['Regional Strength']?.toString() || '',
      overallRevenue: parseFloat(row['Overall Revenue (USD Mn)']?.toString() || revenue.overall.toString()),
      segmentalRevenue: parseFloat(row['Segmental Revenue (USD Mn)']?.toString() || revenue.segmental.toString()),
      marketShare: marketShare,
      propositions: propositions.length > 0 ? propositions : undefined,
      color: color
    }
  })
}

/**
 * Load competitive intelligence data from store or API
 */
export async function loadCompetitiveIntelligenceData(): Promise<CompetitiveIntelligenceData | null> {
  if (cachedData) {
    return cachedData
  }

  // Try to get data from store first (if uploaded via dashboard builder)
  // Only try this in browser environment (client-side)
  if (typeof window !== 'undefined') {
    try {
      const { useDashboardStore } = require('./store')
      const store = useDashboardStore.getState()
      
      if (store.competitiveIntelligenceData && store.competitiveIntelligenceData.rows && store.competitiveIntelligenceData.rows.length > 0) {
        console.log('Using competitive intelligence data from store')
        // Parse the store data
        const companies = parseCompetitiveIntelligenceFromData(store.competitiveIntelligenceData.rows)
        
        // Calculate market share data
        const marketShareData = companies.map((company, index) => ({
          company: company.name,
          marketShare: company.marketShare,
          color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
        }))
        
        const data: CompetitiveIntelligenceData = {
          metadata: {
            market: 'Competitive Intelligence Market',
            year: 2024,
            currency: 'USD',
            revenue_unit: 'Mn',
            total_companies: companies.length
          },
          companies,
          market_share_data: marketShareData
        }
        
        // Cache the data
        cachedData = data
        return cachedData
      }
    } catch (error) {
      console.warn('Could not access store for competitive intelligence data:', error)
    }
  }

  try {
    // Try to load from API endpoint
    const response = await fetch('/api/load-competitive-intelligence', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      // If file not found, return null to use fallback data
      if (response.status === 404) {
        console.log('Competitive intelligence CSV not found, using fallback data')
        return null
      }
      throw new Error(`Failed to load competitive intelligence: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Cache the data
    cachedData = data as CompetitiveIntelligenceData
    
    return cachedData
  } catch (error) {
    console.error('Error loading competitive intelligence data:', error)
    // Return null to use fallback data
    return null
  }
}

// Top pharmaceutical companies in head and neck cancer drugs market
const companies = [
  'Gaudron Bedstar',
  'Kandeltam',
  'Hebei Xing Chemical',
  'Hubei Jingchan Chutkan',
  'Vishno Barium (V.C.)',
  'Jiaxinxi Anheng Jianghua',
  'Nippon Chemical Industrial',
  'Sakai Chemical Industry',
  'Others'
]

// Company colors using the enterprise palette
const companyColors: Record<string, string> = {
  'Gaudron Bedstar': '#52B69A',      // Teal
  'Kandeltam': '#34A0A4',             // Medium Teal
  'Hebei Xing Chemical': '#D9ED92',   // Yellow Green
  'Hubei Jingchan Chutkan': '#184E77', // Navy Blue
  'Vishno Barium (V.C.)': '#B5E48C',  // Light Lime
  'Jiaxinxi Anheng Jianghua': '#1E6091', // Deep Blue
  'Nippon Chemical Industrial': '#168AAD', // Deep Teal
  'Sakai Chemical Industry': '#1A759F', // Blue Teal
  'Others': '#99D98C'                 // Medium Green
}

// Headquarters locations
const headquarters: Record<string, string> = {
  'Gaudron Bedstar': 'New York, USA',
  'Kandeltam': 'London, UK',
  'Hebei Xing Chemical': 'Hebei, China',
  'Hubei Jingchan Chutkan': 'Hubei, China',
  'Vishno Barium (V.C.)': 'Mumbai, India',
  'Jiaxinxi Anheng Jianghua': 'Jiangsu, China',
  'Nippon Chemical Industrial': 'Tokyo, Japan',
  'Sakai Chemical Industry': 'Osaka, Japan',
  'Others': 'Various'
}

// CEOs (simulated names)
const ceos: Record<string, string> = {
  'Gaudron Bedstar': 'Michael Anderson',
  'Kandeltam': 'Sarah Williams',
  'Hebei Xing Chemical': 'Zhang Wei',
  'Hubei Jingchan Chutkan': 'Li Ming',
  'Vishno Barium (V.C.)': 'Rajesh Kumar',
  'Jiaxinxi Anheng Jianghua': 'Wang Xiaoping',
  'Nippon Chemical Industrial': 'Takeshi Yamamoto',
  'Sakai Chemical Industry': 'Hiroshi Tanaka',
  'Others': 'Multiple'
}

// Year established
const yearEstablished: Record<string, number> = {
  'Gaudron Bedstar': 1985,
  'Kandeltam': 1992,
  'Hebei Xing Chemical': 2001,
  'Hubei Jingchan Chutkan': 1998,
  'Vishno Barium (V.C.)': 1987,
  'Jiaxinxi Anheng Jianghua': 2003,
  'Nippon Chemical Industrial': 1978,
  'Sakai Chemical Industry': 1982,
  'Others': 0
}

// Product portfolios
const portfolios: Record<string, string> = {
  'Gaudron Bedstar': 'Immunotherapy, Targeted Therapy',
  'Kandeltam': 'Chemotherapy, Clinical Trials',
  'Hebei Xing Chemical': 'Generic Drugs, APIs',
  'Hubei Jingchan Chutkan': 'Traditional Medicine, Oncology',
  'Vishno Barium (V.C.)': 'Biosimilars, Generics',
  'Jiaxinxi Anheng Jianghua': 'APIs, Intermediates',
  'Nippon Chemical Industrial': 'Innovative Drugs, Biologics',
  'Sakai Chemical Industry': 'Specialty Chemicals, Oncology',
  'Others': 'Various Products'
}

// Regional strengths
const regionalStrengths: Record<string, string> = {
  'Gaudron Bedstar': 'North America, Europe',
  'Kandeltam': 'Europe, Asia Pacific',
  'Hebei Xing Chemical': 'China, Southeast Asia',
  'Hubei Jingchan Chutkan': 'China, Latin America',
  'Vishno Barium (V.C.)': 'India, Middle East',
  'Jiaxinxi Anheng Jianghua': 'China, Africa',
  'Nippon Chemical Industrial': 'Japan, North America',
  'Sakai Chemical Industry': 'Japan, Europe',
  'Others': 'Global'
}

// Market share percentages (must sum to 100)
const marketShares: Record<string, number> = {
  'Gaudron Bedstar': 25.0,
  'Kandeltam': 8.0,
  'Hebei Xing Chemical': 42.0,
  'Hubei Jingchan Chutkan': 3.0,
  'Vishno Barium (V.C.)': 5.0,
  'Jiaxinxi Anheng Jianghua': 4.0,
  'Nippon Chemical Industrial': 2.0,
  'Sakai Chemical Industry': 1.0,
  'Others': 10.0
}

// Generate strategies based on company type
function generateStrategies(company: string): string[] {
  const strategyMap: Record<string, string[]> = {
    'Gaudron Bedstar': ['Innovation Focus', 'M&A Strategy', 'Digital Health'],
    'Kandeltam': ['Clinical Excellence', 'Partnership Model', 'EU Expansion'],
    'Hebei Xing Chemical': ['Cost Leadership', 'Volume Growth', 'API Integration'],
    'Hubei Jingchan Chutkan': ['Traditional Integration', 'Local Markets', 'R&D Investment'],
    'Vishno Barium (V.C.)': ['Biosimilar Development', 'Emerging Markets', 'Affordability'],
    'Jiaxinxi Anheng Jianghua': ['Supply Chain', 'Manufacturing Scale', 'Export Focus'],
    'Nippon Chemical Industrial': ['Technology Innovation', 'Quality Excellence', 'Global Partnerships'],
    'Sakai Chemical Industry': ['Niche Markets', 'Specialty Focus', 'Research Collaboration'],
    'Others': ['Diverse Strategies', 'Regional Focus', 'Market Specific']
  }
  
  return strategyMap[company] || ['Market Development', 'Product Innovation', 'Strategic Partnerships']
}

// Generate propositions based on company type
function generatePropositions(company: string): Proposition[] {
  const propositionMap: Record<string, Proposition[]> = {
    'Gaudron Bedstar': [
      { title: 'Advanced Immunotherapy Solutions', description: 'Leading-edge CAR-T cell therapy with 95% success rate in clinical trials', category: 'Product Innovation' },
      { title: 'Personalized Treatment Plans', description: 'Customized treatment protocols based on genetic profiling', category: 'Service Excellence' },
      { title: 'Global Clinical Network', description: 'Access to 200+ clinical trial sites worldwide', category: 'Market Reach' }
    ],
    'Kandeltam': [
      { title: 'Cost-Effective Chemotherapy', description: 'Generic alternatives at 40% lower cost than branded drugs', category: 'Price Advantage' },
      { title: 'Regulatory Compliance', description: 'Full EU MDR and FDA compliance with fast-track approval', category: 'Regulatory' },
      { title: 'Partnership Programs', description: 'Strategic alliances with 50+ European hospitals', category: 'Strategic Alliances' }
    ],
    'Hebei Xing Chemical': [
      { title: 'Bulk API Manufacturing', description: 'World\'s largest API production capacity with 24/7 operations', category: 'Manufacturing Scale' },
      { title: 'Supply Chain Integration', description: 'End-to-end supply chain from raw materials to finished products', category: 'Supply Chain' },
      { title: 'Quality Assurance', description: 'ISO 9001 and cGMP certified with 99.8% quality rating', category: 'Quality Standards' }
    ],
    'Hubei Jingchan Chutkan': [
      { title: 'Traditional Medicine Integration', description: 'Combining ancient Chinese medicine with modern oncology treatments', category: 'Cultural Approach' },
      { title: 'Local Market Expertise', description: 'Deep understanding of Asian and Latin American healthcare systems', category: 'Market Knowledge' },
      { title: 'R&D Investment', description: 'Annual R&D investment of $50M in traditional medicine research', category: 'Research & Development' }
    ],
    'Vishno Barium (V.C.)': [
      { title: 'Biosimilar Development', description: 'First-to-market biosimilars at 60% cost reduction', category: 'Biosimilars' },
      { title: 'Emerging Market Focus', description: 'Specialized solutions for price-sensitive emerging markets', category: 'Market Strategy' },
      { title: 'Affordable Healthcare', description: 'Making advanced treatments accessible to underserved populations', category: 'Social Impact' }
    ],
    'Jiaxinxi Anheng Jianghua': [
      { title: 'Export-Optimized Supply Chain', description: 'Streamlined logistics for global distribution with 48-hour delivery', category: 'Logistics' },
      { title: 'Manufacturing Excellence', description: 'State-of-the-art facilities with automated production lines', category: 'Manufacturing' },
      { title: 'Quality Control', description: 'Multi-stage QC process ensuring 100% batch consistency', category: 'Quality Assurance' }
    ],
    'Nippon Chemical Industrial': [
      { title: 'Technology Innovation', description: 'AI-powered drug discovery platform reducing development time by 40%', category: 'Technology' },
      { title: 'Quality Excellence', description: 'Zero-defect manufacturing with Six Sigma certification', category: 'Quality Standards' },
      { title: 'Global Partnerships', description: 'Strategic collaborations with top 10 pharma companies worldwide', category: 'Strategic Partnerships' }
    ],
    'Sakai Chemical Industry': [
      { title: 'Specialty Chemical Solutions', description: 'Custom-formulated specialty chemicals for niche oncology applications', category: 'Specialty Products' },
      { title: 'Research Collaboration', description: 'Active partnerships with 15 leading research institutions', category: 'Research Partnerships' },
      { title: 'Niche Market Expertise', description: 'Deep specialization in rare cancer treatments', category: 'Market Specialization' }
    ],
    'Others': [
      { title: 'Market-Specific Solutions', description: 'Tailored products and services for regional market needs', category: 'Market Adaptation' },
      { title: 'Regional Focus', description: 'Strong presence in local markets with cultural understanding', category: 'Local Expertise' },
      { title: 'Diverse Product Portfolio', description: 'Wide range of products covering multiple therapeutic areas', category: 'Product Diversity' }
    ]
  }
  
  return propositionMap[company] || [
    { title: 'Market Development', description: 'Expanding into new markets and segments', category: 'Market Strategy' },
    { title: 'Product Innovation', description: 'Continuous R&D and product development', category: 'Innovation' },
    { title: 'Strategic Partnerships', description: 'Building alliances for market expansion', category: 'Partnerships' }
  ]
}

// Generate revenue based on market share
function generateRevenue(marketShare: number): { overall: number, segmental: number } {
  // Total market size approximately 5000 USD Mn
  const totalMarketSize = 5000
  const segmentalRevenue = (marketShare / 100) * totalMarketSize
  
  // Overall revenue is typically 3-5x the segmental revenue (company has other products)
  const multiplier = 3 + Math.random() * 2
  const overallRevenue = segmentalRevenue * multiplier
  
  return {
    overall: Math.round(overallRevenue),
    segmental: Math.round(segmentalRevenue)
  }
}

/**
 * Generate competitive intelligence data for all companies
 * Now loads from store, JSON file, or fallback to hardcoded data
 * Can also accept parsed CSV data
 */
export async function generateCompetitiveData(csvData?: Record<string, any>[]): Promise<CompanyData[]> {
  // If CSV data is provided, parse it
  if (csvData && csvData.length > 0) {
    return parseCompetitiveIntelligenceFromData(csvData)
  }
  
  // Try to get data from store first (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      const { useDashboardStore } = require('./store')
      const store = useDashboardStore.getState()
      
      if (store.competitiveIntelligenceData && store.competitiveIntelligenceData.rows && store.competitiveIntelligenceData.rows.length > 0) {
        console.log('Using competitive intelligence data from store for generateCompetitiveData')
        return parseCompetitiveIntelligenceFromData(store.competitiveIntelligenceData.rows)
      }
    } catch (error) {
      console.warn('Could not access store for competitive intelligence data:', error)
    }
  }
  
  const jsonData = await loadCompetitiveIntelligenceData()
  
  if (jsonData && jsonData.companies) {
    return jsonData.companies
  }
  
  // Fallback to hardcoded data
  return companies.map(company => {
    const revenue = generateRevenue(marketShares[company])
    
    // Generate sample propositions based on company
    const propositions: Proposition[] = generatePropositions(company)
    
    return {
      id: company.toLowerCase().replace(/\s+/g, '-'),
      name: company,
      headquarters: headquarters[company],
      ceo: ceos[company],
      yearEstablished: yearEstablished[company],
      portfolio: portfolios[company],
      strategies: generateStrategies(company),
      regionalStrength: regionalStrengths[company],
      overallRevenue: revenue.overall,
      segmentalRevenue: revenue.segmental,
      marketShare: marketShares[company],
      propositions,
      color: companyColors[company]
    }
  })
}

/**
 * Generate market share data for pie chart
 * Now loads from JSON file, with fallback to hardcoded data
 * Groups smaller companies into "Others" to reduce clutter
 */
export async function generateMarketShareData(showTopN: number = 10): Promise<MarketShareData[]> {
  const jsonData = await loadCompetitiveIntelligenceData()
  
  let allData: MarketShareData[]
  
  if (jsonData && jsonData.market_share_data) {
    allData = jsonData.market_share_data
  } else {
    // Fallback to hardcoded data
    allData = companies.map(company => ({
      company,
      marketShare: marketShares[company],
      color: companyColors[company]
    }))
  }
  
  // Sort by market share (descending)
  const sorted = [...allData].sort((a, b) => b.marketShare - a.marketShare)
  
  // Take top N companies
  const topCompanies = sorted.slice(0, showTopN)
  
  // Group the rest into "Others"
  const othersShare = sorted.slice(showTopN).reduce((sum, c) => sum + c.marketShare, 0)
  
  if (othersShare > 0) {
    topCompanies.push({
      company: 'Others',
      marketShare: othersShare,
      color: '#94a3b8' // Gray color for Others
    })
  }
  
  return topCompanies
}

/**
 * Get top companies by market share
 */
export async function getTopCompanies(limit: number = 5): Promise<CompanyData[]> {
  const allCompanies = await generateCompetitiveData()
  return allCompanies
    .filter(c => c.name !== 'Others')
    .sort((a, b) => b.marketShare - a.marketShare)
    .slice(0, limit)
}

/**
 * Calculate market concentration (HHI - Herfindahl-Hirschman Index)
 */
export function calculateMarketConcentration(): { hhi: number; concentration: string } {
  const shares = Object.values(marketShares)
  const hhi = shares.reduce((sum, share) => sum + Math.pow(share, 2), 0)
  
  let concentration = 'Competitive'
  if (hhi < 1500) {
    concentration = 'Competitive'
  } else if (hhi < 2500) {
    concentration = 'Moderately Concentrated'
  } else {
    concentration = 'Highly Concentrated'
  }
  
  return { hhi: Math.round(hhi), concentration }
}

/**
 * Get company comparison data for competitive dashboard
 * Now includes propositions with parent/child header structure
 */
export async function getCompanyComparison(): Promise<{
  headers: string[];
  rows: { 
    label: string; 
    values: (string | number)[]; 
    section?: string; // Parent section header
    isProposition?: boolean; // Flag for proposition rows
  }[];
  sections?: string[]; // List of section headers
}> {
  const companies = (await generateCompetitiveData()).slice(0, 10) // Top 10 companies
  
  const headers = companies.map(c => c.name)
  
  // Find maximum number of propositions across all companies
  const maxPropositions = Math.max(
    ...companies.map(c => c.propositions?.length || 0),
    3 // Default to 3 if no propositions
  )
  
  const rows: { 
    label: string; 
    values: (string | number)[]; 
    section?: string;
    isProposition?: boolean;
  }[] = [
    {
      label: "Headquarters",
      values: companies.map(c => c.headquarters),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Key Management (CEO)",
      values: companies.map(c => c.ceo),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Year of Establishment",
      values: companies.map(c => c.yearEstablished || 'N/A'),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Product/Service Portfolio",
      values: companies.map(c => c.portfolio),
      section: "PRODUCT & SERVICES"
    },
    {
      label: "Strategies/Recent Developments",
      values: companies.map(c => c.strategies.join(', ')),
      section: "STRATEGY & DEVELOPMENT"
    },
    {
      label: "Regional Strength",
      values: companies.map(c => c.regionalStrength),
      section: "MARKET PRESENCE"
    },
    {
      label: "Overall Revenue (USD Mn)",
      values: companies.map(c => c.overallRevenue.toLocaleString()),
      section: "FINANCIAL METRICS"
    },
    {
      label: "Segmental Revenue (USD Mn), 2024",
      values: companies.map(c => c.segmentalRevenue.toLocaleString()),
      section: "FINANCIAL METRICS"
    },
    {
      label: "Market Share (%)",
      values: companies.map(c => c.marketShare.toFixed(1) + '%'),
      section: "FINANCIAL METRICS"
    }
  ]
  
  // Add proposition rows dynamically
  if (maxPropositions > 0) {
    for (let i = 0; i < maxPropositions; i++) {
      const propIndex = i + 1
      
      // Proposition Title row
      rows.push({
        label: `Proposition ${propIndex} - Title`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.title || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
      
      // Proposition Description row
      rows.push({
        label: `Proposition ${propIndex} - Description`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.description || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
      
      // Proposition Category row
      rows.push({
        label: `Proposition ${propIndex} - Category`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.category || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
    }
  }
  
  // Extract unique sections
  const sections = Array.from(new Set(rows.map(r => r.section).filter(Boolean))) as string[]
  
  return { headers, rows, sections }
}
