'use client'

import { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { CHART_THEME, getChartColor } from '@/lib/chart-theme'
import { filterData } from '@/lib/data-processor'
import { useDashboardStore } from '@/lib/store'
import type { DataRecord } from '@/lib/types'

interface BubbleChartProps {
  title?: string
  height?: number
}

interface BubbleDataPoint {
  name: string
  x: number // Market Size (current value)
  y: number // Market Share % (Y-axis - shows more variation)
  z: number // CAGR (bubble size - growth rate)
  geography: string
  segment: string
  segmentType: string
  currentValue: number
  cagr: number
  marketShare: number
  absoluteGrowth: number // Absolute change (end - start)
}

export function BubbleChart({ title, height = 500 }: BubbleChartProps) {
  const { data, filters } = useDashboardStore()

  const chartData = useMemo(() => {
    if (!data) return { bubbles: [], xLabel: '', yLabel: '' }

    const dataset = filters.dataType === 'value'
      ? data.data.value.geography_segment_matrix
      : data.data.volume.geography_segment_matrix

    const filtered = filterData(dataset, filters)

    if (filtered.length === 0) return { bubbles: [], xLabel: '', yLabel: '' }

    // Get the current year (end of range)
    const currentYear = filters.yearRange[1]
    
    // Group data by the dimension we're analyzing
    const groupKey = filters.viewMode === 'segment-mode' ? 'segment' : 'geography'
    const grouped = new Map<string, DataRecord[]>()
    
    filtered.forEach(record => {
      const key = record[groupKey]
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(record)
    })

    // Build bubble data points
    const bubbles: BubbleDataPoint[] = []
    
    // Calculate total market for share calculation
    // CRITICAL: Only use leaf records to prevent double-counting
    // Aggregated records already contain the sum of their children, so including both would count values twice
    const leafRecords = filtered.filter(record => record.is_aggregated === false)
    let totalMarketValue = 0
    leafRecords.forEach(record => {
      totalMarketValue += record.time_series[currentYear] || 0
    })
    
    // Calculate start year value for growth calculation
    const startYear = filters.yearRange[0]
    
    grouped.forEach((records, key) => {
      // Aggregate values for this group
      let totalValue = 0
      let totalStartValue = 0
      let totalCAGR = 0
      let count = 0
      let geography = ''
      let segment = ''
      let segmentType = ''

      records.forEach(record => {
        const startVal = record.time_series[startYear] || 0
        const endVal = record.time_series[currentYear] || 0
        totalValue += endVal
        totalStartValue += startVal
        totalCAGR += record.cagr || 0
        count++
        geography = record.geography
        segment = record.segment
        segmentType = record.segment_type
      })

      // Calculate market share as percentage of total market
      const marketShare = totalMarketValue > 0 ? (totalValue / totalMarketValue) * 100 : 0
      
      // Calculate absolute growth (end - start)
      const absoluteGrowth = totalValue - totalStartValue
      
      // Calculate CAGR from aggregated values (more accurate than averaging)
      let calculatedCAGR = 0
      if (totalStartValue > 0 && totalValue > 0) {
        const years = currentYear - startYear
        if (years > 0) {
          calculatedCAGR = (Math.pow(totalValue / totalStartValue, 1 / years) - 1) * 100
        }
      } else {
        // Fallback to average if we can't calculate
        calculatedCAGR = count > 0 ? totalCAGR / count : 0
      }

      // Only include points with valid data
      if (totalValue > 0 && !isNaN(marketShare) && !isNaN(calculatedCAGR)) {
        bubbles.push({
          name: key,
          x: totalValue, // Market Size (X-axis)
          y: marketShare, // Market Share % (Y-axis - shows more variation)
          z: Math.max(Math.abs(calculatedCAGR), 0.1), // CAGR (bubble size, minimum 0.1% for visibility)
          geography,
          segment,
          segmentType,
          currentValue: totalValue,
          cagr: calculatedCAGR,
          marketShare: marketShare,
          absoluteGrowth: absoluteGrowth
        })
      }
    })
    
    // Sort by market size for better visualization
    bubbles.sort((a, b) => b.x - a.x)

    const xLabel = filters.dataType === 'value'
      ? `Market Size (${data.metadata.currency} ${data.metadata.value_unit})`
      : `Market Size (${data.metadata.volume_unit})`
    
    const yLabel = 'Market Share (%)'

    return { bubbles, xLabel, yLabel }
  }, [data, filters])

  if (!data || chartData.bubbles.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-black">No data to display</p>
          <p className="text-sm text-black mt-1">
            Select filters to view the bubble chart
          </p>
        </div>
      </div>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const point = payload[0].payload as BubbleDataPoint
      
      // Safety check - ensure point has required properties
      if (!point || typeof point.x === 'undefined' || typeof point.y === 'undefined') {
        return null
      }
      
      const unit = filters.dataType === 'value'
        ? `${data.metadata.currency} ${data.metadata.value_unit}`
        : data.metadata.volume_unit

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[280px]">
          <p className="font-semibold text-black mb-3 pb-2 border-b border-gray-200">
            {point.name}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Type:</span>
              <span className="text-sm font-medium text-black">
                {filters.viewMode === 'segment-mode' ? 'Segment' : 'Geography'}
              </span>
            </div>
            {filters.viewMode === 'segment-mode' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Segment Type:</span>
                <span className="text-sm font-medium text-black">{point.segmentType}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Geography:</span>
              <span className="text-sm font-medium text-black">{point.geography}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Segment:</span>
              <span className="text-sm font-medium text-black">{point.segment}</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Market Size (X):</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-black">
                    {(point.x || 0).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                  <span className="text-xs text-black ml-1">{unit}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Market Share (Y):</span>
                <span className="text-sm font-semibold text-blue-600">
                  {(point.y || 0).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">CAGR (Size):</span>
                <span className={`text-sm font-semibold ${
                  (point.cagr || 0) > 0 ? 'text-green-600' : (point.cagr || 0) < 0 ? 'text-red-600' : 'text-black'
                }`}>
                  {(point.cagr || 0) > 0 ? '+' : ''}{((point.cagr || 0)).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Absolute Growth:</span>
                <span className={`text-sm font-semibold ${
                  (point.absoluteGrowth || 0) > 0 ? 'text-green-600' : (point.absoluteGrowth || 0) < 0 ? 'text-red-600' : 'text-black'
                }`}>
                  {(point.absoluteGrowth || 0) > 0 ? '+' : ''}
                  {((point.absoluteGrowth || 0)).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} {unit}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-black">
            Bubble size represents CAGR (growth rate). Larger bubbles = higher growth.
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate domain for better visualization
  const xValues = chartData.bubbles.map(b => b.x).filter(v => !isNaN(v) && isFinite(v))
  const yValues = chartData.bubbles.map(b => b.y).filter(v => !isNaN(v) && isFinite(v))
  
  if (xValues.length === 0 || yValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-black">Insufficient data for bubble chart</p>
          <p className="text-sm text-black mt-1">
            Please select filters with valid CAGR and market size data
          </p>
        </div>
      </div>
    )
  }
  
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)
  
  // Add padding to domains (10% on each side)
  const xPadding = (xMax - xMin) * 0.1 || xMax * 0.1
  const yPadding = (yMax - yMin) * 0.1 || Math.abs(yMax) * 0.1

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
      )}
      
      <div className="w-full" style={{ minWidth: 0, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{ top: 30, right: 40, left: 80, bottom: 80 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            opacity={0.5}
          />
          <XAxis 
            type="number"
            dataKey="x"
            name="Market Size"
            label={{ value: chartData.xLabel, position: 'insideBottom', offset: -5 }}
            domain={[Math.max(0, xMin - xPadding), xMax + xPadding]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
              return value.toFixed(0)
            }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            name="Market Share"
            label={{ value: chartData.yLabel, angle: -90, position: 'insideLeft' }}
            domain={[Math.max(0, yMin - yPadding), yMax + yPadding]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const num = typeof value === 'number' ? value : parseFloat(value)
              if (isNaN(num)) return ''
              return `${num.toFixed(1)}%`
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ strokeDasharray: '3 3', stroke: '#9ca3af', strokeWidth: 1 }} 
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', color: '#000000' }}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: '#000000' }}>{value}</span>}
          />
          
          {(() => {
            // Calculate size range for bubbles
            const maxZ = Math.max(...chartData.bubbles.map(b => b.z))
            const minZ = Math.min(...chartData.bubbles.map(b => b.z))
            const zRange = maxZ - minZ || 1
            
            // Scale z values to a reasonable range for visualization (20-200)
            const scaledBubbles = chartData.bubbles.map(b => ({
              ...b,
              z: zRange > 0 
                ? 20 + ((b.z - minZ) / zRange) * 180 
                : 50
            }))
            
            return scaledBubbles.map((entry, index) => {
              // Create custom shape for proper bubble sizing
              const CustomShape = (props: any) => {
                const { cx, cy } = props
                const size = entry.z
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={size / 2}
                    fill={getChartColor(index % 10)}
                    opacity={0.7}
                    stroke={getChartColor(index % 10)}
                    strokeWidth={2}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                )
              }
              
              // Preserve all properties in the data point for tooltip
              const dataPoint = {
                x: entry.x,
                y: entry.y,
                z: entry.z,
                name: entry.name,
                geography: entry.geography,
                segment: entry.segment,
                segmentType: entry.segmentType,
                currentValue: entry.currentValue,
                cagr: entry.cagr,
                marketShare: entry.marketShare,
                absoluteGrowth: entry.absoluteGrowth
              }
              
              return (
                <Scatter
                  key={`scatter-${index}`}
                  name={entry.name}
                  data={[dataPoint]}
                  fill={getChartColor(index % 10)}
                  shape={CustomShape}
                />
              )
            })
          })()}
        </ScatterChart>
      </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-black mb-3">Chart Dimensions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-xs">X</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Market Size</p>
                <p className="text-xs text-black">Horizontal position</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-xs">Y</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Market Share (%)</p>
                <p className="text-xs text-black">Vertical position</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-xs">S</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black">CAGR (%)</p>
                <p className="text-xs text-black">Bubble size</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-black">
            {filters.viewMode === 'segment-mode' 
              ? `Analyzing ${chartData.bubbles.length} segments: Market size vs market share correlation`
              : `Analyzing ${chartData.bubbles.length} geographies: Market size vs market share correlation`
            }
          </p>
          <p className="text-xs text-black mt-1">
            Hover over bubbles for detailed metrics. Larger bubbles = higher CAGR (growth rate).
          </p>
        </div>
      </div>
    </div>
  )
}
