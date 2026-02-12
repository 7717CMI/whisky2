'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Check, ChevronDown, X } from 'lucide-react'

interface SelectedSegment {
  type: string
  segment: string
  id: string
}

export function AdvancedSegmentMultiSelect() {
  const { data, filters, updateFilters } = useDashboardStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSegments, setSelectedSegments] = useState<SelectedSegment[]>([])
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

  // Get all segment types and their segments
  const allSegmentOptions = useMemo(() => {
    if (!data) return {}
    return data.dimensions.segments
  }, [data])

  const handleToggleSegment = (type: string, segment: string) => {
    const id = `${type}::${segment}`
    const existing = selectedSegments.find(s => s.id === id)
    
    let updated: SelectedSegment[]
    if (existing) {
      updated = selectedSegments.filter(s => s.id !== id)
    } else {
      updated = [...selectedSegments, { type, segment, id }]
    }
    
    setSelectedSegments(updated)
    
    // Update the filter with just segment names (for compatibility)
    updateFilters({ 
      segments: updated.map(s => s.segment),
      // Store the full selection data for advanced filtering
      advancedSegments: updated
    } as any)
  }

  const handleClearType = (type: string) => {
    const updated = selectedSegments.filter(s => s.type !== type)
    setSelectedSegments(updated)
    updateFilters({ 
      segments: updated.map(s => s.segment),
      advancedSegments: updated
    } as any)
  }

  const handleClearAll = () => {
    setSelectedSegments([])
    updateFilters({ segments: [], advancedSegments: [] } as any)
  }

  const isSegmentSelected = (type: string, segment: string) => {
    return selectedSegments.some(s => s.type === type && s.segment === segment)
  }

  const getSelectedCountByType = (type: string) => {
    return selectedSegments.filter(s => s.type === type).length
  }

  if (!data) return null

  const totalSelected = selectedSegments.length
  const segmentTypes = Object.keys(allSegmentOptions)

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-black">
        Advanced Segment Selection
      </label>
      
      {/* Main Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between text-black"
      >
        <span className="text-sm text-black">
          {totalSelected === 0 
            ? 'Select segments from any type...' 
            : `${totalSelected} segments selected`}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
          {/* Actions */}
          <div className="px-3 py-2 bg-gray-50 border-b flex justify-between items-center">
            <span className="text-xs text-black">
              Select from multiple segment types
            </span>
            <button
              onClick={handleClearAll}
              className="px-2 py-1 text-xs bg-gray-100 text-black rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>

          {/* Segment Types and Their Options */}
          <div className="overflow-y-auto max-h-80">
            {segmentTypes.map(segType => {
              const segments = allSegmentOptions[segType]
              const selectedCount = getSelectedCountByType(segType)
              
              return (
                <div key={segType} className="border-b last:border-b-0">
                  {/* Segment Type Header */}
                  <div className="px-3 py-2 bg-blue-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      {segType}
                      {selectedCount > 0 && (
                        <span className="ml-2 text-xs text-blue-600">
                          ({selectedCount} selected)
                        </span>
                      )}
                    </span>
                    {selectedCount > 0 && (
                      <button
                        onClick={() => handleClearType(segType)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {/* Segments under this type */}
                  <div className="max-h-40 overflow-y-auto">
                    {segments.items.map((segment: string) => (
                      <label
                        key={`${segType}::${segment}`}
                        className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSegmentSelected(segType, segment)}
                          onChange={() => handleToggleSegment(segType, segment)}
                          className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-black">{segment}</span>
                        {isSegmentSelected(segType, segment) && (
                          <Check className="ml-auto h-4 w-4 text-blue-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Segments Display */}
      {selectedSegments.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-black mb-1">Selected segments:</div>
          <div className="flex flex-wrap gap-2">
            {selectedSegments.map(({ type, segment, id }) => (
              <span
                key={id}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                <span className="font-medium">{type}:</span>
                <span className="ml-1">{segment}</span>
                <button
                  onClick={() => handleToggleSegment(type, segment)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
