import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Bell } from 'lucide-react'

type NotificationStatus = 'upcoming' | 'overdue' | 'none'

interface BellNotificationProps {
  status: NotificationStatus
  size?: number
}

const STATUS_CONFIG = {
  upcoming: {
    color: '#f59e0b', // amber-500
    glowColor: '#fbbf24', // amber-400
    ringColor: '#f59e0b'
  },
  overdue: {
    color: '#ef4444', // red-500
    glowColor: '#dc2626', // red-600
    ringColor: '#ef4444'
  },
  none: {
    color: '#9ca3af',
    glowColor: '#9ca3af',
    ringColor: '#9ca3af'
  }
}

export default function BellNotification({ status, size = 24 }: BellNotificationProps) {
  const bellRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bellRef.current || !glowRef.current || status === 'none') return

    const isOverdue = status === 'overdue'

    // Bell animation - more aggressive for overdue
    const bellTl = gsap.timeline({
      repeat: -1,
      repeatDelay: isOverdue ? 1 : 2 // Faster repeat for overdue
    })

    if (isOverdue) {
      // Shake animation for overdue
      bellTl
        .to(bellRef.current, {
          x: -3,
          duration: 0.05,
          ease: 'power2.out'
        })
        .to(bellRef.current, {
          x: 3,
          duration: 0.05,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          x: -3,
          duration: 0.05,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          x: 3,
          duration: 0.05,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          x: 0,
          duration: 0.05,
          ease: 'power2.in'
        })
    } else {
      // Gentle swing for upcoming
      bellTl
        .to(bellRef.current, {
          rotation: -10,
          duration: 0.15,
          ease: 'power2.out'
        })
        .to(bellRef.current, {
          rotation: 10,
          duration: 0.2,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: -5,
          duration: 0.15,
          ease: 'power2.inOut'
        })
        .to(bellRef.current, {
          rotation: 0,
          duration: 0.15,
          ease: 'power2.in'
        })
    }

    // Glow pulse animation - faster and stronger for overdue
    gsap.to(glowRef.current, {
      opacity: isOverdue ? 0.9 : 0.7,
      scale: isOverdue ? 1.5 : 1.3,
      duration: isOverdue ? 0.6 : 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })

    return () => {
      bellTl.kill()
      gsap.killTweensOf([bellRef.current, glowRef.current])
    }
  }, [status])

  if (status === 'none') return null

  const config = STATUS_CONFIG[status]

  return (
    <div className='relative inline-flex items-center justify-center'>
      {/* Glow effect */}
      <div
        ref={glowRef}
        className='absolute rounded-full blur-md'
        style={{
          width: size * 1.5,
          height: size * 1.5,
          backgroundColor: config.glowColor,
          opacity: 0
        }}
      />

      {/* Bell icon */}
      <div
        ref={bellRef}
        className='relative z-10'
        style={{
          transformOrigin: status === 'overdue' ? 'center center' : 'top center'
        }}
      >
        <Bell size={size} style={{ color: config.color }} fill={config.color} className='drop-shadow-lg' />
      </div>

      {/* Ring indicator */}
      <div
        className='absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white'
        style={{ backgroundColor: config.ringColor }}
      >
        <div
          className='absolute inset-0 rounded-full animate-ping'
          style={{
            backgroundColor: config.ringColor,
            opacity: status === 'overdue' ? 0.7 : 0.5,
            animationDuration: status === 'overdue' ? '0.8s' : '1.5s'
          }}
        />
      </div>
    </div>
  )
}
