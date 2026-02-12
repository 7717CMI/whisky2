'use client'

import { BarChart3, Globe, Filter, TrendingUp } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-data' | 'no-selection' | 'error' | 'loading'
  message?: string
  description?: string
}

export function EmptyState({ type, message, description }: EmptyStateProps) {
  const configs = {
    'no-data': {
      icon: BarChart3,
      title: message || 'No Data Available',
      desc: description || 'Try adjusting your filters or selecting different options',
      color: 'text-black',
      bgColor: 'bg-gray-50',
    },
    'no-selection': {
      icon: Filter,
      title: message || 'No Selection Made',
      desc: description || 'Please select geographies and segments to view data',
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
    },
    'error': {
      icon: TrendingUp,
      title: message || 'Unable to Load Data',
      desc: description || 'There was an error loading the data. Please try again.',
      color: 'text-red-400',
      bgColor: 'bg-red-50',
    },
    'loading': {
      icon: Globe,
      title: message || 'Loading Data',
      desc: description || 'Please wait while we fetch your data',
      color: 'text-green-400',
      bgColor: 'bg-green-50',
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className={`flex flex-col items-center justify-center h-96 rounded-lg ${config.bgColor} border-2 border-dashed border-gray-200`}>
      <div className={`p-4 rounded-full ${config.bgColor} mb-4`}>
        <Icon className={`h-12 w-12 ${config.color}`} />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">{config.title}</h3>
      <p className="text-sm text-black text-center max-w-sm">{config.desc}</p>
    </div>
  )
}

export function ChartEmptyState({ viewMode }: { viewMode: string }) {
  if (viewMode === 'matrix') {
    return (
      <EmptyState
        type="no-selection"
        message="Select Multiple Items for Matrix View"
        description="Choose at least 2 geographies and 2 segments to see the matrix visualization"
      />
    )
  }

  return (
    <EmptyState
      type="no-data"
      message="No Data to Display"
      description="Select filters to view the comparative analysis"
    />
  )
}
