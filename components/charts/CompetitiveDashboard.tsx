'use client'

import { useEffect, useState, useMemo } from 'react'
import { getCompanyComparison } from '@/lib/competitive-intelligence-data'

export function CompetitiveDashboard() {
  const [comparisonData, setComparisonData] = useState<{
    headers: string[];
    rows: { 
      label: string; 
      values: (string | number)[]; 
      section?: string;
      isProposition?: boolean;
    }[];
    sections?: string[];
  } | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true
    
    async function loadData() {
      if (!isMounted || abortController.signal.aborted) return
      
      const data = await getCompanyComparison()
      
      // Only update state if component is still mounted and not aborted
      if (isMounted && !abortController.signal.aborted) {
        setComparisonData(data)
      }
    }
    
    loadData()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [])

  // Group rows by section for parent/child header display
  const groupedRows = useMemo(() => {
    if (!comparisonData) return {}
    
    const groups: Record<string, typeof comparisonData.rows> = {}
    
    comparisonData.rows.forEach(row => {
      const section = row.section || 'OTHER'
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(row)
    })
    
    return groups
  }, [comparisonData])

  // Get section color
  const getSectionColor = (section: string) => {
    const colorMap: Record<string, string> = {
      'COMPANY INFORMATION': 'bg-orange-50',
      'PRODUCT & SERVICES': 'bg-green-50',
      'STRATEGY & DEVELOPMENT': 'bg-blue-50',
      'MARKET PRESENCE': 'bg-purple-50',
      'FINANCIAL METRICS': 'bg-yellow-50',
      'VALUE PROPOSITIONS': 'bg-indigo-50',
      'OTHER': 'bg-gray-100'
    }
    return colorMap[section] || 'bg-gray-100'
  }

  if (!comparisonData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-black">Loading competitive data...</p>
      </div>
    )
  }

  const sections = comparisonData.sections || Object.keys(groupedRows)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#168AAD] to-[#1A759F] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/90">
              Key Players Comparison - Competitive Intelligence
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Analysis Year</div>
            <div className="text-lg font-bold text-white">2024</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-20">
            {/* Section Headers Row (Parent Headers) */}
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 border-r border-b border-gray-300" rowSpan={2}>
                <div className="px-4 py-3 text-xs font-semibold text-black uppercase tracking-wider min-w-[200px]">
                  Attribute
                </div>
              </th>
              {sections.map((section) => {
                const sectionRows = groupedRows[section] || []
                // Each section spans across all companies (one column per company)
                return (
                  <th
                    key={section}
                    colSpan={comparisonData.headers.length}
                    className={`border-r border-b border-gray-300 text-center text-xs font-semibold uppercase tracking-wider py-3 ${getSectionColor(section)}`}
                  >
                    {section}
                  </th>
                )
              })}
            </tr>
            
            {/* Column Headers Row (Child Headers - Company Names) */}
            <tr className="bg-gray-100">
              {sections.map((section) => 
                comparisonData.headers.map((header, colIdx) => (
                  <th
                    key={`${section}-${colIdx}`}
                    className="px-4 py-3 text-center text-xs font-semibold text-black min-w-[150px] border-r border-gray-200 last:border-r-0"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[#168AAD] font-semibold">
                        {header.length > 20 
                          ? header.substring(0, 20) + '...' 
                          : header}
                      </span>
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisonData.rows.map((row, rowIdx) => (
              <tr key={row.label} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-black bg-inherit border-r border-gray-200">
                  {row.isProposition ? (
                    <span className="text-xs text-gray-600">{row.label}</span>
                  ) : (
                    row.label
                  )}
                </td>
                {sections.map((section) => 
                  comparisonData.headers.map((_, colIdx) => {
                    // Get the value for this company (colIdx) in this row
                    const value = row.values[colIdx]
                    return (
                      <td 
                        key={`${row.label}-${section}-${colIdx}`} 
                        className="px-4 py-3 text-sm text-black text-center border-r border-gray-200 last:border-r-0"
                      >
                        {/* Special formatting for certain rows */}
                        {row.label === "Strategies/Recent Developments" ? (
                          <div className="max-w-[200px] mx-auto">
                            <ul className="text-xs text-left space-y-1">
                              {String(value).split(', ').map((strategy, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-[#52B69A] mr-1">▸</span>
                                  <span>{strategy}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : row.label === "Product/Service Portfolio" ? (
                          <div className="text-xs font-medium text-[#168AAD]">
                            {value}
                          </div>
                        ) : row.label === "Year of Establishment" ? (
                          <span className="font-semibold">
                            {value}
                          </span>
                        ) : row.label.includes("Revenue") ? (
                          <span className="font-semibold text-green-600">
                            {value}
                          </span>
                        ) : row.label === "Regional Strength" ? (
                          <div className="text-xs">
                            <div className="inline-flex flex-wrap gap-1 justify-center">
                              {String(value).split(', ').map((region, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-1 bg-[#D9ED92] text-[#184E77] rounded text-xs font-medium"
                                >
                                  {region}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : row.isProposition && row.label.includes('Description') ? (
                          <div className="text-xs text-left max-w-[250px] mx-auto text-gray-700">
                            {value}
                          </div>
                        ) : row.isProposition && row.label.includes('Category') ? (
                          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                            {value}
                          </span>
                        ) : row.isProposition && row.label.includes('Title') ? (
                          <div className="text-xs font-semibold text-[#168AAD]">
                            {value}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with insights */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-black">
            <span className="font-semibold">Market Leader:</span> {comparisonData.headers[0]} 
            {comparisonData.rows.find(r => r.label.includes('Market Share'))?.values[0] && 
              ` (${comparisonData.rows.find(r => r.label.includes('Market Share'))?.values[0]}% market share)`}
          </div>
          <div className="text-sm text-black">
            <span className="font-semibold">Total Companies Analyzed:</span> {comparisonData.headers.length}
          </div>
        </div>
      </div>
    </div>
  )
}
