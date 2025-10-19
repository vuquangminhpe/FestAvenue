import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import type { TicketFilters } from '../types'

interface FilterPanelProps {
  filters: TicketFilters
  onFiltersChange: (filters: TicketFilters) => void
  onClearFilters: () => void
}

export default function FilterPanel({ filters, onFiltersChange, onClearFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (field: keyof TicketFilters, value: any) => {
    onFiltersChange({ ...filters, [field]: value })
  }

  return (
    <Card className='bg-white border border-gray-200 shadow-sm'>
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Filter className='w-5 h-5 text-cyan-500' />
            <h3 className='text-lg font-semibold text-gray-900'>Bộ lọc nâng cao</h3>
          </div>
          <Button variant='ghost' size='sm' onClick={() => setIsExpanded(!isExpanded)} className='hover:bg-gray-100'>
            {isExpanded ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
          </Button>
        </div>

        {/* Filters */}
        {isExpanded && (
          <div className='space-y-4 animate-in slide-in-from-top-2 duration-300'>
            {/* Price Range */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>Khoảng giá vé</Label>
              <div className='grid grid-cols-2 gap-3'>
                <Input
                  type='number'
                  placeholder='Thấp nhất'
                  value={filters.priceFrom}
                  onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
                />
                <Input
                  type='number'
                  placeholder='Cao nhất'
                  value={filters.priceTo}
                  onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
                />
              </div>
            </div>

            {/* Clear Price Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                handleFilterChange('priceFrom', '')
                handleFilterChange('priceTo', '')
              }}
              className='w-full hover:bg-gray-50'
            >
              <X className='w-4 h-4 mr-2' />
              Xóa khoảng giá vé
            </Button>

            {/* Checkboxes */}
            <div className='space-y-3 pt-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isPublic'
                  checked={filters.isPublic === true}
                  onCheckedChange={(checked) => handleFilterChange('isPublic', checked ? true : null)}
                />
                <Label htmlFor='isPublic' className='text-sm text-gray-700 cursor-pointer'>
                  Chỉ hiển thị vé công khai
                </Label>
              </div>
            </div>

            {/* Sort Options */}
            <div className='grid grid-cols-2 gap-3 pt-2'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-700'>Sắp xếp theo</Label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className='w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                >
                  <option value='name'>Tên</option>
                  <option value='price'>Giá</option>
                  <option value='quantity'>Số lượng</option>
                  <option value='createdAt'>Ngày tạo</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium text-gray-700'>Thứ tự</Label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className='w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                >
                  <option value='asc'>Tăng dần</option>
                  <option value='desc'>Giảm dần</option>
                </select>
              </div>
            </div>

            {/* Clear All Filters */}
            <Button
              onClick={onClearFilters}
              variant='outline'
              className='w-full mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
            >
              <X className='w-4 h-4 mr-2' />
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
