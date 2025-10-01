import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  suffix?: string
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  trend = 'neutral',
  suffix = ''
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    }
  }, [])

  useEffect(() => {
    if (valueRef.current && typeof value === 'number') {
      gsap.from(valueRef.current, {
        textContent: 0,
        duration: 1.5,
        ease: 'power1.inOut',
        snap: { textContent: 1 },
        onUpdate: function () {
          if (valueRef.current) {
            const currentValue = Math.ceil(Number(this.targets()[0].textContent))
            valueRef.current.textContent = currentValue.toLocaleString()
          }
        }
      })
    }
  }, [value])

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '→'
  }

  return (
    <div
      ref={cardRef}
      className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300'
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm text-gray-600 font-medium mb-2'>{title}</p>
          <div className='flex items-baseline gap-2'>
            <h3 ref={valueRef} className='text-3xl font-bold text-gray-900'>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {suffix && <span className='text-lg text-gray-600 font-medium'>{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className='flex items-center gap-1 mt-2'>
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(change)}%
              </span>
              <span className='text-xs text-gray-500'>vs tháng trước</span>
            </div>
          )}
        </div>
        <div className='p-3 rounded-lg' style={{ backgroundColor: iconBg }}>
          <Icon className='w-6 h-6' style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}
