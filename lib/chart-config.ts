// Chart configuration and color palettes - Custom gradient theme

export const CHART_COLORS = [
  '#52B69A', // Teal (top right)
  '#34A0A4', // Medium Teal
  '#168AAD', // Deep Teal
  '#1A759F', // Blue Teal
  '#1E6091', // Deep Blue
  '#184E77', // Navy Blue
  '#76C893', // Light Green
  '#99D98C', // Medium Green
  '#B5E48C', // Light Lime
  '#D9ED92', // Yellow Green
]

export const HEATMAP_SCALE = {
  low: '#D9ED92',    // Yellow Green (light)
  midLow: '#B5E48C', // Light Lime
  mid: '#52B69A',    // Teal
  midHigh: '#1A759F',// Blue Teal
  high: '#184E77',   // Navy Blue (dark)
}

export const CHART_THEME = {
  grid: {
    stroke: '#e5e7eb',
    strokeDasharray: '3 3',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '12px',
    },
    labelStyle: {
      color: '#374151',
      fontWeight: 600,
    },
  },
  legend: {
    wrapperStyle: {
      paddingTop: '20px',
    },
  },
}

export function getColorForIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function getHeatmapColor(value: number, min: number, max: number): string {
  const normalized = (value - min) / (max - min)
  
  if (normalized < 0.2) {
    return HEATMAP_SCALE.low
  } else if (normalized < 0.4) {
    return HEATMAP_SCALE.midLow
  } else if (normalized < 0.6) {
    return HEATMAP_SCALE.mid
  } else if (normalized < 0.8) {
    return HEATMAP_SCALE.midHigh
  } else {
    return HEATMAP_SCALE.high
  }
}

