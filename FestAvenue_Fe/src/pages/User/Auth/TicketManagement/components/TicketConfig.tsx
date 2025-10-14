import { useState, useEffect, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import gsap from 'gsap'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import TicketList from './TicketList'
import FilterPanel from './FilterPanel'
import AddTicketModal from './AddTicketModal'
import UpdateTicketModal from './UpdateTicketModal'
import { mockTickets } from '../mockData'
import type { Ticket, TicketFormData, TicketFilters } from '../types'

export default function TicketConfig() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [filters, setFilters] = useState<TicketFilters>({
    priceFrom: '',
    priceTo: '',
    isPublic: false,
    isSoldOut: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Load tickets from localStorage or use mock data
  useEffect(() => {
    const savedTickets = localStorage.getItem('eventTickets')
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets))
      } catch (error) {
        console.error('Failed to load tickets:', error)
        setTickets(mockTickets)
      }
    } else {
      setTickets(mockTickets)
    }
  }, [])

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('eventTickets', JSON.stringify(tickets))
    }
  }, [tickets])

  // Entrance animation
  useEffect(() => {
    gsap.fromTo('.ticket-config-content', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' })
  }, [])

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ticket) =>
          ticket.name.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.seatInfo.toLowerCase().includes(query) ||
          ticket.benefits.toLowerCase().includes(query)
      )
    }

    // Price range filter
    if (filters.priceFrom) {
      result = result.filter((ticket) => ticket.price >= Number(filters.priceFrom))
    }
    if (filters.priceTo) {
      result = result.filter((ticket) => ticket.price <= Number(filters.priceTo))
    }

    // Public filter
    if (filters.isPublic) {
      result = result.filter((ticket) => ticket.isActive)
    }

    // Sold out filter
    if (filters.isSoldOut) {
      result = result.filter((ticket) => ticket.quantity === 0)
    }

    // Sorting
    result.sort((a, b) => {
      let compareValue = 0

      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'price':
          compareValue = a.price - b.price
          break
        case 'quantity':
          compareValue = a.quantity - b.quantity
          break
        case 'createdAt':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue
    })

    return result
  }, [tickets, searchQuery, filters])

  const handleAddTicket = (data: TicketFormData) => {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      name: data.name,
      description: data.description,
      price: Number(data.price) || 0,
      quantity: Number(data.quantity) || 0,
      seatInfo: data.seatInfo,
      benefits: data.benefits,
      isActive: data.isActive,
      isPublic: data.isActive,
      isSoldOut: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTickets([...tickets, newTicket])
    toast.success('Thêm vé thành công!')

    // Animate new ticket
    setTimeout(() => {
      gsap.fromTo(
        '.ticket-list tr:last-child',
        { backgroundColor: '#ecfeff', scale: 1.02 },
        { backgroundColor: 'transparent', scale: 1, duration: 1, ease: 'power2.out' }
      )
    }, 100)
  }

  const handleUpdateTicket = (ticketId: string, data: TicketFormData) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              name: data.name,
              description: data.description,
              price: Number(data.price) || 0,
              quantity: Number(data.quantity) || 0,
              seatInfo: data.seatInfo,
              benefits: data.benefits,
              isActive: data.isActive,
              isPublic: data.isActive,
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    )
    toast.success('Cập nhật vé thành công!')
    setIsUpdateModalOpen(false)
    setSelectedTicket(null)
  }

  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vé này?')) {
      setTickets(tickets.filter((ticket) => ticket.id !== ticketId))
      toast.success('Xóa vé thành công!')
    }
  }

  const handleUpdateClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsUpdateModalOpen(true)
  }

  const handleClearFilters = () => {
    setFilters({
      priceFrom: '',
      priceTo: '',
      isPublic: false,
      isSoldOut: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setSearchQuery('')
    toast.info('Đã xóa tất cả bộ lọc')
  }

  return (
    <div className='ticket-config-content space-y-6'>
      {/* Search & Actions */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <Input
            placeholder='Search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className='bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6'
        >
          <Plus className='w-5 h-5 mr-2' />
          Add ticket
        </Button>
        <Button variant='outline' onClick={handleClearFilters} className='hover:bg-gray-50'>
          Lọc
        </Button>
      </div>

      {/* Filter Panel */}
      <FilterPanel filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />

      {/* Tickets Count */}
      <div className='flex items-center justify-between py-4'>
        <p className='text-sm text-gray-600'>
          Hiển thị <span className='font-semibold text-gray-900'>{filteredTickets.length}</span> vé
          {searchQuery && ' (đã lọc)'}
        </p>
      </div>

      {/* Ticket List */}
      <div className='ticket-list'>
        <TicketList tickets={filteredTickets} onUpdate={handleUpdateClick} onDelete={handleDeleteTicket} />
      </div>

      {/* Pagination Placeholder */}
      {filteredTickets.length > 0 && (
        <div className='flex items-center justify-center gap-2 py-6'>
          <Button variant='outline' size='sm' disabled>
            &lt;&lt; Prev
          </Button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? 'default' : 'outline'}
              size='sm'
              className={page === 1 ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
            >
              {page}
            </Button>
          ))}
          <Button variant='outline' size='sm'>
            Next &gt;&gt;
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddTicketModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddTicket} />

      <UpdateTicketModal
        isOpen={isUpdateModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedTicket(null)
        }}
        onSubmit={handleUpdateTicket}
      />
    </div>
  )
}
