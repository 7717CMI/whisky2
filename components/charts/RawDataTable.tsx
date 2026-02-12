'use client'

import { useMemo } from 'react'

interface RawDataTableProps {
  title?: string
  data: Record<string, any>[]
  headers?: string[]
  height?: number
}

export function RawDataTable({ title, data, headers, height = 600 }: RawDataTableProps) {
  // Extract headers from first row if not provided
  const tableHeaders = useMemo(() => {
    if (headers && headers.length > 0) {
      return headers
    }
    if (data.length > 0) {
      return Object.keys(data[0])
    }
    return []
  }, [data, headers])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-2">No Data Available</p>
          <p className="text-sm text-gray-500">Upload an Excel file to view data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-black">{title}</h3>
          <p className="text-xs text-black mt-0.5">
            Showing {data.length} row{data.length !== 1 ? 's' : ''} of data
          </p>
        </div>
      )}

      <div className="overflow-auto border border-gray-300 rounded-lg bg-white" style={{ maxHeight: height }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-b border-gray-300"
                >
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {tableHeaders.map((header, colIndex) => {
                  const value = row[header]
                  const displayValue = value !== null && value !== undefined 
                    ? String(value).trim() 
                    : ''
                  
                  return (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm text-black border-b border-gray-200"
                    >
                      {displayValue || <span className="text-gray-400">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        Scroll to view all data
      </div>
    </div>
  )
}



