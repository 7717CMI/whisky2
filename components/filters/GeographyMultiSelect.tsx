'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'

export function GeographyMultiSelect() {
  const { data, filters, updateFilters } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Build hierarchical geography structure
  const { globalItems, regions, countries, hasHierarchy, flatOptions } = useMemo(() => {
    if (!data || !data.dimensions?.geographies) {
      return { globalItems: [], regions: [], countries: {} as Record<string, string[]>, hasHierarchy: false, flatOptions: [] }
    }

    const geo = data.dimensions.geographies
    const globalItems = geo.global || []
    const regions = geo.regions || []
    const countries = geo.countries || {}
    const hasHierarchy = regions.length > 0
    const flatOptions = geo.all_geographies || []

    return { globalItems, regions, countries, hasHierarchy, flatOptions }
  }, [data])

  // Filter items based on search
  const searchResults = useMemo(() => {
    if (!searchTerm) return null
    const search = searchTerm.toLowerCase()
    return flatOptions.filter(geo => geo.toLowerCase().includes(search))
  }, [searchTerm, flatOptions])

  const toggleRegionExpand = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev)
      if (next.has(region)) {
        next.delete(region)
      } else {
        next.add(region)
      }
      return next
    })
  }

  const handleToggle = (geography: string) => {
    const current = filters.geographies
    const updated = current.includes(geography)
      ? current.filter(g => g !== geography)
      : [...current, geography]

    updateFilters({ geographies: updated })
  }

  const handleSelectAll = () => {
    if (!data) return
    updateFilters({
      geographies: data.dimensions.geographies.all_geographies
    })
  }

  const handleClearAll = () => {
    updateFilters({ geographies: [] })
  }

  if (!data) return null

  const selectedCount = filters.geographies.length

  const renderCheckbox = (geography: string, indent: number = 0) => (
    <label
      key={geography}
      className="flex items-center py-1.5 hover:bg-blue-50 cursor-pointer"
      style={{ paddingLeft: `${12 + indent * 20}px`, paddingRight: '12px' }}
    >
      <input
        type="checkbox"
        checked={filters.geographies.includes(geography)}
        onChange={() => handleToggle(geography)}
        className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm text-black flex-1">{geography}</span>
      {filters.geographies.includes(geography) && (
        <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
      )}
    </label>
  )

  const renderRegion = (region: string) => {
    const regionCountries = countries[region] || []
    const isExpanded = expandedRegions.has(region)
    const hasCountries = regionCountries.length > 0

    return (
      <div key={region}>
        <div className="flex items-center hover:bg-blue-50">
          {hasCountries && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleRegionExpand(region) }}
              className="p-1 ml-1 hover:bg-gray-200 rounded"
            >
              {isExpanded
                ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              }
            </button>
          )}
          <label
            className="flex items-center py-1.5 cursor-pointer flex-1"
            style={{ paddingLeft: hasCountries ? '2px' : '28px', paddingRight: '12px' }}
          >
            <input
              type="checkbox"
              checked={filters.geographies.includes(region)}
              onChange={() => handleToggle(region)}
              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-black font-medium flex-1">{region}</span>
            {filters.geographies.includes(region) && (
              <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            )}
          </label>
        </div>
        {isExpanded && regionCountries.map(country => renderCheckbox(country, 2))}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span className="text-sm text-black">
          {selectedCount === 0
            ? 'Select geographies...'
            : `${selectedCount} selected`}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search geographies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="px-3 py-2 bg-gray-50 border-b flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-xs bg-gray-100 text-black rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>

          {/* Geography List */}
          <div className="overflow-y-auto max-h-64">
            {searchResults !== null ? (
              // Search mode: flat list of matching results
              searchResults.length === 0 ? (
                <div className="px-3 py-4 text-sm text-black text-center">
                  No geographies found matching your search
                </div>
              ) : (
                searchResults.map(geo => renderCheckbox(geo, 0))
              )
            ) : hasHierarchy ? (
              // Hierarchical mode
              <>
                {/* Global items */}
                {globalItems.map(geo => renderCheckbox(geo, 0))}
                {/* Divider */}
                {globalItems.length > 0 && regions.length > 0 && (
                  <div className="border-t border-gray-200 my-1" />
                )}
                {/* Regions with expandable countries */}
                {regions.map(region => renderRegion(region))}
              </>
            ) : (
              // Flat mode (fallback)
              flatOptions.length === 0 ? (
                <div className="px-3 py-4 text-sm text-black text-center">
                  No geographies available
                </div>
              ) : (
                flatOptions.map(geo => renderCheckbox(geo, 0))
              )
            )}
          </div>
        </div>
      )}

      {/* Selected Count Badge */}
      {selectedCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-black">
            {selectedCount} {selectedCount === 1 ? 'geography' : 'geographies'} selected
          </span>
        </div>
      )}
    </div>
  )
}
