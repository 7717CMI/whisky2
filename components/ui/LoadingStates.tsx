'use client'

export function ChartSkeleton() {
  return (
    <div className="w-full h-[450px] bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-full bg-gray-100 rounded flex items-end justify-around p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 mx-1">
            <div 
              className="bg-gray-200 rounded-t" 
              style={{ height: `${Math.random() * 60 + 20}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-gray-100 rounded w-1/3"></div>
    </div>
  )
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-black font-medium">{message}</p>
      </div>
    </div>
  )
}
