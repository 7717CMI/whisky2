/**
 * Distributors Intelligence Data Types and Utilities
 * Handles data loading and processing for Distributors Intelligence Database
 */

// Base distributor interface (Module 1 - Standard)
export interface BaseDistributor {
  id: string
  module: string
  s_no: number | null
  // Company Information
  company_name: string | null
  year_established: string | null
  headquarters_emirate: string | null
  cities_regions_covered: string | null
  ownership_type: string | null
  business_type: string | null
  no_of_employees: string | null
  // Contact Details
  key_contact_person: string | null
  designation_role: string | null
  email_address: string | null
  phone_whatsapp: string | null
  linkedin_profile: string | null
  website_url: string | null
}

// Module 2 - Advance (adds Product Portfolio)
export interface AdvanceDistributor extends BaseDistributor {
  turnover_scale?: string | null
  // Product Portfolio
  core_product_categories?: string | null
  specialty_focus?: string | null
  price_segment?: string | null
}

// Module 3 - Premium (adds Brands, Channels, Coverage, Insights)
export interface PremiumDistributor extends AdvanceDistributor {
  // Brands Distributed
  key_brands_represented?: string | null
  exclusive_partnerships?: string | null
  duration_partnerships?: string | null
  // Distribution Channels
  retail_chains?: string | null
  pharmacies?: string | null
  spas_salons_clinics?: string | null
  ecommerce_platforms?: string | null
  channel_strength?: string | null
  distribution_type?: string | null
  // Regional & Operational Coverage
  emirates_served?: string | null
  regional_extensions?: string | null
  warehouse_logistics?: string | null
  delivery_storage?: string | null
  // CMI Insights
  competitive_benchmarking?: string | null
  additional_comments?: string | null
}

// Union type for all distributor types
export type Distributor = BaseDistributor | AdvanceDistributor | PremiumDistributor

export interface ModuleInfo {
  sections: string[]
  total_fields: number
}

export interface DistributorsIntelligenceData {
  metadata: {
    source_file: string
    modules: string[]
    module_info: {
      'Module 1 - Standard': ModuleInfo
      'Module 2 - Advance': ModuleInfo
      'Module 3 - Premium': ModuleInfo
    }
    generated_at: string
  }
  data: {
    'Module 1 - Standard': BaseDistributor[]
    'Module 2 - Advance': AdvanceDistributor[]
    'Module 3 - Premium': PremiumDistributor[]
  }
  sections: {
    'Module 1 - Standard': Record<string, string[]>
    'Module 2 - Advance': Record<string, string[]>
    'Module 3 - Premium': Record<string, string[]>
  }
}

let cachedData: DistributorsIntelligenceData | null = null

/**
 * Load distributors intelligence data from API
 */
export async function loadDistributorsIntelligenceData(): Promise<DistributorsIntelligenceData | null> {
  if (cachedData) {
    return cachedData
  }

  try {
    // Return null - no data in clean version
    return null
  } catch (error) {
    console.error('Error loading distributors intelligence data:', error)
    return null
  }
}

/**
 * Get distributors for a specific module
 */
export function getDistributorsForModule(
  data: DistributorsIntelligenceData | null,
  module: string
): Distributor[] {
  if (!data) return []
  
  const moduleKey = module as keyof typeof data.data
  return data.data[moduleKey] || []
}

/**
 * Get total count of distributors for a module
 */
export function getDistributorCountForModule(
  data: DistributorsIntelligenceData | null,
  module: string
): number {
  return getDistributorsForModule(data, module).length
}

/**
 * Get all available modules
 */
export function getAvailableModules(data: DistributorsIntelligenceData | null): string[] {
  if (!data) return []
  return data.metadata.modules || []
}

/**
 * Get module info (sections and field count)
 */
export function getModuleInfo(
  data: DistributorsIntelligenceData | null,
  module: string
): ModuleInfo | null {
  if (!data) return null
  const moduleKey = module as keyof typeof data.metadata.module_info
  return data.metadata.module_info[moduleKey] || null
}

/**
 * Get sections for a module
 */
export function getModuleSections(
  data: DistributorsIntelligenceData | null,
  module: string
): Record<string, string[]> {
  if (!data) return {}
  const moduleKey = module as keyof typeof data.sections
  return data.sections[moduleKey] || {}
}

/**
 * Format distributor data for display
 */
export function formatDistributorField(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  const str = String(value).trim()
  if (str === '' || str === 'null' || str === 'undefined') return 'N/A'
  // Preserve "xx" values
  if (str.toLowerCase() === 'xx') return 'xx'
  return str
}

/**
 * Get table columns with sections for a module
 */
export interface TableColumn {
  key: string
  label: string
  section: string
  width?: string
}

export function getTableColumnsForModule(
  data: DistributorsIntelligenceData | null,
  module: string
): TableColumn[] {
  const columns: TableColumn[] = []
  
  // Try to get sections from metadata if available
  const parentHeaders = (data?.metadata as any)?.parentHeaders
  const section1 = parentHeaders?.prop1 || 'COMPANY INFORMATION'
  const section2 = parentHeaders?.prop2 || 'CONTACT DETAILS'
  
  if (module.includes('Standard')) {
    columns.push(
      { key: 's_no', label: 'S.No.', section: '' },
      { key: 'company_name', label: 'Company Name', section: section1 },
      { key: 'year_established', label: 'Year Established', section: section1 },
      { key: 'headquarters_emirate', label: 'Headquarters / Emirate', section: section1 },
      { key: 'cities_regions_covered', label: 'Cities / Regions Covered', section: section1 },
      { key: 'ownership_type', label: 'Ownership Type', section: section1 },
      { key: 'business_type', label: 'Business Type', section: section1 },
      { key: 'no_of_employees', label: 'No. of Employees', section: section1 },
      { key: 'key_contact_person', label: 'Key Contact Person', section: section2 },
      { key: 'designation_role', label: 'Designation / Role', section: section2 },
      { key: 'email_address', label: 'Email Address', section: section2 },
      { key: 'phone_whatsapp', label: 'Phone / WhatsApp', section: section2 },
      { key: 'linkedin_profile', label: 'LinkedIn Profile', section: section2 },
      { key: 'website_url', label: 'Website URL', section: section2 }
    )
  } else if (module.includes('Advance')) {
    // Module 2 - Advance (18 fields)
    columns.push(
      // Company Information (8 fields - adds Turnover/Scale)
      { key: 'company_name', label: 'Company Name', section: 'COMPANY INFORMATION' },
      { key: 'year_established', label: 'Year Established', section: 'COMPANY INFORMATION' },
      { key: 'headquarters_emirate', label: 'Headquarters / Emirate', section: 'COMPANY INFORMATION' },
      { key: 'cities_regions_covered', label: 'Cities / Regions Covered', section: 'COMPANY INFORMATION' },
      { key: 'ownership_type', label: 'Ownership Type', section: 'COMPANY INFORMATION' },
      { key: 'business_type', label: 'Business Type', section: 'COMPANY INFORMATION' },
      { key: 'no_of_employees', label: 'No. of Employees', section: 'COMPANY INFORMATION' },
      { key: 'turnover_scale', label: 'Turnover / Scale', section: 'COMPANY INFORMATION' },
      // Contact Details (6 fields)
      { key: 'key_contact_person', label: 'Key Contact Person', section: 'CONTACT DETAILS' },
      { key: 'designation_role', label: 'Designation / Role', section: 'CONTACT DETAILS' },
      { key: 'email_address', label: 'Email Address', section: 'CONTACT DETAILS' },
      { key: 'phone_whatsapp', label: 'Phone / WhatsApp', section: 'CONTACT DETAILS' },
      { key: 'linkedin_profile', label: 'LinkedIn Profile', section: 'CONTACT DETAILS' },
      { key: 'website_url', label: 'Website URL', section: 'CONTACT DETAILS' },
      // Product Portfolio (3 fields)
      { key: 'core_product_categories', label: 'Core Product Categories', section: 'PRODUCT PORTFOLIO' },
      { key: 'specialty_focus', label: 'Specialty Focus', section: 'PRODUCT PORTFOLIO' },
      { key: 'price_segment', label: 'Price Segment', section: 'PRODUCT PORTFOLIO' }
    )
  } else if (module.includes('Premium')) {
    // Module 3 - Premium (33 fields)
    columns.push(
      // Company Information (8 fields)
      { key: 'company_name', label: 'Company Name', section: 'COMPANY INFORMATION' },
      { key: 'year_established', label: 'Year Established', section: 'COMPANY INFORMATION' },
      { key: 'headquarters_emirate', label: 'Headquarters / Emirate', section: 'COMPANY INFORMATION' },
      { key: 'cities_regions_covered', label: 'Cities / Regions Covered', section: 'COMPANY INFORMATION' },
      { key: 'ownership_type', label: 'Ownership Type', section: 'COMPANY INFORMATION' },
      { key: 'business_type', label: 'Business Type', section: 'COMPANY INFORMATION' },
      { key: 'no_of_employees', label: 'No. of Employees', section: 'COMPANY INFORMATION' },
      { key: 'turnover_scale', label: 'Turnover / Scale', section: 'COMPANY INFORMATION' },
      // Contact Details (6 fields)
      { key: 'key_contact_person', label: 'Key Contact Person', section: 'CONTACT DETAILS' },
      { key: 'designation_role', label: 'Designation / Role', section: 'CONTACT DETAILS' },
      { key: 'email_address', label: 'Email Address', section: 'CONTACT DETAILS' },
      { key: 'phone_whatsapp', label: 'Phone / WhatsApp', section: 'CONTACT DETAILS' },
      { key: 'linkedin_profile', label: 'LinkedIn Profile', section: 'CONTACT DETAILS' },
      { key: 'website_url', label: 'Website URL', section: 'CONTACT DETAILS' },
      // Product Portfolio (3 fields)
      { key: 'core_product_categories', label: 'Core Product Categories', section: 'PRODUCT PORTFOLIO' },
      { key: 'specialty_focus', label: 'Specialty Focus', section: 'PRODUCT PORTFOLIO' },
      { key: 'price_segment', label: 'Price Segment', section: 'PRODUCT PORTFOLIO' },
      // Brands Distributed (3 fields)
      { key: 'key_brands_represented', label: 'Key Brands Represented', section: 'BRANDS DISTRIBUTED' },
      { key: 'exclusive_partnerships', label: 'Exclusive Partnerships', section: 'BRANDS DISTRIBUTED' },
      { key: 'duration_partnerships', label: 'Duration of Partnerships', section: 'BRANDS DISTRIBUTED' },
      // Distribution Channels (6 fields)
      { key: 'retail_chains', label: 'Retail Chains', section: 'DISTRIBUTION CHANNELS' },
      { key: 'pharmacies', label: 'Pharmacies', section: 'DISTRIBUTION CHANNELS' },
      { key: 'spas_salons_clinics', label: 'Spas / Salons / Clinics', section: 'DISTRIBUTION CHANNELS' },
      { key: 'ecommerce_platforms', label: 'E-commerce Platforms', section: 'DISTRIBUTION CHANNELS' },
      { key: 'channel_strength', label: 'Channel Strength', section: 'DISTRIBUTION CHANNELS' },
      { key: 'distribution_type', label: 'Distribution Type', section: 'DISTRIBUTION CHANNELS' },
      // Regional & Operational Coverage (4 fields)
      { key: 'emirates_served', label: 'Emirates Served', section: 'REGIONAL & OPERATIONAL COVERAGE' },
      { key: 'regional_extensions', label: 'Regional Extensions', section: 'REGIONAL & OPERATIONAL COVERAGE' },
      { key: 'warehouse_logistics', label: 'Warehouse / Logistics', section: 'REGIONAL & OPERATIONAL COVERAGE' },
      { key: 'delivery_storage', label: 'Delivery / Storage', section: 'REGIONAL & OPERATIONAL COVERAGE' },
      // CMI Insights (2 fields)
      { key: 'competitive_benchmarking', label: 'Competitive Benchmarking', section: 'CMI INSIGHTS' },
      { key: 'additional_comments', label: 'Additional Comments', section: 'CMI INSIGHTS' }
    )
  }

  return columns
}

/**
 * Get section headers for table
 */
export function getTableSections(columns: TableColumn[]): string[] {
  const sections: string[] = []
  let lastSection = ''
  
  columns.forEach(col => {
    if (col.section && col.section !== lastSection) {
      sections.push(col.section)
      lastSection = col.section
    }
  })
  
  return [...new Set(sections)]
}

/**
 * Get columns for a specific section
 */
export function getColumnsForSection(columns: TableColumn[], section: string): TableColumn[] {
  return columns.filter(col => col.section === section)
}