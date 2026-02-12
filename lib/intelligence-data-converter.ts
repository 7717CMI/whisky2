/**
 * Convert manual input customer/distributor data to the format expected by components
 */

import type { CustomerData, DistributorData } from '@/components/dashboard-builder/IntelligenceDataInput'
import type { CustomerIntelligenceData, Customer } from './customer-intelligence-data'

/**
 * Convert manual customer input data to CustomerIntelligenceData format
 */
export function convertCustomerDataToIntelligenceFormat(
  customers: CustomerData[]
): CustomerIntelligenceData[] {
  // Group customers by region and endUserSegment
  const grouped = new Map<string, Customer[]>()
  
  customers.forEach((customerData) => {
    if (!customerData.name || !customerData.region || !customerData.endUserSegment) {
      return // Skip incomplete entries
    }
    
    const key = `${customerData.region}|||${customerData.endUserSegment}`
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    
    const customer: Customer = {
      id: customerData.id,
      name: customerData.name,
      region: customerData.region,
      endUserSegment: customerData.endUserSegment,
      type: customerData.endUserSegment === 'Hospital' ? 'hospital' 
            : customerData.endUserSegment === 'Speciality Center' ? 'speciality' 
            : customerData.endUserSegment === 'Research Institute' ? 'research'
            : 'pharmacy'
    }
    
    grouped.get(key)!.push(customer)
  })
  
  // Convert to CustomerIntelligenceData array
  const result: CustomerIntelligenceData[] = []
  grouped.forEach((customers, key) => {
    const [region, endUserSegment] = key.split('|||')
    result.push({
      region,
      endUserSegment,
      customerCount: customers.length,
      customers
    })
  })
  
  return result
}

/**
 * Convert manual distributor input data to DistributorsIntelligenceData format
 */
export function convertDistributorDataToIntelligenceFormat(
  distributors: DistributorData[]
): any {
  // Extract parent headers from first distributor's propositions
  const parentHeaders = distributors.length > 0 ? {
    prop1: distributors[0].proposition1 || 'COMPANY INFORMATION',
    prop2: distributors[0].proposition2 || 'CONTACT DETAILS',
    prop3: distributors[0].proposition3 || ''
  } : {
    prop1: 'COMPANY INFORMATION',
    prop2: 'CONTACT DETAILS',
    prop3: ''
  }
  
  // Convert to the format expected by DistributorsIntelligence component
  // Preserve all values as-is (including "xx", "N/A", etc.)
  const preserveValue = (val: any): any => {
    if (val === null || val === undefined || val === '') return null
    const str = String(val).trim()
    // Preserve "xx" and "XX" as-is
    if (str.toLowerCase() === 'xx') return 'xx'
    return str || null
  }
  
  const moduleData = distributors.map((dist, index) => ({
    id: dist.id,
    module: 'Module 1 - Standard',
    s_no: index + 1,
    company_name: preserveValue(dist.companyName) || '',
    year_established: preserveValue(dist.yearEstablished),
    headquarters_emirate: preserveValue(dist.headquarters),
    cities_regions_covered: preserveValue(dist.region),
    ownership_type: null,
    business_type: null,
    no_of_employees: null,
    key_contact_person: preserveValue((dist as any).contactName),
    designation_role: preserveValue((dist as any).role),
    email_address: preserveValue(dist.email),
    phone_whatsapp: preserveValue(dist.phone),
    linkedin_profile: null,
    website_url: preserveValue((dist as any).website),
    // Store all raw data for preservation
    rawData: dist as any,
    proposition1: dist.proposition1 || null,
    proposition2: dist.proposition2 || null,
    proposition3: dist.proposition3 || null,
    region: preserveValue(dist.region) || 'Unknown',
    segment: preserveValue(dist.segment) || 'Unknown'
  }))
  
  // Create sections based on parent headers
  const sections: Record<string, Record<string, string[]>> = {
    'Module 1 - Standard': {}
  }
  
  // Map columns to parent header sections
  if (parentHeaders.prop1) {
    sections['Module 1 - Standard'][parentHeaders.prop1] = [
      'company_name',
      'year_established',
      'headquarters_emirate',
      'cities_regions_covered',
      'ownership_type',
      'business_type',
      'no_of_employees'
    ]
  }
  
  if (parentHeaders.prop2) {
    sections['Module 1 - Standard'][parentHeaders.prop2] = [
      'key_contact_person',
      'designation_role',
      'email_address',
      'phone_whatsapp',
      'linkedin_profile',
      'website_url'
    ]
  }
  
  return {
    metadata: {
      source_file: 'Manual Input',
      modules: ['Module 1 - Standard'],
      module_info: {
        'Module 1 - Standard': {
          sections: Object.keys(sections['Module 1 - Standard']),
          total_fields: Object.keys(moduleData[0] || {}).length
        },
        'Module 2 - Advance': {
          sections: [],
          total_fields: 0
        },
        'Module 3 - Premium': {
          sections: [],
          total_fields: 0
        }
      },
      generated_at: new Date().toISOString(),
      parentHeaders: parentHeaders // Store for reference
    },
    data: {
      'Module 1 - Standard': moduleData,
      'Module 2 - Advance': [],
      'Module 3 - Premium': []
    },
    sections: sections,
    propositions: []
  }
}

