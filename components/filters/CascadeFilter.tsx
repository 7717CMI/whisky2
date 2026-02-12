'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, X } from 'lucide-react'

interface CascadeFilterProps {
  hierarchy: Record<string, string[]>
  selectedPath: string[]
  onSelectionChange: (path: string[]) => void
  maxLevels?: number
  placeholder?: string
}

interface LevelOption {
  value: string
  label: string
  hasChildren: boolean
}

export function CascadeFilter({
  hierarchy,
  selectedPath,
  onSelectionChange,
  maxLevels = 5,
  placeholder = 'Select...'
}: CascadeFilterProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(selectedPath || [])

  // Sync with external selectedPath changes
  useEffect(() => {
    setCurrentPath(selectedPath || [])
  }, [selectedPath])

  // Helper function to check if an item has real children (not just self-reference)
  const hasRealChildren = (item: string): boolean => {
    const children = hierarchy[item]
    if (!children || !Array.isArray(children) || children.length === 0) {
      return false
    }
    // Check if the only child is itself (self-referencing)
    if (children.length === 1 && children[0] === item) {
      return false
    }
    return true
  }

  // Get options for a specific level based on current path
  const getLevelOptions = (level: number): LevelOption[] => {
    if (Object.keys(hierarchy).length === 0) {
      return []
    }

    if (level === 0) {
      // Level 1: Get root items (items that are not children of any other item,
      // EXCEPT when they are children only of themselves - self-referencing leaf nodes)
      const allChildren = new Set<string>()
      const selfReferencingItems = new Set<string>()

      Object.entries(hierarchy).forEach(([parent, children]) => {
        if (Array.isArray(children)) {
          children.forEach(child => {
            // Check if this is a self-reference (parent contains only itself as child)
            if (child === parent && children.length === 1) {
              selfReferencingItems.add(child)
            } else {
              allChildren.add(child)
            }
          })
        }
      })

      // Root items are: keys that are NOT in allChildren,
      // OR keys that are self-referencing (only child of themselves)
      const roots = Object.keys(hierarchy).filter(key =>
        !allChildren.has(key) || selfReferencingItems.has(key)
      )

      // If no roots found, use all keys as roots (flat structure)
      const finalRoots = roots.length > 0 ? roots : Object.keys(hierarchy)

      // Deduplicate: Use Set to track unique segment names
      // We only want to show each unique segment name once
      const seen = new Set<string>()
      const uniqueOptions: LevelOption[] = []

      finalRoots.forEach(root => {
        // Only add if we haven't seen this segment name before
        if (!seen.has(root)) {
          seen.add(root)
          uniqueOptions.push({
            value: root,
            label: root,
            hasChildren: hasRealChildren(root)
          })
        }
      })

      return uniqueOptions
    } else {
      // Level 2+: Get children of the selected parent at previous level
      const parentKey = currentPath[level - 1]
      if (!parentKey) return []
      
      // Build the full path context for context-specific lookup
      const contextKey = currentPath.slice(0, level).join('::')
      
      // Try context-specific key first (for handling duplicate segment names in different contexts)
      let finalChildren: string[] = []
      if (hierarchy[contextKey] && Array.isArray(hierarchy[contextKey])) {
        finalChildren = hierarchy[contextKey]
      } else if (hierarchy[parentKey] && Array.isArray(hierarchy[parentKey])) {
        // Fallback to direct parent key lookup
        finalChildren = hierarchy[parentKey]
      }

      // Filter out self-references only
      finalChildren = finalChildren.filter((child: string) => {
        // Exclude the parent itself (self-reference)
        return child !== parentKey
      })

      // Deduplicate: Use Set to track unique segment names
      // We only want to show each unique segment name once per level
      const seen = new Set<string>()
      const uniqueOptions: LevelOption[] = []

      finalChildren.forEach((child: string) => {
        // Only add if we haven't seen this segment name before
        if (!seen.has(child)) {
          seen.add(child)
          uniqueOptions.push({
            value: child,
            label: child,
            hasChildren: hierarchy[child] && Array.isArray(hierarchy[child]) && hierarchy[child].length > 0
          })
        }
      })

      return uniqueOptions
    }
  }

  // Determine how many levels to show based on data
  const getMaxAvailableLevels = (): number => {
    if (Object.keys(hierarchy).length === 0) {
      return 0
    }
    
    let maxDepth = 1
    const visited = new Set<string>()
    
    const traverse = (key: string, depth: number, path: string[] = []) => {
      if (depth > maxLevels || visited.has(key)) return
      visited.add(key)
      
      if (depth > maxDepth) maxDepth = depth
      
      const children = Array.isArray(hierarchy[key]) ? hierarchy[key] : []
      const contextKey = path.length > 0 ? `${key}::${path.join('::')}` : key
      const contextChildren = Array.isArray(hierarchy[contextKey]) ? hierarchy[contextKey] : []
      const finalChildren = contextChildren.length > 0 ? contextChildren : children
      
      finalChildren.forEach((child: string) => {
        const newPath = [...path, key]
        traverse(child, depth + 1, newPath)
      })
    }
    
    // Start from all root nodes
    const allChildren = new Set<string>()
    Object.values(hierarchy).forEach(children => {
      if (Array.isArray(children)) {
        children.forEach((child: string) => allChildren.add(child))
      }
    })
    const roots = Object.keys(hierarchy).filter(key => !allChildren.has(key))
    
    // If no roots found, use all keys as roots
    const finalRoots = roots.length > 0 ? roots : Object.keys(hierarchy)
    
    finalRoots.forEach(root => traverse(root, 1))
    
    return Math.min(maxDepth, maxLevels)
  }

  const maxAvailableLevels = useMemo(() => getMaxAvailableLevels(), [hierarchy, maxLevels])

  // Handle selection at a specific level
  const handleLevelSelect = (level: number, value: string) => {
    const newPath = [...currentPath.slice(0, level), value]
    
    // Clear any selections beyond this level
    setCurrentPath(newPath)
    onSelectionChange(newPath)
  }

  // Clear selection at a specific level and all below it
  const handleClearLevel = (level: number) => {
    const newPath = currentPath.slice(0, level)
    setCurrentPath(newPath)
    onSelectionChange(newPath)
  }

  // Clear all selections
  const handleClearAll = () => {
    setCurrentPath([])
    onSelectionChange([])
  }

  // Check if a level should be shown
  const shouldShowLevel = (level: number): boolean => {
    if (level === 0) return true
    // Show level N if level N-1 has a selection AND that selection has real children
    if (currentPath.length < level || currentPath[level - 1] === '') {
      return false
    }
    // Check if the selected item at previous level has real children
    const selectedItem = currentPath[level - 1]
    return hasRealChildren(selectedItem)
  }

  // Get the selected value for display
  const getSelectedValue = (): string => {
    if (currentPath.length === 0) return ''
    return currentPath[currentPath.length - 1]
  }

  return (
    <div className="space-y-3">
      {/* Cascade Level Selectors */}
      <div className="space-y-2">
        {maxAvailableLevels > 0 && Array.from({ length: maxAvailableLevels }).map((_, levelIndex) => {
          const level = levelIndex
          const showLevel = shouldShowLevel(level)
          
          if (!showLevel) return null

          const options = getLevelOptions(level)
          const selectedValue = currentPath[level] || ''
          const hasSelection = selectedValue !== ''

          return (
            <div key={level} className="space-y-1">
              {hasSelection && (
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleClearLevel(level)
                    }}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                    title="Clear this and below"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              )}

              <select
                value={selectedValue}
                onChange={(e) => {
                  if (e.target.value) {
                    handleLevelSelect(level, e.target.value)
                  } else {
                    handleClearLevel(level)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={options.length === 0}
              >
                <option value="">
                  {options.length === 0
                    ? 'No options available'
                    : level === 0
                      ? placeholder
                      : `Select sub-segment ${level + 1}...`}
                </option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.hasChildren && ' →'}
                  </option>
                ))}
              </select>
              
              {/* Show arrow indicator if there's a selection and it has real children */}
              {hasSelection && hasRealChildren(selectedValue) && (
                <div className="flex justify-center py-1">
                  <ChevronRight className="h-4 w-4 text-black" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Path Display */}
      {currentPath.length > 0 && (
        <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-900">Selected Path:</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          </div>
          <div className="text-xs text-blue-800">
            {currentPath.map((segment, index) => (
              <span key={index}>
                <span className="font-medium">{segment}</span>
                {index < currentPath.length - 1 && (
                  <ChevronRight className="h-3 w-3 inline mx-1 text-blue-600" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info message if no hierarchy */}
      {Object.keys(hierarchy).length === 0 && (
        <div className="p-2 bg-yellow-50 rounded-md border border-yellow-200 text-xs text-yellow-800">
          No hierarchical data available for this segment type.
        </div>
      )}
    </div>
  )
}

