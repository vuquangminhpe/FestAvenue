import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Bell } from 'lucide-react'

interface BellNotificationProps {
  isActive: boolean
  size?: number
  color?: string
}

export default function BellNotification({
  isActive,
  size = 24,
  color = '#fbbf24'
}: BellNotificationProps) {
  const bellRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bellRef.current || !glowRef.current) return

    if (isActive) {
      // Bell swing animation
      const bellTl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

      bellTl
        .to(bellRef.current, {
          rotation: -15,
          duration: 0.1,
          ease: 'power2.out'
        })
        .to(bellRef.current, {
          rotation: 15,
          duration: 0.15,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: -10,
          duration: 0.15,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: 10,
          duration: 0.15,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: -5,
          duration: 0.1,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: 5,
          duration: 0.1,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: 0,
          duration: 0.1,
          ease: 'power2.in'
        })

      // Glow pulse animation
      gsap.to(glowRef.current, {
        opacity: 0.8,
        scale: 1.3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })

      return () => {
        bellTl.kill()
        gsap.killTweensOf([bellRef.current, glowRef.current])
      }
    } else {
      gsap.to([bellRef.current, glowRef.current], {
        rotation: 0,
        scale: 1,
        opacity: 0,
        duration: 0.3
      })
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className='relative inline-flex items-center justify-center'>
      {/* Glow effect */}
      <div
        ref={glowRef}
        className='absolute rounded-full blur-md'
        style={{
          width: size * 1.5,
          height: size * 1.5,
          backgroundColor: color,
          opacity: 0
        }}
      />

      {/* Bell icon */}
      <div
        ref={bellRef}
        className='relative z-10'
        style={{
          transformOrigin: 'top center'
        }}
      >
        <Bell
          size={size}
          style={{ color }}
          fill={color}
          className='drop-shadow-lg'
        />
      </div>

      {/* Ring indicator */}
      <div
        className='absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white'
        style={{ backgroundColor: '#ef4444' }}
      >
        <div className='absolute inset-0 rounded-full animate-ping' style={{ backgroundColor: '#ef4444', opacity: 0.5 }} />
      </div>
    </div>
  )
}
