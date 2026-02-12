/**
 * Export Utilities
 * Functions for exporting charts and generating reports
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'
import { FilterState } from './types'

/**
 * Export a chart element as PNG
 */
export async function exportChartAsPNG(
  elementId: string,
  filename: string = 'chart'
): Promise<void> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }

    // Create canvas from element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
    })

    // Convert to blob and save
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.png`)
      }
    })
  } catch (error) {
    console.error('Error exporting chart as PNG:', error)
    throw error
  }
}

/**
 * Generate PDF report with all charts
 */
export async function generatePDFReport(
  filters: FilterState,
  marketName: string = 'Market Analysis'
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    
    // Title Page
    pdf.setFontSize(24)
    pdf.text(marketName, pageWidth / 2, 40, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.text('Comparative Analysis Report', pageWidth / 2, 55, { align: 'center' })
    
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 70, { align: 'center' })
    
    // Filter Summary
    pdf.setFontSize(12)
    pdf.text('Analysis Parameters', margin, 90)
    
    pdf.setFontSize(10)
    let yPos = 100
    
    pdf.text(`• View Mode: ${filters.viewMode}`, margin + 5, yPos)
    yPos += 7
    
    pdf.text(`• Data Type: ${filters.dataType}`, margin + 5, yPos)
    yPos += 7
    
    pdf.text(`• Year Range: ${filters.yearRange[0]} - ${filters.yearRange[1]}`, margin + 5, yPos)
    yPos += 7
    
    if (filters.geographies.length > 0) {
      const geoText = filters.geographies.length > 3 
        ? `${filters.geographies.slice(0, 3).join(', ')}... (${filters.geographies.length} total)`
        : filters.geographies.join(', ')
      pdf.text(`• Geographies: ${geoText}`, margin + 5, yPos)
      yPos += 7
    }
    
    if (filters.segments.length > 0) {
      const segText = filters.segments.length > 3
        ? `${filters.segments.slice(0, 3).join(', ')}... (${filters.segments.length} total)`
        : filters.segments.join(', ')
      pdf.text(`• Segments: ${segText}`, margin + 5, yPos)
      yPos += 7
    }
    
    // Capture charts if they exist
    const chartIds = ['grouped-bar-chart', 'line-chart', 'heatmap-chart', 'comparison-table']
    let currentPage = 1
    
    for (const chartId of chartIds) {
      const element = document.getElementById(chartId)
      if (element) {
        // Add new page for each chart
        if (currentPage > 1) {
          pdf.addPage()
        }
        currentPage++
        
        try {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
          })
          
          // Calculate dimensions to fit on page
          const imgWidth = contentWidth
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          // Add chart title
          pdf.setFontSize(14)
          const chartTitle = getChartTitle(chartId)
          pdf.text(chartTitle, pageWidth / 2, margin, { align: 'center' })
          
          // Add chart image
          const imgData = canvas.toDataURL('image/png')
          pdf.addImage(imgData, 'PNG', margin, margin + 10, imgWidth, Math.min(imgHeight, pageHeight - 60))
          
        } catch (error) {
          console.error(`Error capturing ${chartId}:`, error)
        }
      }
    }
    
    // Insights page
    const insightsElement = document.getElementById('insights-panel')
    if (insightsElement) {
      pdf.addPage()
      
      pdf.setFontSize(14)
      pdf.text('Key Insights', pageWidth / 2, margin, { align: 'center' })
      
      // Extract insights text
      const insightElements = insightsElement.querySelectorAll('[data-insight]')
      let insightY = margin + 15
      
      insightElements.forEach((insight, index) => {
        if (insightY > pageHeight - 30) {
          pdf.addPage()
          insightY = margin
        }
        
        pdf.setFontSize(10)
        const title = insight.querySelector('[data-insight-title]')?.textContent || ''
        const description = insight.querySelector('[data-insight-description]')?.textContent || ''
        
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${title}`, margin, insightY)
        
        pdf.setFont('helvetica', 'normal')
        const lines = pdf.splitTextToSize(description, contentWidth - 10)
        pdf.text(lines, margin + 5, insightY + 5)
        
        insightY += 5 + (lines.length * 5) + 5
      })
    }
    
    // Save PDF
    pdf.save(`${marketName.replace(/\s+/g, '-')}-Report-${new Date().toISOString().split('T')[0]}.pdf`)
    
  } catch (error) {
    console.error('Error generating PDF report:', error)
    throw error
  }
}

/**
 * Get chart title based on element ID
 */
function getChartTitle(chartId: string): string {
  const titles: Record<string, string> = {
    'grouped-bar-chart': 'Comparative Bar Chart Analysis',
    'line-chart': 'Trend Analysis Over Time',
    'heatmap-chart': 'Matrix Heatmap Comparison',
    'comparison-table': 'Detailed Data Table',
  }
  return titles[chartId] || 'Chart'
}

/**
 * Export current view as image
 */
export async function exportCurrentView(): Promise<void> {
  // Find the active chart
  const activeTab = document.querySelector('[data-active-tab]')?.getAttribute('data-active-tab')
  
  const chartMap: Record<string, string> = {
    'bar': 'grouped-bar-chart',
    'line': 'line-chart',
    'heatmap': 'heatmap-chart',
    'table': 'comparison-table',
  }
  
  const chartId = activeTab ? chartMap[activeTab] : null
  
  if (chartId) {
    await exportChartAsPNG(chartId, `${activeTab}-chart`)
  } else {
    throw new Error('No active chart found')
  }
}

/**
 * Quick export function for any element
 */
export function quickExport(element: HTMLElement, filename: string = 'export'): void {
  html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    logging: false,
  }).then(canvas => {
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}-${Date.now()}.png`)
      }
    })
  })
}
