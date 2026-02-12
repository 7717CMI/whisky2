'use client'

import { useDashboardStore } from '@/lib/store'
import { useMemo } from 'react'

export function BusinessTypeFilter() {
  const { filters, updateFilters, data } = useDashboardStore()
  
  // Check if current segment type has B2B/B2C segmentation
  const hasB2BSegmentation = useMemo(() => {
    if (!data?.dimensions?.segments) return false
    
    const segmentDimension = data.dimensions.segments[filters.segmentType]
    if (!segmentDimension) return false
    
    return (
      (segmentDimension.b2b_hierarchy && Object.keys(segmentDimension.b2b_hierarchy).length > 0) ||
      (segmentDimension.b2c_hierarchy && Object.keys(segmentDimension.b2c_hierarchy).length > 0) ||
      (segmentDimension.b2b_items && segmentDimension.b2b_items.length > 0) ||
      (segmentDimension.b2c_items && segmentDimension.b2c_items.length > 0)
    )
  }, [data, filters.segmentType])
  
  // Don't render if no B2B/B2C segmentation exists
  if (!hasB2BSegmentation) {
    return null
  }

  const handleBusinessTypeChange = (businessType: 'B2B' | 'B2C') => {
    // When business type changes, clear segments to avoid confusion
    updateFilters({ 
      businessType,
      segments: [], // Clear segments when business type changes
      advancedSegments: [] // Also clear advanced segments
    } as any)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Business Type
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleBusinessTypeChange('B2B')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filters.businessType === 'B2B'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
        >
          B2B
        </button>
        <button
          onClick={() => handleBusinessTypeChange('B2C')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filters.businessType === 'B2C'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
        >
          B2C
        </button>
      </div>
      <p className="mt-1 text-xs text-black">
        {filters.businessType === 'B2B' && 'Show B2B segments'}
        {filters.businessType === 'B2C' && 'Show B2C segments'}
      </p>
    </div>
  )
}

