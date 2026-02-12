'use client'

import { useDashboardStore } from '@/lib/store'
import { Layers } from 'lucide-react'

/**
 * Component for selecting aggregation level
 * Allows users to view data at different hierarchy levels (2-6)
 */
export function AggregationLevelSelector() {
  const { filters, updateFilters } = useDashboardStore()

  // Debug: Log when component renders
  console.log('🔧 AggregationLevelSelector: Component rendered, current aggregationLevel:', filters.aggregationLevel)

  const handleLevelChange = (level: number | null) => {
    console.log('🔧 AggregationLevelSelector: handleLevelChange called with level:', level)
    console.log('🔧 AggregationLevelSelector: Current filters before update:', filters)
    updateFilters({ aggregationLevel: level })
    // Verify it was set
    setTimeout(() => {
      const currentFilters = useDashboardStore.getState().filters
      console.log('🔧 AggregationLevelSelector: Current aggregationLevel after update:', currentFilters.aggregationLevel)
      console.log('🔧 AggregationLevelSelector: All filters after update:', currentFilters)
    }, 100)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-black flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Aggregation Level
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(e) => {
            console.log('🔧 AggregationLevelSelector: "All Levels" onClick fired', e)
            e.preventDefault()
            e.stopPropagation()
            try {
              console.log('🔧 AggregationLevelSelector: "All Levels" button clicked')
              handleLevelChange(null)
            } catch (error) {
              console.error('🔧 AggregationLevelSelector: Error in click handler:', error)
            }
          }}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
            filters.aggregationLevel === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
          style={{ pointerEvents: 'auto', zIndex: 10 }}
          title="Show all levels"
        >
          All Levels
        </button>
        {[2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            type="button"
            onMouseDown={(e) => {
              console.log('🔧 AggregationLevelSelector: MouseDown on level', level)
            }}
            onMouseUp={(e) => {
              console.log('🔧 AggregationLevelSelector: MouseUp on level', level)
            }}
            onClick={(e) => {
              console.log('🔧 AggregationLevelSelector: onClick fired for level', level, e)
              e.preventDefault()
              e.stopPropagation()
              try {
                console.log('🔧 AggregationLevelSelector: Button clicked for level', level)
                handleLevelChange(level)
              } catch (error) {
                console.error('🔧 AggregationLevelSelector: Error in click handler:', error)
              }
            }}
            onPointerDown={(e) => {
              console.log('🔧 AggregationLevelSelector: PointerDown on level', level)
            }}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filters.aggregationLevel === level
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
            style={{ pointerEvents: 'auto', zIndex: 10 }}
            title={`Show level ${level} aggregated data`}
          >
            Level {level}
          </button>
        ))}
      </div>
      {filters.aggregationLevel !== null && (
        <p className="text-xs text-black mt-1">
          Showing aggregated data at level {filters.aggregationLevel}
        </p>
      )}
      {/* Debug info */}
      <p className="text-xs text-black mt-1">
        Current: {filters.aggregationLevel === null ? 'All Levels' : `Level ${filters.aggregationLevel}`}
      </p>
    </div>
  )
}

