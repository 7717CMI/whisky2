'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'

export function DashboardBuilderDownload() {
  const { fromDashboardBuilder, dashboardBuilderFiles, data } = useDashboardStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle')

  // Show download button if:
  // 1. Data exists (dashboard has been previewed)
  // 2. Files are available from dashboard builder OR data exists (user can still download)
  const shouldShow = data && (fromDashboardBuilder || dashboardBuilderFiles?.valueFile)

  if (!shouldShow) {
    return null
  }

  const handleDownload = async () => {
    // Use files from store if available
    const files = dashboardBuilderFiles || { valueFile: null, volumeFile: null, projectName: 'market-dashboard' }
    
    if (!files.valueFile) {
      // If no file in store, we can't generate the package
      // This shouldn't happen if data exists, but handle gracefully
      alert('Unable to generate deployment package: Original files not found. Please go back to Dashboard Builder and upload files again.')
      return
    }

    setIsGenerating(true)
    setStatus('generating')

    try {
      const formData = new FormData()
      formData.append('valueFile', files.valueFile)
      if (files.volumeFile) {
        formData.append('volumeFile', files.volumeFile)
      }
      formData.append('projectName', files.projectName || 'market-dashboard')

      const response = await fetch('/api/generate-dashboard', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to generate dashboard')
      }

      // Get the zip file as blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Auto-download the file
      const a = document.createElement('a')
      a.href = url
      a.download = `${files.projectName || 'market-dashboard'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('Error generating dashboard:', error)
      alert(error instanceof Error ? error.message : 'An error occurred while generating the dashboard')
      setStatus('idle')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-black mb-1">Ready to Deploy?</h3>
            <p className="text-xs text-gray-600">
              Generate and download your deployment package
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Package
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}




