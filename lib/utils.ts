import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals: number = 2): string {
  return truncateToDecimals(value, decimals)
}

/**
 * Truncate a number to N decimal places WITHOUT rounding.
 * e.g. truncateToDecimals(5.796, 2) => "5.79" (not "5.80")
 */
export function truncateToDecimals(value: number, decimals: number = 2): string {
  const factor = Math.pow(10, decimals)
  const truncated = Math.trunc(value * factor) / factor
  return truncated.toFixed(decimals)
}

/**
 * Format a number for display: truncate to 2 decimals with locale separators.
 * Use this instead of toLocaleString with maximumFractionDigits.
 */
export function formatValueTruncated(value: number, decimals: number = 2): string {
  const factor = Math.pow(10, decimals)
  const truncated = Math.trunc(value * factor) / factor
  return truncated.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export function formatCurrency(value: number, currency: string = 'USD', unit: string = 'Mn'): string {
  return `${currency} ${truncateToDecimals(value, 2)} ${unit}`
}

// Get currency symbol based on currency preference
export function getCurrencySymbol(currency: 'USD' | 'INR' | 'GBP'): string {
  if (currency === 'INR') return '₹'
  if (currency === 'GBP') return '£'
  return '$'
}

// Format unit based on currency preference
export function formatUnit(unit: string, currency: 'USD' | 'INR' | 'GBP'): string {
  if (currency === 'INR') {
    return unit.replace('USD Million', '').replace('USD', '').replace('Million', '').trim()
  }
  if (currency === 'GBP') {
    return unit.replace('USD Million', 'GBP Million').replace('USD', 'GBP')
  }
  return unit
}

// Format number according to Indian number system (lakhs, crores)
export function formatIndianNumber(value: number, decimals: number = 2): string {
  const absValue = Math.abs(value)
  let formatted: string
  
  if (absValue >= 10000000) {
    // Crores (1 crore = 10 million)
    formatted = (value / 10000000).toFixed(decimals) + ' Cr'
  } else if (absValue >= 100000) {
    // Lakhs (1 lakh = 100,000)
    formatted = (value / 100000).toFixed(decimals) + ' L'
  } else {
    formatted = value.toFixed(decimals)
  }
  
  return formatted
}

// Format number with Indian comma system (first 3 digits, then groups of 2)
export function formatIndianNumberWithCommas(value: number, decimals: number = 2): string {
  const parts = value.toFixed(decimals).split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Indian numbering: first 3 digits, then groups of 2
  let formatted = integerPart
  if (integerPart.length > 3) {
    const lastThree = integerPart.slice(-3)
    const remaining = integerPart.slice(0, -3)
    const groups = remaining.match(/.{1,2}/g) || []
    formatted = groups.join(',') + ',' + lastThree
  }
  
  return decimalPart ? `${formatted}.${decimalPart}` : formatted
}

// Format currency value based on currency preference
export function formatCurrencyValue(value: number, currency: 'USD' | 'INR' | 'GBP', showUnit: boolean = true): string {
  if (currency === 'INR') {
    const symbol = '₹'
    // For INR, use Indian number system without "Million"
    if (value >= 10000000) {
      return `${symbol} ${formatIndianNumber(value)}${showUnit ? '' : ''}`
    } else if (value >= 100000) {
      return `${symbol} ${formatIndianNumber(value)}${showUnit ? '' : ''}`
    } else {
      return `${symbol} ${formatIndianNumberWithCommas(value)}`
    }
  } else {
    // USD/GBP: use standard formatting with Million
    const symbol = getCurrencySymbol(currency)
    if (value >= 1000000) {
      return `${symbol} ${(value / 1000000).toFixed(2)} Million`
    }
    return `${symbol} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function calculateGrowth(startValue: number, endValue: number): number {
  if (startValue === 0) return 0
  return ((endValue - startValue) / startValue) * 100
}

