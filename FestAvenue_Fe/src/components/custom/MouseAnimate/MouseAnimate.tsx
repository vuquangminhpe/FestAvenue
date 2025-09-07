/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState, useCallback } from 'react'

const COLORS: string[] = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#55E6C1']

const MAX_DISTANCE: number = 150

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  color: string
}

interface MousePosition {
  x: number
  y: number
}

interface MouseAnimateProps {
  className?: string
  number_point?: number
}

const MouseAnimate: React.FC<MouseAnimateProps> = ({ className, number_point = 10 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [, setPoints] = useState<Point[]>([])
  const mousePosRef = useRef<MousePosition>({ x: 0, y: 0 })
  const animationRef = useRef<number | undefined>(undefined)

  const initializePoints = useCallback(
    (width: number, height: number): Point[] => {
      return Array.from({ length: number_point }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }))
    },
    [number_point]
  )

  const updatePoints = useCallback((width: number, height: number, currentPoints: Point[]): Point[] => {
    return currentPoints.map((point) => {
      const newX = point.x + point.vx
      const newY = point.y + point.vy

      if (newX < 0 || newX > width) point.vx *= -1
      if (newY < 0 || newY > height) point.vy *= -1

      return {
        ...point,
        x: Math.max(0, Math.min(newX, width)),
        y: Math.max(0, Math.min(newY, height))
      }
    })
  }, [])

  const drawCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, currentPoints: Point[]) => {
      ctx.clearRect(0, 0, width, height)

      currentPoints.forEach((point, i) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = point.color
        ctx.fill()

        for (let j = i + 1; j < currentPoints.length; j++) {
          const otherPoint = currentPoints[j]
          const dx = point.x - otherPoint.x
          const dy = point.y - otherPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < MAX_DISTANCE) {
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(otherPoint.x, otherPoint.y)
            ctx.strokeStyle = `rgba(${parseInt(point.color.slice(1, 3), 16)}, ${parseInt(
              point.color.slice(3, 5),
              16
            )}, ${parseInt(point.color.slice(5, 7), 16)}, ${1 - distance / MAX_DISTANCE})`
            ctx.stroke()
          }
        }
      })

      currentPoints.forEach((point) => {
        const dx = point.x - mousePosRef.current.x
        const dy = point.y - mousePosRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < MAX_DISTANCE) {
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(mousePosRef.current.x, mousePosRef.current.y)
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / MAX_DISTANCE})`
          ctx.stroke()
        }
      })
    },
    []
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setPoints((prevPoints) => {
      const updatedPoints = updatePoints(canvas.width, canvas.height, prevPoints)
      drawCanvas(ctx, canvas.width, canvas.height, updatedPoints)
      return updatedPoints
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [updatePoints, drawCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      setPoints(initializePoints(canvas.width, canvas.height))
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, initializePoints])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default MouseAnimate
