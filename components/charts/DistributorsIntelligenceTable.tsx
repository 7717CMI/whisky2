'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useDashboardStore } from '@/lib/store'
import {
  loadDistributorsIntelligenceData,
  getDistributorsForModule,
  getDistributorCountForModule,
  getAvailableModules,
  getModuleInfo,
  formatDistributorField,
  getTableColumnsForModule,
  getTableSections,
  type DistributorsIntelligenceData,
  type Distributor,
  type PremiumDistributor,
  type TableColumn
} from '@/lib/distributors-intelligence-data'
import { convertDistributorDataToIntelligenceFormat } from '@/lib/intelligence-data-converter'
import { CHART_COLORS } from '@/lib/chart-theme'

interface DistributorsIntelligenceProps {
  title?: string
  height?: number
}

interface DistributorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  distributor: Distributor | null
  module: string
}

function DistributorDetailModal({ isOpen, onClose, distributor, module }: DistributorDetailModalProps) {
  if (!isOpen || !distributor) return null

  // Cast to PremiumDistributor to access all possible fields
  const dist = distributor as PremiumDistributor

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black">Distributor Details</h2>
            <p className="text-sm text-black mt-1">
              {formatDistributorField(dist.company_name)} - {module}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company Information - 8 fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2 text-orange-600">Company Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-black uppercase">1. Company Name</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.company_name)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">2. Year Established</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.year_established)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">3. Headquarters / Emirate</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.headquarters_emirate)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">4. Cities / Regions Covered</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.cities_regions_covered)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">5. Ownership Type</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.ownership_type)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">6. Business Type</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.business_type)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">7. No. of Employees</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.no_of_employees)}</p>
                </div>
                
                {(module.includes('Advance') || module.includes('Premium')) && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">8. Turnover / Scale</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.turnover_scale)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details - 6 fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2 text-blue-600">Contact Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-black uppercase">9. Key Contact Person</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.key_contact_person)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">10. Designation / Role</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.designation_role)}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">11. Email Address</label>
                  <p className="text-sm text-black mt-1">
                    {dist.email_address && dist.email_address !== 'xx' ? (
                      <a 
                        href={`mailto:${dist.email_address}`}
                        className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                      >
                        {formatDistributorField(dist.email_address)}
                      </a>
                    ) : (
                      formatDistributorField(dist.email_address)
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">12. Phone / WhatsApp</label>
                  <p className="text-sm text-black mt-1">
                    {dist.phone_whatsapp && dist.phone_whatsapp !== 'xx' ? (
                      <a 
                        href={`tel:${dist.phone_whatsapp}`}
                        className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                      >
                        {formatDistributorField(dist.phone_whatsapp)}
                      </a>
                    ) : (
                      formatDistributorField(dist.phone_whatsapp)
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">13. LinkedIn Profile</label>
                  <p className="text-sm text-black mt-1">
                    {dist.linkedin_profile && dist.linkedin_profile !== 'xx' ? (
                      <a 
                        href={dist.linkedin_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                      >
                        {formatDistributorField(dist.linkedin_profile)}
                      </a>
                    ) : (
                      formatDistributorField(dist.linkedin_profile)
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-black uppercase">14. Website URL</label>
                  <p className="text-sm text-black mt-1">
                    {dist.website_url && dist.website_url !== 'xx' ? (
                      <a 
                        href={dist.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                      >
                        {formatDistributorField(dist.website_url)}
                      </a>
                    ) : (
                      formatDistributorField(dist.website_url)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Portfolio (Module 2 & 3) - 3 fields */}
            {(module.includes('Advance') || module.includes('Premium')) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2 text-green-600">Product Portfolio</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">15. Core Product Categories</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.core_product_categories)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">16. Specialty Focus</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.specialty_focus)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">17. Price Segment</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.price_segment)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Brands Distributed (Module 3) - 3 fields */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2 text-yellow-600">Brands Distributed</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">18. Key Brands Represented</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.key_brands_represented)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">19. Exclusive Partnerships</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.exclusive_partnerships)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">20. Duration of Partnerships</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.duration_partnerships)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Channels (Module 3) - 6 fields */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2 text-purple-600">Distribution Channels</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">21. Retail Chains</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.retail_chains)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">22. Pharmacies</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.pharmacies)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">23. Spas / Salons / Clinics</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.spas_salons_clinics)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">24. E-commerce Platforms</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.ecommerce_platforms)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">25. Channel Strength</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.channel_strength)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">26. Distribution Type</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.distribution_type)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Regional & Operational Coverage (Module 3) - 4 fields */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2 text-pink-600">Regional & Operational Coverage</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">27. Emirates Served</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.emirates_served)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">28. Regional Extensions</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.regional_extensions)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">29. Warehouse / Logistics</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.warehouse_logistics)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">30. Delivery / Storage</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.delivery_storage)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CMI Insights (Module 3) - 2 fields */}
            {module.includes('Premium') && (
              <div className="space-y-4 lg:col-span-3">
                <h3 className="text-lg font-semibold text-black border-b pb-2 text-indigo-600">CMI Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">31. Competitive Benchmarking</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.competitive_benchmarking)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-black uppercase">32. Additional Comments</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.additional_comments)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Field Count Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-black text-center">
              {module.includes('Standard') && 'Showing 14 fields (Company Information: 7, Contact Details: 6, S.No.: 1)'}
              {module.includes('Advance') && 'Showing 18 fields (Company Information: 8, Contact Details: 6, Product Portfolio: 3, S.No.: 1)'}
              {module.includes('Premium') && 'Showing 33 fields (Company Info: 8, Contact: 6, Product: 3, Brands: 3, Channels: 6, Coverage: 4, Insights: 2, S.No.: 1)'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#168AAD] text-white rounded-md hover:bg-[#1A759F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function DistributorsIntelligence({ title, height = 600 }: DistributorsIntelligenceProps) {
  const { distributorIntelligenceData: manualDistributorData } = useDashboardStore()
  const [distributorsData, setDistributorsData] = useState<DistributorsIntelligenceData | null>(null)
  const [selectedModule, setSelectedModule] = useState<string>('Module 1 - Standard')
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount - check manual input first, then API
  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true
    
    async function loadData() {
      try {
        if (!isMounted || abortController.signal.aborted) return
        
        setIsLoading(true)
        setError(null) // Clear any previous errors
        
        // First, check if we have manual input data
        console.log('🔍 DistributorsIntelligence: Checking for manual data', {
          hasData: !!manualDistributorData,
          dataLength: manualDistributorData?.length,
          dataSample: manualDistributorData?.[0]
        })
        
        if (manualDistributorData && manualDistributorData.length > 0) {
          console.log('✅ Found manual distributor data, converting...')
          const convertedData = convertDistributorDataToIntelligenceFormat(manualDistributorData)
          console.log('📊 Converted data:', {
            modules: convertedData?.metadata?.modules,
            moduleDataCount: convertedData?.data?.['Module 1 - Standard']?.length
          })
          
          if (isMounted && !abortController.signal.aborted) {
            setDistributorsData(convertedData as DistributorsIntelligenceData)
            // Set default module to first available
            const modules = getAvailableModules(convertedData as DistributorsIntelligenceData)
            if (modules.length > 0) {
              setSelectedModule(modules[0])
            }
            setIsLoading(false)
            console.log('✅ Manual data loaded successfully')
          }
          return
        }
        
        console.log('⚠️ No manual data found, loading from API...')
        
        // Otherwise, load from API
        const data = await loadDistributorsIntelligenceData()
        
        // Only update state if component is still mounted and not aborted
        if (isMounted && !abortController.signal.aborted) {
          if (data) {
            setDistributorsData(data)
            // Set default module to first available
            const modules = getAvailableModules(data)
            if (modules.length > 0) {
              setSelectedModule(modules[0])
            }
          } else {
            // No error - just no data available (this is expected if file not uploaded)
            setDistributorsData(null)
          }
          setIsLoading(false)
        }
      } catch (err) {
        // Only set error for actual errors, not missing data
        if (isMounted && !abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'An error occurred while loading distributors data')
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [manualDistributorData]) // Reload when manual data changes

  // Get available modules
  const availableModules = useMemo(() => {
    return getAvailableModules(distributorsData)
  }, [distributorsData])

  // Get module info
  const moduleInfo = useMemo(() => {
    return getModuleInfo(distributorsData, selectedModule)
  }, [distributorsData, selectedModule])

  // Get distributors for selected module
  const distributors = useMemo(() => {
    if (!distributorsData) return []
    return getDistributorsForModule(distributorsData, selectedModule)
  }, [distributorsData, selectedModule])

  // Get table columns for the selected module
  const tableColumns = useMemo(() => {
    return getTableColumnsForModule(distributorsData, selectedModule)
  }, [distributorsData, selectedModule])

  // Get unique sections from columns
  const tableSections = useMemo(() => {
    return getTableSections(tableColumns)
  }, [tableColumns])

  // Get total count
  const totalCount = useMemo(() => {
    return getDistributorCountForModule(distributorsData, selectedModule)
  }, [distributorsData, selectedModule])

  // Handle distributor click
  const handleDistributorClick = useCallback((distributor: Distributor) => {
    setSelectedDistributor(distributor)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#168AAD] mx-auto"></div>
          <p className="mt-4 text-black">Loading distributors data...</p>
        </div>
      </div>
    )
  }

  if (error || !distributorsData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold mb-2">Distributors Data Not Available</p>
          <p className="text-sm text-gray-500">
            {error 
              ? 'Unable to load distributors data. Please upload a distributors intelligence file to view this section.'
              : 'Distributors intelligence data is not currently available. Upload a distributors CSV file to enable this feature.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-black">
          {title || 'Distributors Intelligence Database'}
        </h3>
        <p className="text-xs text-black mt-0.5">
          Verified directory and insight on skincare and beauty product distributors across the UAE
        </p>
      </div>

      {/* Module Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-1">
          {availableModules.map((module) => {
            const isActive = module === selectedModule
            const info = getModuleInfo(distributorsData, module)
            
            return (
              <button
                key={module}
                onClick={() => setSelectedModule(module)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors relative
                  ${isActive
                    ? 'border-[#168AAD] text-[#168AAD]'
                    : 'border-transparent text-black hover:text-black hover:border-gray-300'
                  }
                `}
              >
                {module}
                {info && (
                  <span className="ml-2 text-xs text-black">
                    ({info.total_fields} fields)
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Module Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-black">
          <span className="font-medium">{totalCount}</span> distributors in {selectedModule}
          {moduleInfo && (
            <span className="ml-2 text-xs text-black">
              • Sections: {moduleInfo.sections.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Distributors Table with Section Headers */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: height }}>
        <table className="min-w-full">
          {/* Main Header with Sections */}
          <thead className="sticky top-0 z-20">
            {/* Section Headers Row */}
            <tr className="bg-gray-50">
              <th className="border-r border-b border-gray-300 bg-purple-100" rowSpan={2}>
                <div className="px-2 py-2 text-xs font-semibold text-black">S.No.</div>
              </th>
              {tableSections.map((section) => {
                const sectionColumns = tableColumns.filter(col => col.section === section)
                return (
                  <th
                    key={section}
                    colSpan={sectionColumns.length}
                    className={`border-r border-b border-gray-300 text-center text-xs font-semibold uppercase tracking-wider py-2 ${
                      section === 'COMPANY INFORMATION' ? 'bg-orange-50' :
                      section === 'CONTACT DETAILS' ? 'bg-blue-50' :
                      section === 'PRODUCT PORTFOLIO' ? 'bg-green-50' :
                      section === 'BRANDS DISTRIBUTED' ? 'bg-yellow-50' :
                      section === 'DISTRIBUTION CHANNELS' ? 'bg-purple-50' :
                      section === 'REGIONAL & OPERATIONAL COVERAGE' ? 'bg-pink-50' :
                      section === 'CMI INSIGHTS' ? 'bg-indigo-50' :
                      'bg-gray-100'
                    }`}
                  >
                    {section}
                  </th>
                )
              })}
            </tr>
            
            {/* Column Headers Row */}
            <tr className="bg-gray-100">
              {tableColumns.slice(1).map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2 text-left text-[10px] font-medium text-black uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                >
                  <div className="whitespace-normal leading-tight">{column.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {distributors.map((distributor, index) => {
              const dist = distributor as any // Type assertion for dynamic field access
              
              return (
                <tr
                  key={`${selectedModule}-${distributor.id}-${index}`}
                  onClick={() => handleDistributorClick(distributor)}
                  className="hover:bg-[#52B69A]/10 cursor-pointer transition-colors"
                >
                  {/* S.No. */}
                  <td className="px-3 py-2 text-sm text-black border-r border-gray-200 bg-purple-50">
                    {dist.s_no || index + 1}
                  </td>
                  
                  {/* All other columns */}
                  {tableColumns.slice(1).map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-2 text-xs text-black border-r border-gray-200 last:border-r-0"
                    >
                      {column.key === 'company_name' ? (
                        <span className="font-medium text-black">
                          {formatDistributorField(dist[column.key])}
                        </span>
                      ) : column.key === 'email_address' && dist[column.key] && dist[column.key] !== 'xx' ? (
                        <a
                          href={`mailto:${dist[column.key]}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                        >
                          {formatDistributorField(dist[column.key])}
                        </a>
                      ) : column.key === 'phone_whatsapp' && dist[column.key] && dist[column.key] !== 'xx' ? (
                        <a
                          href={`tel:${dist[column.key]}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                        >
                          {formatDistributorField(dist[column.key])}
                        </a>
                      ) : column.key === 'website_url' && dist[column.key] && dist[column.key] !== 'xx' ? (
                        <a
                          href={dist[column.key]}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                        >
                          {formatDistributorField(dist[column.key])}
                        </a>
                      ) : (
                        formatDistributorField(dist[column.key])
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-3 text-center text-xs text-black">
        Click on any row to view full distributor details
      </div>

      {/* Distributor Detail Modal */}
      {selectedDistributor && (
        <DistributorDetailModal
          isOpen={!!selectedDistributor}
          onClose={() => setSelectedDistributor(null)}
          distributor={selectedDistributor}
          module={selectedModule}
        />
      )}
    </div>
  )
}

export default DistributorsIntelligence
