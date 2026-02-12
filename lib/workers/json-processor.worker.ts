/**
 * Worker thread for processing large JSON files
 * This runs in a separate thread to avoid blocking the main event loop
 */

import { parentPort, workerData } from 'worker_threads'

interface RawJsonData {
  [geography: string]: {
    [segmentType: string]: {
      [key: string]: any
    }
  }
}

interface YearData {
  [year: string]: number | string | boolean | null | undefined
}

interface ProcessingResult {
  success: boolean
  data?: any
  error?: string
  progress?: number
  type?: 'progress' | 'status' | 'result'
  message?: string
}

// Generator function for async path extraction
function* extractPathsGenerator(
  obj: any,
  currentPath: string[] = [],
  depth: number = 0
): Generator<{ path: string[]; data?: YearData }> {
  if (depth > 20 || !obj || typeof obj !== 'object') {
    return
  }

  const keys = Object.keys(obj)
  const hasYearData = keys.some(key => /^\d{4}$/.test(key) || key === 'CAGR')
  
  if (hasYearData) {
    const yearData: YearData = {}
    keys.forEach(key => {
      if (/^\d{4}$/.test(key) || key === 'CAGR' || key === '_aggregated' || key === '_level') {
        yearData[key] = obj[key]
      }
    })
    yield { path: currentPath, data: yearData }
    return
  }

  for (const key of keys) {
    yield* extractPathsGenerator(obj[key], [...currentPath, key], depth + 1)
  }
}

// Async function to process paths in chunks
async function processPathsAsync(
  generator: Generator<{ path: string[]; data?: YearData }>,
  chunkSize: number = 1000
): Promise<Array<{ path: string[]; data?: YearData }>> {
  const paths: Array<{ path: string[]; data?: YearData }> = []
  let count = 0
  
  for (const path of generator) {
    paths.push(path)
    count++
    
    // Yield control every chunkSize items
    if (count % chunkSize === 0) {
      await new Promise(resolve => setImmediate(resolve))
      parentPort?.postMessage({
        success: true,
        progress: count,
        type: 'progress'
      } as ProcessingResult)
    }
  }
  
  return paths
}

// Handle messages from main thread
if (parentPort) {
  parentPort.on('message', async (data: { valueData: RawJsonData }) => {
    try {
      parentPort?.postMessage({
        success: true,
        type: 'status',
        message: 'Processing started...'
      } as ProcessingResult)
      
      // This is a simplified version - full processing would go here
      // For now, we'll use the main processor but this worker can be extended
      
      parentPort?.postMessage({
        success: true,
        type: 'result',
        data: { processed: true }
      } as ProcessingResult)
    } catch (error) {
      parentPort?.postMessage({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      } as ProcessingResult)
    }
  })
}

