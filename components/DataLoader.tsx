'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Loader2, Upload, CheckCircle2, XCircle } from 'lucide-react'

/**
 * Component for loading and processing JSON files
 */
export function DataLoader() {
  const { setData, setLoading, setError } = useDashboardStore()
  const [valuePath, setValuePath] = useState('data/value.json')
  const [volumePath, setVolumePath] = useState('data/volume.json')
  const [segmentationPath, setSegmentationPath] = useState('data/segmentation_analysis.json')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleLoadData = async () => {
    try {
      setIsProcessing(true)
      setStatus('idle')
      setStatusMessage('')
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams({
        valuePath: valuePath || 'data/value.json',
      })
      
      if (volumePath) {
        params.append('volumePath', volumePath)
      }
      
      if (segmentationPath) {
        params.append('segmentationPath', segmentationPath)
      }

      const response = await fetch(`/api/process-data?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || `Failed to load data: ${response.statusText}`
        const debugInfo = errorData.debug ? `\nDebug: ${JSON.stringify(errorData.debug, null, 2)}` : ''
        const stackInfo = errorData.stack ? `\nStack: ${errorData.stack}` : ''
        throw new Error(`${errorMessage}${debugInfo}${stackInfo}`)
      }

      const data = await response.json()
      setData(data)
      setStatus('success')
      setStatusMessage('Data loaded successfully!')
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setStatusMessage('')
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setStatus('error')
      setStatusMessage(errorMessage)
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-black mb-3">Load Market Data</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Value JSON Path <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={valuePath}
            onChange={(e) => setValuePath(e.target.value)}
            placeholder="value.json"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Volume JSON Path (optional)
          </label>
          <input
            type="text"
            value={volumePath}
            onChange={(e) => setVolumePath(e.target.value)}
            placeholder="volume.json"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-black mb-1">
            Segmentation JSON Path (optional)
          </label>
          <input
            type="text"
            value={segmentationPath}
            onChange={(e) => setSegmentationPath(e.target.value)}
            placeholder="segmentation_analysis.json"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={handleLoadData}
          disabled={isProcessing || !valuePath}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Load Data
            </>
          )}
        </button>

        {status !== 'idle' && (
          <div
            className={`flex items-center gap-2 text-sm p-2 rounded ${
              status === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="text-xs text-black pt-2 border-t border-gray-200">
          <p className="mb-1"><strong>Note:</strong> Paths are relative to the project root (parent of frontend-clean folder).</p>
          <p>Example: If your JSON files are in the root directory, use: <code className="bg-gray-100 px-1 rounded">value.json</code></p>
        </div>
      </div>
    </div>
  )
}

