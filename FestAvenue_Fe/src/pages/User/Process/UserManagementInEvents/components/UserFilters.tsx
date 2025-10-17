import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface UserFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function UserFilters({ searchTerm, setSearchTerm }: UserFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      })
    }
  }, [])

  return (
    <div ref={containerRef} className='flex flex-col sm:flex-row gap-4 mb-6'>
      {/* Search Input */}
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
        <Input
          type='text'
          placeholder='Tìm kiếm theo tên người dùng'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10 pr-4 py-6 bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300'
        />
      </div>
    </div>
  )
}
