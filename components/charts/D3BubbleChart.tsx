'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { filterData } from '@/lib/data-processor'
import { useDashboardStore } from '@/lib/store'
import { getChartColor } from '@/lib/chart-theme'
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
  radius: number // Calculated radius for visualization
  geography: string
  segment: string
  segmentType: string
  currentValue: number
  cagr: number
  marketShare: number
  absoluteGrowth: number
  color: string
}

export function D3BubbleChart({ title, height = 500 }: BubbleChartProps) {
  const { data, filters } = useDashboardStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height })
  const [tooltipData, setTooltipData] = useState<BubbleDataPoint | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Calculate chart data
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
      const value = record.time_series[currentYear] || 0
      totalMarketValue += value
    })
    
    // Calculate start year value for growth calculation
    const startYear = filters.yearRange[0]
    
    grouped.forEach((records, key) => {
      // Aggregate values for this group
      let totalValue = 0
      let totalStartValue = 0
      let geography = ''
      let segment = ''
      let segmentType = ''

      records.forEach(record => {
        const startVal = record.time_series[startYear] || 0
        const endVal = record.time_series[currentYear] || 0
        totalValue += endVal
        totalStartValue += startVal
        geography = record.geography
        segment = record.segment
        segmentType = record.segment_type
      })

      // Calculate market share as percentage of total market
      const marketShare = totalMarketValue > 0 ? (totalValue / totalMarketValue) * 100 : 0
      
      // Calculate absolute growth (end - start)
      const absoluteGrowth = totalValue - totalStartValue
      
      // Calculate CAGR from aggregated values
      let calculatedCAGR = 0
      if (totalStartValue > 0 && totalValue > 0) {
        const years = currentYear - startYear
        if (years > 0) {
          calculatedCAGR = (Math.pow(totalValue / totalStartValue, 1 / years) - 1) * 100
        }
      }

      // Only include points with valid data
      if (totalValue > 0 && !isNaN(marketShare) && !isNaN(calculatedCAGR)) {
        const index = bubbles.length
        bubbles.push({
          name: key,
          x: totalValue,
          y: marketShare,
          z: Math.abs(calculatedCAGR),
          radius: 0, // Will be calculated later
          geography,
          segment,
          segmentType,
          currentValue: totalValue,
          cagr: calculatedCAGR,
          marketShare: marketShare,
          absoluteGrowth: absoluteGrowth,
          color: getChartColor(index % 10)
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

  // Update dimensions on container resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: Math.max(width, 400), height })
      }
    }

    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [height])

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || chartData.bubbles.length === 0) return

    const margin = { top: 20, right: 20, bottom: 60, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Calculate domains with proper padding for bubbles
    const xExtent = d3.extent(chartData.bubbles, d => d.x) as [number, number]
    const yExtent = d3.extent(chartData.bubbles, d => d.y) as [number, number]
    const zExtent = d3.extent(chartData.bubbles, d => d.z) as [number, number]

    // Calculate bubble sizes - scale to reasonable pixel sizes
    const maxBubbleRadius = Math.min(width, height) / 8 // Max bubble is 1/8 of chart size
    const minBubbleRadius = 10 // Minimum visible size

    const radiusScale = d3.scaleSqrt()
      .domain([0, zExtent[1]])
      .range([minBubbleRadius, maxBubbleRadius])

    // Update bubble radii
    chartData.bubbles.forEach(bubble => {
      bubble.radius = radiusScale(bubble.z)
    })

    // Calculate max bubble radius for padding
    const maxRadius = Math.max(...chartData.bubbles.map(b => b.radius))

    // Calculate minimal padding based on bubble positions and sizes
    // Maximize chart area while ensuring bubbles don't overflow
    const xPadding = maxRadius * 0.8 // Minimal padding for maximum space usage
    const yPadding = maxRadius * 0.8

    // X scale - starts from 0 with minimal padding for bubbles
    const xScale = d3.scaleLinear()
      .domain([0, xExtent[1] * 1.1]) // Add only 10% padding to max value
      .range([xPadding, width - xPadding]) // Minimal space for bubbles at edges

    // Y scale - starts from 0 with minimal padding for bubbles
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(yExtent[1] * 1.1, 100)]) // Add only 10% padding, ensure y goes to at least 100%
      .range([height - yPadding, yPadding]) // Minimal space for bubbles at edges

    // Add grid lines
    const xGrid = d3.axisBottom(xScale)
      .tickSize(-height + yPadding * 2)
      .tickFormat(() => '')

    const yGrid = d3.axisLeft(yScale)
      .tickSize(-width + xPadding * 2)
      .tickFormat(() => '')

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - yPadding})`)
      .call(xGrid)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${xPadding},0)`)
      .call(yGrid)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => {
        const value = d as number
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
        return value.toFixed(0)
      })

    g.append('g')
      .attr('transform', `translate(0,${height - yPadding})`)
      .call(xAxis)
      .style('font-size', '10px')
      .append('text')
      .attr('x', width / 2)
      .attr('y', 35)
      .attr('fill', '#000000')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .text(chartData.xLabel)

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${(d as number).toFixed(0)}%`)

    g.append('g')
      .attr('transform', `translate(${xPadding},0)`)
      .call(yAxis)
      .style('font-size', '10px')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', '#000000')
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .text(chartData.yLabel)

    // Create force simulation to prevent overlap and keep bubbles within bounds
    const simulation = d3.forceSimulation(chartData.bubbles as any)
      .force('x', d3.forceX<BubbleDataPoint>(d => xScale(d.x)).strength(1))
      .force('y', d3.forceY<BubbleDataPoint>(d => yScale(d.y)).strength(1))
      .force('collide', d3.forceCollide<BubbleDataPoint>(d => d.radius + 3)) // Add more spacing between bubbles
      .stop()

    // Run simulation with boundary constraints
    for (let i = 0; i < 120; ++i) {
      simulation.tick()
      
      // Ensure bubbles stay within bounds after simulation
      chartData.bubbles.forEach((d: any) => {
        // Constrain X position
        d.x = Math.max(xScale.range()[0] + d.radius, 
              Math.min(xScale.range()[1] - d.radius, d.x))
        // Constrain Y position  
        d.y = Math.max(yScale.range()[1] + d.radius,
              Math.min(yScale.range()[0] - d.radius, d.y))
      })
    }

    // Add bubbles
    const bubbles = g.append('g')
      .selectAll('circle')
      .data(chartData.bubbles)
      .enter()
      .append('circle')
      .attr('cx', d => (d as any).x || xScale(d.x))
      .attr('cy', d => (d as any).y || yScale(d.y))
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.7)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight bubble
        d3.select(this)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 3)

        // Show tooltip
        setTooltipData(d)
        const [mouseX, mouseY] = d3.pointer(event, svg.node())
        setTooltipPosition({ x: mouseX, y: mouseY })
      })
      .on('mouseout', function(event, d) {
        // Reset bubble
        d3.select(this)
          .attr('fill-opacity', 0.7)
          .attr('stroke-width', 2)

        // Hide tooltip
        setTooltipData(null)
      })

    // Add labels for larger bubbles
    const labels = g.append('g')
      .selectAll('text')
      .data(chartData.bubbles.filter(d => d.radius > 25))
      .enter()
      .append('text')
      .attr('x', d => (d as any).x || xScale(d.x))
      .attr('y', d => (d as any).y || yScale(d.y))
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => {
        // Truncate long names
        return d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name
      })

    // Add subtle legend note at the bottom instead of overlapping legend
    svg.append('text')
      .attr('x', dimensions.width / 2)
      .attr('y', dimensions.height - 5)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#000000')
      .style('font-style', 'italic')
      .text(`Bubble size represents growth rate (CAGR): ${zExtent[0].toFixed(1)}% to ${zExtent[1].toFixed(1)}%`)

  }, [chartData, dimensions])

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

  const unit = filters.dataType === 'value'
    ? `${data.metadata.currency} ${data.metadata.value_unit}`
    : data.metadata.volume_unit

  return (
    <div className="w-full min-w-0 overflow-hidden" ref={containerRef}>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        
        {/* Custom Tooltip */}
        {tooltipData && (
          <div
            className="absolute bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[280px] z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: tooltipPosition.x > dimensions.width / 2 ? 'translateX(-100%)' : 'none'
            }}
          >
            <p className="font-semibold text-black mb-3 pb-2 border-b border-gray-200">
              {tooltipData.name}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Type:</span>
                <span className="text-sm font-medium text-black">
                  {filters.viewMode === 'segment-mode' ? 'Segment' : 'Geography'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Market Size (X):</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-black">
                    {tooltipData.x.toLocaleString(undefined, { 
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
                  {tooltipData.y.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">CAGR (Size):</span>
                <span className={`text-sm font-semibold ${
                  tooltipData.cagr > 0 ? 'text-green-600' : tooltipData.cagr < 0 ? 'text-red-600' : 'text-black'
                }`}>
                  {tooltipData.cagr > 0 ? '+' : ''}{tooltipData.cagr.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Absolute Growth:</span>
                <span className={`text-sm font-semibold ${
                  tooltipData.absoluteGrowth > 0 ? 'text-green-600' : tooltipData.absoluteGrowth < 0 ? 'text-red-600' : 'text-black'
                }`}>
                  {tooltipData.absoluteGrowth > 0 ? '+' : ''}
                  {tooltipData.absoluteGrowth.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} {unit}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-black">
              Bubble size represents CAGR (growth rate)
            </div>
          </div>
        )}
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
