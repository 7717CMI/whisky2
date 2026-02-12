'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Check, ChevronDown } from 'lucide-react'

export function SegmentMultiSelect() {
  const { data, filters, updateFilters } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)
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

  const segmentOptions = useMemo(() => {
    if (!data || !filters.segmentType) return []
    
    const segmentDimension = data.dimensions.segments[filters.segmentType]
    
    // Check if this segment type has B2B/B2C segmentation
    const hasB2BSegmentation = segmentDimension && (
      (segmentDimension.b2b_hierarchy && Object.keys(segmentDimension.b2b_hierarchy).length > 0) ||
      (segmentDimension.b2c_hierarchy && Object.keys(segmentDimension.b2c_hierarchy).length > 0) ||
      (segmentDimension.b2b_items && segmentDimension.b2b_items.length > 0) ||
      (segmentDimension.b2c_items && segmentDimension.b2c_items.length > 0)
    )
    
    // Use business-type specific hierarchy if available, otherwise use main hierarchy
    let hierarchy = segmentDimension?.hierarchy || {}
    if (hasB2BSegmentation) {
      if (filters.businessType === 'B2B' && segmentDimension?.b2b_hierarchy) {
        hierarchy = segmentDimension.b2b_hierarchy
      } else if (filters.businessType === 'B2C' && segmentDimension?.b2c_hierarchy) {
        hierarchy = segmentDimension.b2c_hierarchy
      }
    }
    
    // Filter items based on business type hierarchy
    // Use the business-type specific items array if available (from new API)
    let items: string[] = []
    if (hasB2BSegmentation && (filters.businessType === 'B2B' || filters.businessType === 'B2C')) {
      // Use the business-type specific items array from API if available
      if (filters.businessType === 'B2B' && segmentDimension?.b2b_items) {
        items = segmentDimension.b2b_items
      } else if (filters.businessType === 'B2C' && segmentDimension?.b2c_items) {
        items = segmentDimension.b2c_items
      } else {
        // Fallback: Extract all items from the business-type specific hierarchy ONLY
        // Use array instead of Set to preserve intentional duplicates from JSON
        const allHierarchyItems: string[] = []
        
        // Only process the selected business type hierarchy
        const businessTypeRoot = filters.businessType
        if (hierarchy[businessTypeRoot]) {
          // Add root children - preserve duplicates if present
          hierarchy[businessTypeRoot].forEach(item => allHierarchyItems.push(item))
          
          // Recursively add all descendants - preserve duplicates
          const addDescendants = (parent: string) => {
            if (hierarchy[parent]) {
              hierarchy[parent].forEach(child => {
                allHierarchyItems.push(child) // Allow duplicates
                addDescendants(child)
              })
            }
          }
          hierarchy[businessTypeRoot].forEach(rootChild => addDescendants(rootChild))
        }
        
        // Also add all keys from hierarchy that are not the business type root
        Object.keys(hierarchy).forEach(key => {
          if (key !== businessTypeRoot && key !== 'B2B' && key !== 'B2C') {
            allHierarchyItems.push(key) // Allow duplicates
          }
        })
        
        items = allHierarchyItems // Preserve duplicates from JSON
      }
    } else {
      items = segmentDimension?.items || []
    }
    
    // Build hierarchical structure with indentation levels
    const structuredSegments: Array<{name: string, level: number, isParent: boolean, uniqueKey: string}> = []
    const processed = new Set<string>()
    
    // Helper to add segment with its children
    // Track parent path to get context-specific children for duplicate segments
    const addSegmentWithChildren = (segment: string, level: number, parentPath: string[] = []) => {
      // Create unique identifier based on segment and parent path to allow duplicates
      const uniqueId = `${segment}::${parentPath.join('::')}`
      if (processed.has(uniqueId)) return
      processed.add(uniqueId)
      
      // Get children - check for context-specific key first, then fallback to base key
      const contextKey = parentPath.length > 0 ? `${segment}::${parentPath.join('::')}` : segment
      const children = hierarchy[contextKey] || hierarchy[segment] || []
      const isParent = children.length > 0
      
      structuredSegments.push({ name: segment, level, isParent, uniqueKey: uniqueId })
      
      // Add children if they exist
      if (children.length > 0) {
        const newParentPath = [...parentPath, segment]
        children.forEach((child: string) => {
          addSegmentWithChildren(child, level + 1, newParentPath)
        })
      }
    }
    
    // Find root segments (those that are parents but not children of any other)
    const allChildren = new Set(Object.values(hierarchy).flat())
    let rootSegments: string[] = []
    
    // For B2B/B2C hierarchies, skip the business type root and start from its children
    if (hasB2BSegmentation && (filters.businessType === 'B2B' || filters.businessType === 'B2C')) {
      const businessTypeRoot = filters.businessType
      if (hierarchy[businessTypeRoot] && hierarchy[businessTypeRoot].length > 0) {
        // Start from the children of B2B/B2C instead of B2B/B2C itself
        rootSegments = hierarchy[businessTypeRoot]
      } else {
        // Fallback: find segments that are parents but not children
        Object.keys(hierarchy).forEach(parent => {
          if (!allChildren.has(parent)) {
            rootSegments.push(parent)
          }
        })
      }
    } else {
      // First, find segments that are parents but not children
      Object.keys(hierarchy).forEach(parent => {
        if (!allChildren.has(parent)) {
          rootSegments.push(parent)
        }
      })
      
      // Then, find leaf segments that have no parent
      items.forEach((segment: string) => {
        if (!allChildren.has(segment) && !hierarchy[segment]) {
          rootSegments.push(segment)
        }
      })
    }
    
    // Process each root segment with its hierarchy
    rootSegments.forEach(segment => {
      addSegmentWithChildren(segment, 0, [])
    })
    
    // If no hierarchy, just return flat list
    if (structuredSegments.length === 0) {
      items.forEach((item: string, index: number) => {
        structuredSegments.push({ name: item, level: 0, isParent: false, uniqueKey: `${item}::${index}` })
      })
    }
    
    return structuredSegments
  }, [data, filters.segmentType, filters.businessType])

  const handleToggle = (segment: string) => {
    const current = filters.segments
    const updated = current.includes(segment)
      ? current.filter(s => s !== segment)
      : [...current, segment]
    
    updateFilters({ segments: updated })
  }

  const handleSelectAll = () => {
    updateFilters({ segments: segmentOptions.map(s => s.name) })
  }

  const handleClearAll = () => {
    updateFilters({ segments: [] })
  }

  const handleSegmentTypeChange = (type: string) => {
    updateFilters({ 
      segmentType: type,
      segments: [] // Clear segments when type changes
    })
  }

  if (!data) return null

  const selectedCount = filters.segments.length
  // Filter segment types based on data type - Volume only has "By Product Type"
  const allSegmentTypes = Object.keys(data.dimensions.segments)
  const segmentTypes = filters.dataType === 'volume'
    ? allSegmentTypes.filter(type => type === 'By Product Type')
    : allSegmentTypes

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Segment Type Selector */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Segment Type
        </label>
        <select
          value={filters.segmentType}
          onChange={(e) => handleSegmentTypeChange(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
        >
          {segmentTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Segment Multi-Select */}
      <div className="relative">
        <label className="block text-sm font-medium text-black mb-2">
          Segment Selection
        </label>
        
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        >
          <span className="text-sm text-black">
            {selectedCount === 0 
              ? 'Select segments...' 
              : `${selectedCount} selected`}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
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

            {/* Segment List */}
            <div className="overflow-y-auto max-h-64">
              {segmentOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-black text-center">
                  No segments available
                </div>
              ) : (
                segmentOptions.map(segment => (
                  <label
                    key={segment.uniqueKey}
                    className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    style={{ paddingLeft: `${1 + segment.level * 1.5}rem` }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.segments.includes(segment.name)}
                      onChange={() => handleToggle(segment.name)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${segment.isParent ? 'font-semibold text-black' : 'text-black'}`}>
                      {segment.level > 0 && <span className="text-black mr-1">└</span>}
                      {segment.name}
                    </span>
                    {filters.segments.includes(segment.name) && (
                      <Check className="ml-auto h-4 w-4 text-blue-600" />
                    )}
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected Count Badge */}
        {selectedCount > 0 && (
          <div className="mt-2">
            <span className="text-xs text-black">
              {selectedCount} {selectedCount === 1 ? 'segment' : 'segments'} selected
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

