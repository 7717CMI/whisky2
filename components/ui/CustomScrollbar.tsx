'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface CustomScrollbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}

export function CustomScrollbar({ containerRef, children }: CustomScrollbarProps) {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const scrollbarRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startScrollTop = useRef(0)

  // Calculate scroll percentage
  const updateScrollPosition = useCallback(() => {
    if (!containerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll > 0) {
      const percentage = (scrollTop / maxScroll) * 100
      setScrollPercentage(percentage)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [containerRef])

  // Handle mouse down on thumb
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    startY.current = e.clientY
    
    if (containerRef.current) {
      startScrollTop.current = containerRef.current.scrollTop
    }
    
    setIsScrolling(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [containerRef])

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current || !scrollbarRef.current) return
    
    const deltaY = e.clientY - startY.current
    const scrollbarHeight = scrollbarRef.current.clientHeight
    const thumbHeight = 60 // Height of thumb
    const maxThumbTravel = scrollbarHeight - thumbHeight
    
    const { scrollHeight, clientHeight } = containerRef.current
    const maxScroll = scrollHeight - clientHeight
    
    const scrollDelta = (deltaY / maxThumbTravel) * maxScroll
    containerRef.current.scrollTop = startScrollTop.current + scrollDelta
  }, [containerRef])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    setIsScrolling(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  // Handle click on track
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !scrollbarRef.current || e.target === thumbRef.current) return
    
    const rect = scrollbarRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const scrollbarHeight = scrollbarRef.current.clientHeight
    const percentage = (clickY / scrollbarHeight) * 100
    
    const { scrollHeight, clientHeight } = containerRef.current
    const maxScroll = scrollHeight - clientHeight
    containerRef.current.scrollTop = (percentage / 100) * maxScroll
  }, [containerRef])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', updateScrollPosition)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    // Initial calculation
    updateScrollPosition()
    
    // Handle window resize
    const handleResize = () => updateScrollPosition()
    window.addEventListener('resize', handleResize)
    
    return () => {
      container.removeEventListener('scroll', updateScrollPosition)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef, handleMouseMove, handleMouseUp, updateScrollPosition])

  const thumbPosition = Math.min(scrollPercentage, 94) // Max 94% to prevent overflow

  return (
    <>
      {children}
      {isVisible && (
        <div 
          ref={scrollbarRef}
          className={`absolute right-0 top-0 bottom-0 w-3 bg-gray-100 rounded-full transition-opacity duration-200 ${
            isScrolling ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
          onClick={handleTrackClick}
          style={{ cursor: 'pointer' }}
        >
          <div 
            ref={thumbRef}
            className={`absolute left-0 right-0 h-[60px] bg-gradient-to-b from-[#52B69A] to-[#34A0A4] rounded-full shadow-sm transition-all duration-150 ${
              isScrolling ? 'w-3' : 'w-2 hover:w-3'
            }`}
            style={{ 
              top: `${thumbPosition}%`,
              cursor: isDragging.current ? 'grabbing' : 'grab',
              marginLeft: isScrolling ? '0' : '2px'
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </>
  )
}
