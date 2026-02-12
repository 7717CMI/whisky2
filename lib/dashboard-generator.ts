/**
 * Dashboard Generator
 * Generates a complete, deployment-ready Next.js app from processed data
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type { ComparisonData } from './types'
import archiver from 'archiver'

interface FileEntry {
  path: string
  content: string | Buffer
  isDirectory?: boolean
}

/**
 * Generate all files for a deployment-ready Next.js dashboard
 */
export async function generateDashboardFiles(
  data: ComparisonData,
  projectName: string = 'market-dashboard'
): Promise<FileEntry[]> {
  const files: FileEntry[] = []
  
  // Helper to add file
  const addFile = (filePath: string, content: string | Buffer) => {
    files.push({ path: filePath, content })
  }
  
  // 1. Root files
  addFile('package.json', generatePackageJson())
  addFile('tsconfig.json', generateTsConfig())
  addFile('next.config.ts', generateNextConfig())
  addFile('postcss.config.mjs', generatePostcssConfig())
  addFile('vercel.json', generateVercelConfig())
  addFile('.gitignore', generateGitignore())
  addFile('README.md', generateReadme(projectName))
  addFile('next-env.d.ts', generateNextEnv())
  
  // 2. App directory structure
  addFile('app/layout.tsx', generateLayout())
  addFile('app/page.tsx', await generatePage())
  const globalsCss = await readTemplateFile('app/globals.css')
  if (globalsCss) {
    addFile('app/globals.css', globalsCss)
  }
  addFile('app/api/process-data/route.ts', generateProcessDataRoute())
  
  // NOTE: We intentionally do NOT include:
  // - app/excel-upload/ (not needed for client deployments)
  // - app/dashboard-builder/ (not needed for client deployments)
  // - app/api/process-excel/ (not needed for client deployments)
  // - app/api/generate-dashboard/ (not needed for client deployments)
  
  // 3. Components directory - Copy all component files
  const componentFiles = await getComponentFiles()
  for (const file of componentFiles) {
    const content = await readTemplateFile(file)
    if (content) {
      addFile(file, content)
    }
  }
  
  // 4. Lib directory - Copy all lib files
  const libFiles = await getLibFiles()
  for (const file of libFiles) {
    const content = await readTemplateFile(file)
    if (content) {
      addFile(file, content)
    }
  }
  
  // 5. Public directory with data and logo
  addFile('public/data/value.json', JSON.stringify(extractValueData(data), null, 2))
  if (data.data.volume?.geography_segment_matrix?.length > 0) {
    addFile('public/data/volume.json', JSON.stringify(extractVolumeData(data), null, 2))
  }
  addFile('public/data/segmentation_analysis.json', JSON.stringify(extractSegmentationData(data), null, 2))
  
  // Copy logo if it exists
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = await fs.readFile(logoPath)
    addFile('public/logo.png', logoBuffer)
  } catch (error) {
    console.warn('Logo file not found, skipping...')
  }
  
  // 6. Styles directory
  const stylesContent = await readTemplateFile('styles/animations.css')
  if (stylesContent) {
    addFile('styles/animations.css', stylesContent)
  }
  
  return files
}

/**
 * Extract value data from ComparisonData for JSON export
 */
function extractValueData(data: ComparisonData): any {
  // Reconstruct the original JSON structure from ComparisonData
  const result: any = {}
  
  for (const record of data.data.value.geography_segment_matrix) {
    const geo = record.geography
    const segmentType = record.segment_type
    
    if (!result[geo]) {
      result[geo] = {}
    }
    if (!result[geo][segmentType]) {
      result[geo][segmentType] = {}
    }
    
    // Build path from segment hierarchy
    // Limit depth to prevent stack overflow
    const MAX_SEGMENT_DEPTH = 10
    const segments = [
      record.segment_hierarchy.level_1,
      record.segment_hierarchy.level_2,
      record.segment_hierarchy.level_3,
      record.segment_hierarchy.level_4,
      record.segment_hierarchy.level_5, // Include level 5 if it exists
    ].filter(Boolean).slice(0, MAX_SEGMENT_DEPTH) // Limit to max depth
    
    let current = result[geo][segmentType]
    let depth = 0
    for (const segment of segments) {
      if (depth >= MAX_SEGMENT_DEPTH) {
        console.warn(`Maximum segment depth (${MAX_SEGMENT_DEPTH}) reached for record:`, record.segment)
        break
      }
      if (segment && typeof segment === 'string') {
        if (!current[segment]) {
          current[segment] = {}
        }
        current = current[segment]
        depth++
      }
    }
    
    // Add year data
    for (const [year, value] of Object.entries(record.time_series)) {
      if (year && typeof year === 'string') {
        current[year] = value
      }
    }
    
    if (record.cagr) {
      current.CAGR = `${record.cagr}%`
    }
    
    if (record.is_aggregated) {
      current._aggregated = true
      if (record.aggregation_level !== null) {
        current._level = record.aggregation_level
      }
    }
  }
  
  return result
}

/**
 * Extract volume data from ComparisonData for JSON export
 */
function extractVolumeData(data: ComparisonData): any {
  if (!data.data.volume?.geography_segment_matrix) {
    return {}
  }
  
  const result: any = {}
  
  for (const record of data.data.volume.geography_segment_matrix) {
    const geo = record.geography
    const segmentType = record.segment_type
    
    if (!result[geo]) {
      result[geo] = {}
    }
    if (!result[geo][segmentType]) {
      result[geo][segmentType] = {}
    }
    
    // Build path from segment hierarchy
    // Limit depth to prevent stack overflow
    const MAX_SEGMENT_DEPTH = 10
    const segments = [
      record.segment_hierarchy.level_1,
      record.segment_hierarchy.level_2,
      record.segment_hierarchy.level_3,
      record.segment_hierarchy.level_4,
      record.segment_hierarchy.level_5, // Include level 5 if it exists
    ].filter(Boolean).slice(0, MAX_SEGMENT_DEPTH) // Limit to max depth
    
    let current = result[geo][segmentType]
    let depth = 0
    for (const segment of segments) {
      if (depth >= MAX_SEGMENT_DEPTH) {
        console.warn(`Maximum segment depth (${MAX_SEGMENT_DEPTH}) reached for record:`, record.segment)
        break
      }
      if (segment && typeof segment === 'string') {
        if (!current[segment]) {
          current[segment] = {}
        }
        current = current[segment]
        depth++
      }
    }
    
    for (const [year, value] of Object.entries(record.time_series)) {
      if (year && typeof year === 'string') {
        current[year] = value
      }
    }
    
    if (record.cagr) {
      current.CAGR = `${record.cagr}%`
    }
  }
  
  return result
}

/**
 * Extract segmentation structure (without year data)
 */
function extractSegmentationData(data: ComparisonData): any {
  const result: any = {}
  
  // Build structure from dimensions
  for (const geo of data.dimensions.geographies.all_geographies) {
    result[geo] = {}
    
    for (const [segmentType, segmentDim] of Object.entries(data.dimensions.segments)) {
      result[geo][segmentType] = {}
      
      // Build hierarchy from segment items
      // Add stack overflow protection with max depth limit
      const MAX_HIERARCHY_DEPTH = 20
      const visitedItems = new Set<string>() // Track visited items to prevent circular references
      
      const buildHierarchy = (items: string[], hierarchy: Record<string, string[]>, parent: any, level: number = 0, path: string = '') => {
        // Stack overflow protection: limit recursion depth
        if (level > MAX_HIERARCHY_DEPTH) {
          console.warn(`Maximum hierarchy depth (${MAX_HIERARCHY_DEPTH}) reached at path: ${path}`)
          return
        }
        
        for (const item of items) {
          const itemPath = path ? `${path} > ${item}` : item
          
          // Circular reference protection: check if we've seen this item in the current path
          if (visitedItems.has(itemPath)) {
            console.warn(`Circular reference detected at path: ${itemPath}, skipping`)
            continue
          }
          
          if (!parent[item]) {
            parent[item] = {}
          }
          
          if (hierarchy[item] && hierarchy[item].length > 0) {
            visitedItems.add(itemPath)
            buildHierarchy(hierarchy[item], hierarchy, parent[item], level + 1, itemPath)
            visitedItems.delete(itemPath) // Remove from visited set after processing
          }
        }
      }
      
      if (segmentDim.items && segmentDim.hierarchy) {
        const topLevel = segmentDim.items.filter(item => !Object.values(segmentDim.hierarchy).some(children => children.includes(item)))
        buildHierarchy(topLevel, segmentDim.hierarchy, result[geo][segmentType])
      }
    }
  }
  
  return result
}

/**
 * Generate package.json
 */
function generatePackageJson(): string {
  return JSON.stringify({
    name: "market-dashboard",
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "eslint"
    },
    dependencies: {
      "@radix-ui/react-select": "^2.2.6",
      "@radix-ui/react-slider": "^1.3.6",
      "@tanstack/react-table": "^8.21.3",
      "@types/d3": "^7.4.3",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "d3": "^7.9.0",
      "file-saver": "^2.0.5",
      "html2canvas": "^1.4.1",
      "jspdf": "^3.0.3",
      "lucide-react": "^0.553.0",
      "next": "16.0.1",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "recharts": "^3.4.1",
      "tailwind-merge": "^3.4.0",
      "xlsx": "^0.18.5",
      "zustand": "^5.0.8"
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4",
      "@types/file-saver": "^2.0.7",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "eslint": "^9",
      "eslint-config-next": "16.0.1",
      "tailwindcss": "^4",
      "typescript": "^5"
    }
  }, null, 2)
}

/**
 * Generate tsconfig.json
 */
function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [
        {
          name: "next"
        }
      ],
      paths: {
        "@/*": ["./*"]
      }
    },
    include: [
      "next-env.d.ts",
      "**/*.ts",
      "**/*.tsx",
      ".next/types/**/*.ts",
      ".next/dev/types/**/*.ts",
      "**/*.mts"
    ],
    exclude: ["node_modules"]
  }, null, 2)
}

/**
 * Generate next.config.ts
 */
function generateNextConfig(): string {
  return `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  output: 'standalone',
  serverExternalPackages: ['fs', 'path'],
};

export default nextConfig;
`
}

/**
 * Generate postcss.config.mjs
 */
function generatePostcssConfig(): string {
  return `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`
}

/**
 * Generate vercel.json
 */
function generateVercelConfig(): string {
  return JSON.stringify({
    functions: {
      "app/api/process-data/route.ts": {
        "maxDuration": 300
      }
    },
    buildCommand: "npm run build",
    outputDirectory: ".next",
    framework: "nextjs",
    installCommand: "npm install"
  }, null, 2)
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
}

/**
 * Generate README.md
 */
function generateReadme(projectName: string): string {
  return `# ${projectName}

Market Analysis Dashboard - Generated by Coherent Dashboard Builder

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Deploy to Vercel

1. Push this code to a GitHub repository
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy

### Manual Deployment

1. Run \`npm run build\`
2. The \`.next\` folder contains the production build
3. Deploy the \`.next\` folder to your hosting provider

## Features

- Interactive market analysis dashboard
- Multiple chart types (bar, line, heatmap, bubble, etc.)
- Filtering and segmentation
- Opportunity matrix visualization
- Export capabilities

## Data

Market data is stored in \`public/data/\` directory:
- \`value.json\` - Market value data
- \`volume.json\` - Market volume data (if available)
- \`segmentation_analysis.json\` - Market segmentation structure

## License

Private - Generated Dashboard
`
}

/**
 * Generate next-env.d.ts
 */
function generateNextEnv(): string {
  return `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`
}

/**
 * Generate app/layout.tsx
 */
function generateLayout(): string {
  return `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Market Analysis Dashboard",
  description: "Interactive dashboard with charts and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const className = \`\${geistSans.variable} \${geistMono.variable} antialiased\`;
  return (
    <html lang="en">
      <body className={className}>
        {children}
      </body>
    </html>
  );
}
`
}

/**
 * Generate app/page.tsx
 * Reads the actual page.tsx file and adapts it for the generated dashboard
 */
async function generatePage(): Promise<string> {
  const pageContent = await readTemplateFile('app/page.tsx')
  if (pageContent) {
    // Replace the API call to use the embedded data files
    let adapted = pageContent.replace(
      '/api/process-data?valuePath=value.json&volumePath=volume.json&segmentationPath=segmentation_analysis.json',
      '/api/process-data?valuePath=data/value.json&volumePath=data/volume.json&segmentationPath=data/segmentation_analysis.json'
    )
    // Remove the Excel upload and Dashboard Builder links since this is a generated dashboard for clients
    adapted = adapted.replace(
      /<a[\s\S]*?href="\/excel-upload"[\s\S]*?<\/a>/g,
      ''
    )
    adapted = adapted.replace(
      /<a[\s\S]*?href="\/dashboard-builder"[\s\S]*?<\/a>/g,
      ''
    )
    // Remove the DashboardBuilderDownload component import and usage
    adapted = adapted.replace(
      /import\s+{\s*DashboardBuilderDownload\s*}\s+from\s+['"]@\/components\/DashboardBuilderDownload['"];?\s*/g,
      ''
    )
    adapted = adapted.replace(
      /<DashboardBuilderDownload\s*\/>/g,
      ''
    )
    // Remove the entire "Action Links" section if it becomes empty
    // Match the section more precisely
    adapted = adapted.replace(
      /{\/\* Action Links \*\/}\s*<div[\s\S]*?flex-shrink-0[\s\S]*?<\/div>\s*<\/div>/,
      ''
    )
    return adapted
  }
  // Fallback if file can't be read
  return `'use client'

import { useEffect, useState } from 'react'
import { useDashboardStore } from '@/lib/store'

export default function DashboardPage() {
  const { setData, setLoading } = useDashboardStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function loadData() {
      try {
        setLoading(true)
        const response = await fetch('/api/process-data?valuePath=data/value.json&volumePath=data/volume.json&segmentationPath=data/segmentation_analysis.json')
        if (response.ok) {
          const data = await response.json()
          setData(data)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Market Analysis Dashboard</h1>
      <p>Dashboard is loading...</p>
    </div>
  )
}
`
}

/**
 * Generate app/api/process-data/route.ts
 */
function generateProcessDataRoute(): string {
  return `import { NextRequest, NextResponse } from 'next/server'
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
      const cleanPath = filePath.replace(/^data\\//, '')
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
`
}

/**
 * Read template file from current project
 */
async function readTemplateFile(filePath: string): Promise<string | null> {
  try {
    const currentDir = process.cwd()
    const fullPath = path.join(currentDir, filePath)
    const content = await fs.readFile(fullPath, 'utf-8')
    return content
  } catch (error) {
    console.warn(`Could not read template file ${filePath}:`, error)
    return null
  }
}

/**
 * Get list of component files to copy
 */
async function getComponentFiles(): Promise<string[]> {
  const componentDir = path.join(process.cwd(), 'components')
  const files: string[] = []
  
  // Stack overflow protection: limit directory depth
  const MAX_DIRECTORY_DEPTH = 20
  const visitedDirs = new Set<string>() // Prevent circular symlinks
  
  async function walkDir(dir: string, basePath: string = 'components', depth: number = 0) {
    // Stack overflow protection
    if (depth > MAX_DIRECTORY_DEPTH) {
      console.warn(`Maximum directory depth (${MAX_DIRECTORY_DEPTH}) reached at: ${dir}`)
      return
    }
    
    // Prevent circular references (symlinks)
    const normalizedPath = path.resolve(dir)
    if (visitedDirs.has(normalizedPath)) {
      console.warn(`Circular reference detected at: ${dir}, skipping`)
      return
    }
    visitedDirs.add(normalizedPath)
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)
        
        if (entry.isDirectory()) {
          await walkDir(fullPath, relativePath, depth + 1)
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          files.push(relativePath)
        }
      }
      
      visitedDirs.delete(normalizedPath) // Remove after processing
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error)
      visitedDirs.delete(normalizedPath) // Remove on error
    }
  }
  
  await walkDir(componentDir)
  return files
}

/**
 * Get list of lib files to copy
 */
async function getLibFiles(): Promise<string[]> {
  const libDir = path.join(process.cwd(), 'lib')
  const files: string[] = []
  
  // Stack overflow protection: limit directory depth
  const MAX_DIRECTORY_DEPTH = 20
  const visitedDirs = new Set<string>() // Prevent circular symlinks
  
  async function walkDir(dir: string, basePath: string = 'lib', depth: number = 0) {
    // Stack overflow protection
    if (depth > MAX_DIRECTORY_DEPTH) {
      console.warn(`Maximum directory depth (${MAX_DIRECTORY_DEPTH}) reached at: ${dir}`)
      return
    }
    
    // Prevent circular references (symlinks)
    const normalizedPath = path.resolve(dir)
    if (visitedDirs.has(normalizedPath)) {
      console.warn(`Circular reference detected at: ${dir}, skipping`)
      return
    }
    visitedDirs.add(normalizedPath)
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)
        
        if (entry.isDirectory()) {
          await walkDir(fullPath, relativePath, depth + 1)
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(relativePath)
        }
      }
      
      visitedDirs.delete(normalizedPath) // Remove after processing
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error)
      visitedDirs.delete(normalizedPath) // Remove on error
    }
  }
  
  await walkDir(libDir)
  return files
}

/**
 * Create a zip file from file entries
 */
export async function createZipFile(files: FileEntry[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })
    
    const chunks: Buffer[] = []
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    
    archive.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    
    archive.on('error', (err) => {
      reject(err)
    })
    
    // Add files to archive (archiver handles directory structure automatically)
    for (const file of files) {
      if (!file.isDirectory) {
        if (Buffer.isBuffer(file.content)) {
          archive.append(file.content, { name: file.path })
        } else {
          archive.append(Buffer.from(file.content, 'utf-8'), { name: file.path })
        }
      }
    }
    
    archive.finalize()
  })
}

