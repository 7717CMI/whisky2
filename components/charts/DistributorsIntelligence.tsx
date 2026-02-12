'use client'

import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
  loadDistributorsIntelligenceData,
  getDistributorsForModule,
  getDistributorCountForModule,
  getAvailableModules,
  getModuleInfo,
  getModuleSections,
  formatDistributorField,
  getTableColumnsForModule,
  type DistributorsIntelligenceData,
  type Distributor,
  type PremiumDistributor,
  type TableColumn
} from '@/lib/distributors-intelligence-data'
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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Company Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-black uppercase">Company Name</label>
                  <p className="text-sm text-black mt-1">{formatDistributorField(dist.company_name)}</p>
                </div>
                
                {dist.year_established && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Year Established</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.year_established)}</p>
                  </div>
                )}
                
                {dist.headquarters_emirate && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Headquarters / Emirate</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.headquarters_emirate)}</p>
                  </div>
                )}
                
                {dist.cities_regions_covered && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Cities / Regions Covered</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.cities_regions_covered)}</p>
                  </div>
                )}
                
                {dist.ownership_type && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Ownership Type</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.ownership_type)}</p>
                  </div>
                )}
                
                {dist.business_type && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Business Type</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.business_type)}</p>
                  </div>
                )}
                
                {dist.no_of_employees && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">No. of Employees</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.no_of_employees)}</p>
                  </div>
                )}
                
                {dist.turnover_scale && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Turnover / Scale</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.turnover_scale)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black border-b pb-2">Contact Details</h3>
              
              <div className="space-y-3">
                {dist.key_contact_person && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Key Contact Person</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.key_contact_person)}</p>
                  </div>
                )}
                
                {dist.designation_role && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Designation / Role</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.designation_role)}</p>
                  </div>
                )}
                
                {dist.email_address && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Email Address</label>
                    <p className="text-sm text-black mt-1">
                      {dist.email_address !== 'xx' ? (
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
                )}
                
                {dist.phone_whatsapp && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Phone / WhatsApp</label>
                    <p className="text-sm text-black mt-1">
                      {dist.phone_whatsapp !== 'xx' ? (
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
                )}
                
                {dist.linkedin_profile && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">LinkedIn Profile</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.linkedin_profile)}</p>
                  </div>
                )}
                
                {dist.website_url && (
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Website URL</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.website_url)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Portfolio (Module 2 & 3) */}
            {(module.includes('Advance') || module.includes('Premium')) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2">Product Portfolio</h3>
                
                <div className="space-y-3">
                  {dist.core_product_categories && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Core Product Categories</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.core_product_categories)}</p>
                    </div>
                  )}
                  
                  {dist.specialty_focus && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Specialty Focus</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.specialty_focus)}</p>
                    </div>
                  )}
                  
                  {dist.price_segment && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Price Segment</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.price_segment)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brands Distributed (Module 3) */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2">Brands Distributed</h3>
                
                <div className="space-y-3">
                  {dist.key_brands_represented && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Key Brands Represented</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.key_brands_represented)}</p>
                    </div>
                  )}
                  
                  {dist.exclusive_partnerships && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Partnership Type</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.exclusive_partnerships)}</p>
                    </div>
                  )}
                  
                  {dist.duration_partnerships && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Partnership Duration</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.duration_partnerships)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distribution Channels (Module 3) */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2">Distribution Channels</h3>
                
                <div className="space-y-3">
                  {dist.retail_chains && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Retail Chains</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.retail_chains)}</p>
                    </div>
                  )}
                  
                  {dist.pharmacies && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Pharmacies</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.pharmacies)}</p>
                    </div>
                  )}
                  
                  {dist.spas_salons_clinics && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Spas / Salons / Clinics</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.spas_salons_clinics)}</p>
                    </div>
                  )}
                  
                  {dist.ecommerce_platforms && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">E-commerce Platforms</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.ecommerce_platforms)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Regional & Operational Coverage (Module 3) */}
            {module.includes('Premium') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b pb-2">Regional & Operational Coverage</h3>
                
                <div className="space-y-3">
                  {dist.emirates_served && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Emirates Served</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.emirates_served)}</p>
                    </div>
                  )}
                  
                  {dist.regional_extensions && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Regional Extensions</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.regional_extensions)}</p>
                    </div>
                  )}
                  
                  {dist.warehouse_logistics && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Warehouse / Logistics</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.warehouse_logistics)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CMI Insights (Module 3) */}
            {module.includes('Premium') && dist.competitive_benchmarking && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-black border-b pb-2">CMI Insights</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-black uppercase">Competitive Benchmarking</label>
                    <p className="text-sm text-black mt-1">{formatDistributorField(dist.competitive_benchmarking)}</p>
                  </div>
                  
                  {dist.additional_comments && (
                    <div>
                      <label className="text-xs font-medium text-black uppercase">Additional Comments</label>
                      <p className="text-sm text-black mt-1">{formatDistributorField(dist.additional_comments)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
  const [distributorsData, setDistributorsData] = useState<DistributorsIntelligenceData | null>(null)
  const [selectedModule, setSelectedModule] = useState<string>('Module 1 - Standard')
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true
    
    async function loadData() {
      try {
        if (!isMounted || abortController.signal.aborted) return
        
        setIsLoading(true)
        setError(null) // Clear any previous errors
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
  }, [])

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

  // Get visible columns for the table
  const visibleColumns = useMemo(() => {
    return getTableColumnsForModule(distributorsData, selectedModule).map(col => col.key)
  }, [distributorsData, selectedModule])
  
  // Get table columns with labels
  const tableColumns = useMemo(() => {
    return getTableColumnsForModule(distributorsData, selectedModule)
  }, [distributorsData, selectedModule])
  
  // Helper to get column label
  const getColumnLabel = (columnKey: string): string => {
    const column = tableColumns.find(col => col.key === columnKey)
    return column?.label || columnKey
  }

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

      {/* Distributors Table */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: height }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {visibleColumns.map((column) => {
                const isWideColumn = ['core_product_categories', 'key_brands_represented', 
                                     'retail_chains', 'competitive_benchmarking'].includes(column)
                const headerClass = column === 's_no'
                  ? "px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-200 w-16"
                  : isWideColumn
                  ? "px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-200 min-w-[150px]"
                  : "px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                
                return (
                  <th key={column} className={headerClass}>
                    {getColumnLabel(column)}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {distributors.map((distributor, index) => {
              const dist = distributor as any // Type assertion for dynamic field access
              
              return (
                <tr
                  key={`${selectedModule}-${distributor.id}-${index}`}
                  onClick={() => handleDistributorClick(distributor)}
                  className="hover:bg-[#52B69A]/10 cursor-pointer transition-colors"
                >
                  {visibleColumns.map((column) => {
                    // Determine column-specific styling
                    const isWideColumn = ['core_product_categories', 'key_brands_represented', 
                                         'retail_chains', 'competitive_benchmarking'].includes(column)
                    const cellClass = column === 's_no' 
                      ? "px-3 py-3 text-sm text-black w-16"
                      : isWideColumn
                      ? "px-4 py-3 text-sm text-black"
                      : "px-4 py-3 whitespace-nowrap text-sm text-black"
                    
                    return (
                      <td key={column} className={cellClass}>
                        {column === 's_no' ? (
                          <span className="text-black">{dist.s_no || index + 1}</span>
                        ) : column === 'company_name' ? (
                          <span className="font-medium text-black">
                            {formatDistributorField(dist[column])}
                          </span>
                        ) : column === 'email_address' && dist[column] && dist[column] !== 'xx' ? (
                          <a
                            href={`mailto:${dist[column]}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#168AAD] hover:text-[#1A759F] hover:underline"
                          >
                            {formatDistributorField(dist[column])}
                          </a>
                        ) : (
                          formatDistributorField(dist[column])
                        )}
                      </td>
                    )
                  })}
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