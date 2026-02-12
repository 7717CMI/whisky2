import { NextRequest, NextResponse } from 'next/server'
import { loadAndProcessJsonFiles } from '@/lib/json-processor'
import * as fs from 'fs/promises'
import * as path from 'path'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const valuePath = searchParams.get('valuePath') || 'data/value.json'
    const volumePath = searchParams.get('volumePath') || 'data/volume.json'
    const segmentationPath = searchParams.get('segmentationPath') || 'data/segmentation_analysis.json'
    
    const currentDir = process.cwd()
    const publicDataDir = path.join(currentDir, 'public', 'data')
    
    const resolvePath = (filePath: string): string => {
      if (path.isAbsolute(filePath)) return filePath
      const cleanPath = filePath.replace(/^data\//, '')
      return path.join(publicDataDir, cleanPath)
    }
    
    const resolvedValuePath = resolvePath(valuePath)
    const resolvedVolumePath = volumePath ? resolvePath(volumePath) : null
    const resolvedSegmentationPath = segmentationPath ? resolvePath(segmentationPath) : null
    
    let finalValuePath = resolvedValuePath
    let finalVolumePath = resolvedVolumePath
    let finalSegmentationPath = resolvedSegmentationPath
    
    try {
      await fs.access(finalValuePath)
    } catch {
      const errorMsg = 'Value file not found: ' + finalValuePath
      return NextResponse.json(
        { error: errorMsg },
        { status: 404 }
      )
    }
    
    if (finalVolumePath) {
      try {
        await fs.access(finalVolumePath)
      } catch {
        finalVolumePath = null
      }
    }
    
    if (finalSegmentationPath) {
      try {
        await fs.access(finalSegmentationPath)
      } catch {
        finalSegmentationPath = null
      }
    }
    
    const comparisonData = await loadAndProcessJsonFiles(
      finalValuePath,
      finalVolumePath,
      finalSegmentationPath
    )
    
    return NextResponse.json(comparisonData)
  } catch (error) {
    console.error('Error processing JSON files:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        error: 'Failed to process JSON files',
        details: errorMsg
      },
      { status: 500 }
    )
  }
}
