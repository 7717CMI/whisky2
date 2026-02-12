// Enterprise-level color palette from design system
export const CHART_COLORS = {
  primary: [
    '#52B69A', // Teal
    '#34A0A4', // Medium Teal
    '#168AAD', // Deep Teal
    '#1A759F', // Blue Teal
    '#1E6091', // Deep Blue
    '#184E77', // Navy Blue
    '#76C893', // Light Green
    '#99D98C', // Medium Green
    '#B5E48C', // Light Lime
    '#D9ED92', // Yellow Green
  ],
  
  // Exact colors from the provided palette
  palette: {
    yellowGreen: '#D9ED92',
    lightLime: '#B5E48C', 
    mediumGreen: '#99D98C',
    lightGreen: '#76C893',
    teal: '#52B69A',
    mediumTeal: '#34A0A4',
    deepTeal: '#168AAD',
    blueTeal: '#1A759F',
    deepBlue: '#1E6091',
    navyBlue: '#184E77',
  },
  
  heatmap: {
    low: '#D9ED92',    // Yellow Green
    midLow: '#B5E48C', // Light Lime
    mid: '#52B69A',    // Teal
    midHigh: '#1A759F',// Blue Teal
    high: '#184E77',   // Navy Blue
    zero: '#f9fafb',   // Gray 50
  },
  
  success: '#52B69A',
  warning: '#D9ED92',
  error: '#1E6091',
  info: '#168AAD',
  
  // Gradient combinations for headers
  gradients: {
    primary: 'from-[#52B69A] to-[#168AAD]', // Teal to Deep Teal
    secondary: 'from-[#168AAD] to-[#1A759F]', // Deep Teal to Blue Teal
    tertiary: 'from-[#1A759F] to-[#1E6091]', // Blue Teal to Deep Blue
  }
}

export const CHART_THEME = {
  grid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
  },
  
  axis: {
    style: {
      fontSize: 12,
      fill: '#000000',
    },
  },
  
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      fontWeight: 600,
      color: '#111827',
    },
  },
  
  legend: {
    wrapperStyle: {
      paddingTop: '20px',
    },
    iconType: 'rect' as const,
    iconSize: 12,
    style: {
      color: '#000000',
    },
  },
}

export const getChartColor = (index: number, subIndex?: number): string => {
  const baseColor = CHART_COLORS.primary[index % CHART_COLORS.primary.length]
  
  // If subIndex is provided, adjust the color brightness for stacking
  if (subIndex !== undefined && subIndex > 0) {
    // Parse the hex color
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Adjust brightness based on subIndex (make it lighter for higher subIndex)
    const factor = 1 + (subIndex * 0.15) // Each stack level gets 15% lighter
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor * 0.3))
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor * 0.3))
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor * 0.3))
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }
  
  return baseColor
}

export const getHeatmapColor = (value: number, min: number, max: number): string => {
  if (value === 0) return CHART_COLORS.heatmap.zero
  
  const range = max - min
  if (range === 0) return CHART_COLORS.heatmap.mid
  
  const percentage = ((value - min) / range) * 100
  
  if (percentage < 20) return CHART_COLORS.heatmap.low
  if (percentage < 40) return CHART_COLORS.heatmap.midLow
  if (percentage < 60) return CHART_COLORS.heatmap.mid
  if (percentage < 80) return CHART_COLORS.heatmap.midHigh
  return CHART_COLORS.heatmap.high
}
