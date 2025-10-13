import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { roleOptions } from '@/mocks/userManagement.mock'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface UserFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedRole: string
  setSelectedRole: (value: string) => void
}

export default function UserFilters({ searchTerm, setSearchTerm, selectedRole, setSelectedRole }: UserFiltersProps) {
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
          placeholder='Nhập tên vào đây'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10 pr-4 py-6 bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300'
        />
      </div>

      {/* Role Filter */}
      <div className='sm:w-64'>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className='py-6 bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl shadow-sm hover:shadow-md transition-all duration-300'>
            <SelectValue placeholder='Chức năng' />
          </SelectTrigger>
          <SelectContent className='bg-white rounded-xl shadow-lg border-gray-200'>
            {roleOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className='cursor-pointer hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200'
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
