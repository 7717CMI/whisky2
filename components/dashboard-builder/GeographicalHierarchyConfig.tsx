'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronRight, ChevronDown, Eye, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import type { GeographyHierarchyConfig } from '@/lib/types'

interface GeographicalHierarchyConfigProps {
  regions: string[]
  onConfigChange: (config: GeographyHierarchyConfig) => void
  initialConfig?: GeographyHierarchyConfig
}

interface HierarchyNode {
  name: string
  level: number
  children: HierarchyNode[]
}

export function GeographicalHierarchyConfig({
  regions,
  onConfigChange,
  initialConfig = {}
}: GeographicalHierarchyConfigProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [hierarchy, setHierarchy] = useState<GeographyHierarchyConfig>(initialConfig)
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)

  // Get available regions for current level
  const getAvailableRegions = (level: number): string[] => {
    if (level === 1) {
      // Level 1: All regions that haven't been assigned as children
      const assignedAsChildren = new Set<string>()
      Object.values(hierarchy).forEach(levelConfig => {
        Object.values(levelConfig).forEach((children: unknown) => {
          if (Array.isArray(children)) {
            children.forEach((child: string) => assignedAsChildren.add(child))
          }
        })
      })
      return regions.filter(region => !assignedAsChildren.has(region))
    } else {
      // Higher levels: Parent regions from previous level
      const prevLevel = level - 1
      if (hierarchy[prevLevel]) {
        return Object.keys(hierarchy[prevLevel])
      }
      return []
    }
  }

  // Get regions that can be children of selected parents
  const getAvailableChildren = (level: number, parentName: string): string[] => {
    if (level === 1) {
      // For level 1, children are unassigned regions
      const assignedAsChildren = new Set<string>()
      Object.values(hierarchy).forEach(levelConfig => {
        Object.values(levelConfig).forEach((children: unknown) => {
          if (Array.isArray(children)) {
            children.forEach((child: string) => assignedAsChildren.add(child))
          }
        })
      })
      const currentChildren = hierarchy[level]?.[parentName] || []
      return regions.filter(region => 
        !assignedAsChildren.has(region) && 
        !currentChildren.includes(region) &&
        region !== parentName
      )
    } else {
      // For higher levels, children are parent regions from previous level
      const prevLevel = level - 1
      if (hierarchy[prevLevel]) {
        const prevLevelParents = Object.keys(hierarchy[prevLevel])
        const currentChildren = hierarchy[level]?.[parentName] || []
        return prevLevelParents.filter(parent => 
          !currentChildren.includes(parent) && 
          parent !== parentName
        )
      }
      return []
    }
  }

  const availableRegions = getAvailableRegions(currentLevel)
  const maxLevel = Object.keys(hierarchy).length > 0 
    ? Math.max(...Object.keys(hierarchy).map(Number)) 
    : 0

  // Handle region selection for current level
  const toggleRegionSelection = (region: string) => {
    const newSelected = new Set(selectedRegions)
    if (newSelected.has(region)) {
      newSelected.delete(region)
    } else {
      newSelected.add(region)
    }
    setSelectedRegions(newSelected)
  }

  // Confirm selection for current level
  const confirmLevelSelection = () => {
    if (selectedRegions.size === 0) {
      alert('Please select at least one region for this level')
      return
    }

    const newHierarchy = { ...hierarchy }
    if (!newHierarchy[currentLevel]) {
      newHierarchy[currentLevel] = {}
    }

    // Add selected regions as parent regions at this level
    selectedRegions.forEach(region => {
      if (!newHierarchy[currentLevel][region]) {
        newHierarchy[currentLevel][region] = []
      }
    })

    setHierarchy(newHierarchy)
    onConfigChange(newHierarchy)
    setSelectedRegions(new Set())
    
    // Move to next step: selecting children
    setCurrentLevel(currentLevel + 0.5) // Use 0.5 to indicate "selecting children" phase
  }

  // Handle child selection for a parent
  const toggleChildSelection = (parentName: string, childName: string) => {
    const newHierarchy = { ...hierarchy }
    const level = Math.floor(currentLevel)
    
    if (!newHierarchy[level]) {
      newHierarchy[level] = {}
    }
    if (!newHierarchy[level][parentName]) {
      newHierarchy[level][parentName] = []
    }

    const children = newHierarchy[level][parentName]
    if (children.includes(childName)) {
      newHierarchy[level][parentName] = children.filter(c => c !== childName)
    } else {
      newHierarchy[level][parentName].push(childName)
    }

    setHierarchy(newHierarchy)
    onConfigChange(newHierarchy)
  }

  // Get current parent being configured
  const getCurrentParent = (): string | null => {
    const level = Math.floor(currentLevel)
    if (hierarchy[level]) {
      const parents = Object.keys(hierarchy[level])
      const parentIndex = Math.floor((currentLevel - level) * parents.length)
      return parents[parentIndex] || null
    }
    return null
  }

  // Get all parents at current level that need children
  const getParentsNeedingChildren = (): string[] => {
    const level = Math.floor(currentLevel)
    if (hierarchy[level]) {
      return Object.keys(hierarchy[level])
    }
    return []
  }

  // Check if we're in "selecting children" phase
  const isSelectingChildren = currentLevel % 1 !== 0
  const actualLevel = Math.floor(currentLevel)
  const parentsNeedingChildren = getParentsNeedingChildren()
  const currentParentIndex = isSelectingChildren 
    ? Math.floor((currentLevel - actualLevel) * parentsNeedingChildren.length)
    : -1
  const currentParent = isSelectingChildren ? parentsNeedingChildren[currentParentIndex] : null

  // Move to next parent or next level
  const nextStep = () => {
    if (isSelectingChildren) {
      const nextParentIndex = currentParentIndex + 1
      if (nextParentIndex < parentsNeedingChildren.length) {
        // Move to next parent
        setCurrentLevel(actualLevel + (nextParentIndex + 1) / parentsNeedingChildren.length)
      } else {
        // All parents configured, move to next level
        const nextLevel = actualLevel + 1
        const nextLevelRegions = getAvailableRegions(nextLevel)
        if (nextLevelRegions.length > 0) {
          setCurrentLevel(nextLevel)
        } else {
          // No more regions, show preview
          setShowPreview(true)
        }
      }
    } else {
      // Just confirmed level selection, start selecting children for first parent
      if (parentsNeedingChildren.length > 0) {
        setCurrentLevel(actualLevel + 1 / parentsNeedingChildren.length)
      } else {
        // No parents selected, move to next level
        const nextLevel = actualLevel + 1
        const nextLevelRegions = getAvailableRegions(nextLevel)
        if (nextLevelRegions.length > 0) {
          setCurrentLevel(nextLevel)
        } else {
          setShowPreview(true)
        }
      }
    }
  }

  // Go back
  const goBack = () => {
    if (isSelectingChildren) {
      if (currentParentIndex > 0) {
        // Go to previous parent
        setCurrentLevel(actualLevel + currentParentIndex / parentsNeedingChildren.length)
      } else {
        // Go back to level selection
        setCurrentLevel(actualLevel)
      }
    } else {
      // Go back to previous level
      if (actualLevel > 1) {
        setCurrentLevel(actualLevel - 1)
      }
    }
  }

  // Build hierarchy tree for preview
  const buildHierarchyTree = (): HierarchyNode[] => {
    const roots: HierarchyNode[] = []
    const processed = new Set<string>()

    // Find all regions that are assigned as children
    const allChildren = new Set<string>()
    Object.values(hierarchy).forEach(levelConfig => {
      Object.values(levelConfig).forEach((children: unknown) => {
        if (Array.isArray(children)) {
          children.forEach((child: string) => allChildren.add(child))
        }
      })
    })

    // Find root nodes (regions that are parents at level 1 and not children of anything)
    const level1Parents = hierarchy[1] ? Object.keys(hierarchy[1]) : []
    const rootRegions = level1Parents.filter(r => !allChildren.has(r))
    
    // Also include regions that aren't in any hierarchy
    const unassignedRegions = regions.filter(r => {
      const isChild = allChildren.has(r)
      const isParent = Object.values(hierarchy).some(levelConfig => 
        Object.keys(levelConfig).includes(r)
      )
      return !isChild && !isParent
    })
    
    const buildNode = (name: string, level: number): HierarchyNode => {
      if (processed.has(name)) {
        return { name, level, children: [] }
      }
      processed.add(name)

      const node: HierarchyNode = {
        name,
        level,
        children: []
      }

      // Find children in hierarchy at this level
      if (hierarchy[level]) {
        const children = (hierarchy[level][name] || []) as string[]
        children.forEach((child: string) => {
          // Find which level the child is a parent at
          let childLevel = level + 1
          for (let l = level + 1; l <= maxLevel; l++) {
            if (hierarchy[l] && hierarchy[l][child]) {
              childLevel = l
              break
            }
          }
          node.children.push(buildNode(child, childLevel))
        })
      }

      return node
    }

    // Build tree for level 1 parents
    rootRegions.forEach(root => {
      roots.push(buildNode(root, 1))
    })

    // Add unassigned regions as separate roots
    unassignedRegions.forEach(region => {
      roots.push({ name: region, level: 0, children: [] })
    })

    return roots
  }

  const renderHierarchyTree = (nodes: HierarchyNode[], depth: number = 0): React.ReactElement[] => {
    return nodes.map((node, index) => (
      <div key={`${node.name}-${index}`} className="ml-4">
        <div className="flex items-center gap-2 py-1">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-gray-500">(Level {node.level})</span>
        </div>
        {node.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {renderHierarchyTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (showPreview) {
    const hierarchyTree = buildHierarchyTree()
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-2">
                Hierarchy Preview
              </h4>
              <p className="text-sm text-green-800 mb-4">
                Review your geographical hierarchy configuration below. Click "Confirm" to proceed with processing.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Geographical Hierarchy Structure</h3>
          {hierarchyTree.length > 0 ? (
            <div className="space-y-2">
              {hierarchyTree.map((node, index) => (
                <div key={`${node.name}-${index}`}>
                  {node.level === 0 ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="font-medium text-gray-600">{node.name}</span>
                      <span className="text-xs text-gray-500">(Unassigned - will be treated as individual data point)</span>
                    </div>
                  ) : (
                    renderHierarchyTree([node])
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No hierarchy configured. All regions will be treated as individual data points.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowPreview(false)
              if (maxLevel > 0) {
                setCurrentLevel(maxLevel)
              } else {
                setCurrentLevel(1)
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </button>
          <button
            onClick={() => {
              // Configuration is already saved via onConfigChange
              // Close preview - parent component will handle proceeding
              setShowPreview(false)
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            <Check className="h-5 w-5" />
            Confirm & Ready to Process
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Configure Geographical Hierarchy - Level {actualLevel}
            </h4>
            <p className="text-sm text-blue-800">
              {isSelectingChildren 
                ? `Select child regions for "${currentParent}". Regions selected here will be aggregated under "${currentParent}".`
                : `Select regions that belong to Level ${actualLevel}. These will be treated as parent/aggregation regions.`}
            </p>
          </div>
        </div>
      </div>

      {!isSelectingChildren ? (
        // Level selection phase
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Select Regions for Level {actualLevel}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {availableRegions.map(region => (
                <label
                  key={region}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedRegions.has(region)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRegions.has(region)}
                    onChange={() => toggleRegionSelection(region)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">{region}</span>
                </label>
              ))}
            </div>
            {availableRegions.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No more regions available for this level.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {actualLevel > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              onClick={confirmLevelSelection}
              disabled={selectedRegions.size === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Confirm Selection
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        // Child selection phase
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Select Children for "{currentParent}" (Level {actualLevel})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which regions should be aggregated under "{currentParent}". 
              These regions will be treated as child regions, and "{currentParent}" will be calculated as their sum.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {getAvailableChildren(actualLevel, currentParent!).map(region => {
                const isSelected = hierarchy[actualLevel]?.[currentParent!]?.includes(region) || false
                return (
                  <label
                    key={region}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleChildSelection(currentParent!, region)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{region}</span>
                  </label>
                )
              })}
            </div>
            {getAvailableChildren(actualLevel, currentParent!).length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No more regions available as children. "{currentParent}" will be treated as a leaf region.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {currentParentIndex < parentsNeedingChildren.length - 1 ? (
                <>
                  Next Parent
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Continue to Next Level
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {parentsNeedingChildren.length > 1 && (
            <div className="text-sm text-gray-600 text-center">
              Parent {currentParentIndex + 1} of {parentsNeedingChildren.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
