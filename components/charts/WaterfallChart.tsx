'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { CHART_THEME, getChartColor } from '@/lib/chart-theme'
import { filterData, prepareWaterfallData } from '@/lib/data-processor'
import { useDashboardStore } from '@/lib/store'

interface WaterfallChartProps {
  title?: string
  height?: number
}

interface WaterfallDataPoint {
  name: string
  value: number
  type: 'start' | 'positive' | 'negative' | 'end'
  cumulative?: number
  start?: number
  end?: number
}

export function WaterfallChart({ title, height = 400 }: WaterfallChartProps) {
  const { data, filters } = useDashboardStore()

  const chartData = useMemo(() => {
    if (!data) return { data: [], totalChange: 0 }

    const dataset = filters.dataType === 'value'
      ? data.data.value.geography_segment_matrix
      : data.data.volume.geography_segment_matrix

    const filtered = filterData(dataset, filters)
    const waterfallData = prepareWaterfallData(filtered, filters)

    // Calculate cumulative values for waterfall effect
    const processedData: WaterfallDataPoint[] = []
    let cumulative = 0
    let startValue = 0

    waterfallData.forEach((point, index) => {
      if (point.type === 'start') {
        startValue = point.value
        cumulative = point.value
        processedData.push({
          ...point,
          cumulative: point.value,
          start: 0,
          end: point.value
        })
      } else if (point.type === 'end') {
        // End bar: positioned at cumulative (which should equal endTotal)
        // The bar value should be the end total, starting from 0 for visual clarity
        processedData.push({
          ...point,
          cumulative: point.value,
          start: 0,
          end: point.value
        })
      } else if (point.type === 'positive') {
        const start = cumulative
        cumulative += point.value
        processedData.push({
          ...point,
          cumulative,
          start,
          end: cumulative
        })
      } else if (point.type === 'negative') {
        const start = cumulative
        cumulative -= point.value
        processedData.push({
          ...point,
          cumulative,
          start,
          end: cumulative
        })
      }
    })

    const totalChange = (processedData[processedData.length - 1]?.cumulative || 0) - 
                       (processedData[0]?.cumulative || 0)

    return { data: processedData, totalChange }
  }, [data, filters])

  if (!data || chartData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-black">No data to display</p>
          <p className="text-sm text-black mt-1">
            Select filters to view the waterfall chart
          </p>
        </div>
      </div>
    )
  }

  // Matrix view doesn't work well with waterfall
  if (filters.viewMode === 'matrix') {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-black text-lg font-medium">Matrix View Active</p>
          <p className="text-sm text-black mt-2">
            Waterfall charts work best with Segment Mode or Geography Mode
          </p>
        </div>
      </div>
    )
  }

  const yAxisLabel = filters.dataType === 'value'
    ? `Market Value (${data.metadata.currency} ${data.metadata.value_unit})`
    : `Market Volume (${data.metadata.volume_unit})`

  // Custom tooltip for waterfall
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && data) {
      const pointData = payload[0].payload as WaterfallDataPoint
      const unit = filters.dataType === 'value'
        ? `${data.metadata.currency} ${data.metadata.value_unit}`
        : data.metadata.volume_unit
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[280px]">
          <p className="font-semibold text-black mb-3 pb-2 border-b border-gray-200">
            {pointData.name}
          </p>
          
          {pointData.type === 'start' || pointData.type === 'end' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Type:</span>
                <span className="text-sm font-medium text-black">
                  {pointData.type === 'start' ? 'Starting Value' : 'Ending Value'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Total Value:</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-black">
                    {pointData.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                  <span className="text-xs text-black ml-1">{unit}</span>
                </div>
              </div>
              {pointData.type === 'end' && chartData.totalChange !== 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Net Change:</span>
                    <span className={`text-sm font-semibold ${
                      chartData.totalChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {chartData.totalChange > 0 ? '+' : ''}
                      {chartData.totalChange.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} {unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Type:</span>
                <span className={`text-sm font-medium ${
                  pointData.type === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {pointData.type === 'positive' ? 'Positive Contribution' : 'Negative Contribution'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Change Amount:</span>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${
                    pointData.type === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pointData.type === 'positive' ? '+' : '-'}
                    {pointData.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                  <span className="text-xs text-black ml-1">{unit}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black">From:</span>
                  <span className="text-black font-medium">
                    {pointData.start?.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black">To:</span>
                  <span className="text-black font-medium">
                    {pointData.end?.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {unit}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-black">
            {filters.viewMode === 'segment-mode' 
              ? 'Segment contribution to total market'
              : 'Geography contribution to segment total'
            }
          </div>
        </div>
      )
    }
    return null
  }

  // Get color based on type - using custom gradient theme
  const getColor = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return '#1E6091' // Deep Blue for totals
      case 'positive':
        return '#52B69A' // Teal for positive
      case 'negative':
        return '#D9ED92' // Yellow Green for negative
      default:
        return '#168AAD'
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData.data}
          margin={{ top: 20, right: 30, left: 80, bottom: 60 }}
        >
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            width={70}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, dx: -10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', color: '#000000' }}
            formatter={(value) => <span style={{ color: '#000000' }}>{value}</span>}
          />
          
          {/* Base bar (invisible, positions the visible bar) */}
          <Bar 
            dataKey="start" 
            stackId="waterfall" 
            fill="transparent"
            stroke="none"
          />
          
          {/* Value bar (visible contribution) */}
          <Bar 
            dataKey="value" 
            stackId="waterfall"
            fill="#8884d8"
          >
            {chartData.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E6091' }}></div>
            <span className="text-black">Start/End Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#52B69A' }}></div>
            <span className="text-black">Positive Contribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D9ED92' }}></div>
            <span className="text-black">Negative Contribution</span>
          </div>
        </div>
        
        <div className="text-center text-sm text-black">
          {filters.viewMode === 'segment-mode' 
            ? `Showing contribution breakdown by segments from ${filters.yearRange[0]} to ${filters.yearRange[1]}`
            : `Showing contribution breakdown by geographies from ${filters.yearRange[0]} to ${filters.yearRange[1]}`
          }
        </div>
        
        {chartData.totalChange !== 0 && (
          <div className="text-center">
            <span className={`text-sm font-semibold ${
              chartData.totalChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Net Change: {chartData.totalChange > 0 ? '+' : ''}
              {chartData.totalChange.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
