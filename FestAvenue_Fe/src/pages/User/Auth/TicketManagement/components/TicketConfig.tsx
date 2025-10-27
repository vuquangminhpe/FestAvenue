import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Search, Plus, Loader2 } from 'lucide-react'
import gsap from 'gsap'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TicketList from './TicketList'
import FilterPanel from './FilterPanel'
import AddTicketModal from './AddTicketModal'
import UpdateTicketModal from './UpdateTicketModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import type { Ticket, TicketFilters } from '../types'
import { useGetTickets, useDeleteTicket } from '../hooks/useTicketManagement'
import { getIdFromNameId } from '@/utils/utils'
import type { TicketSearchRequest } from '@/types/serviceTicketManagement.types'

export default function TicketConfig() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)
  const [pageIndex, setPageIndex] = useState(1)
  const [filters, setFilters] = useState<TicketFilters>({
    priceFrom: '',
    priceTo: '',
    isPublic: true,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Build search request
  const searchRequest: TicketSearchRequest = useMemo(
    () => ({
      search: searchQuery,
      // createdFromDate: '',
      // createdToDate: '',
      eventCode: eventCode,
      isPublic: filters.isPublic ?? false,
      minPrice: filters.priceFrom ? Number(filters.priceFrom) : 0,
      maxPrice: filters.priceTo ? Number(filters.priceTo) : 999999999,
      pagination: {
        // orderBy: filters.sortBy,
        pageIndex: pageIndex,
        isPaging: true,
        pageSize: 10
      }
    }),
    [searchQuery, eventCode, filters, pageIndex]
  )

  // Fetch tickets
  const { data: ticketsData, isLoading, isFetching } = useGetTickets(eventCode, searchRequest)
  const deleteTicketMutation = useDeleteTicket()

  const tickets = ticketsData?.data?.result || []

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      '.ticket-config-content',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
    )
  }, [])

  const handleDeleteTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (ticket) {
      setTicketToDelete(ticket)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    if (ticketToDelete) {
      deleteTicketMutation.mutate(ticketToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setTicketToDelete(null)
        }
      })
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setTicketToDelete(null)
  }

  const handleUpdateClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsUpdateModalOpen(true)
  }

  const handleClearFilters = () => {
    setFilters({
      priceFrom: '',
      priceTo: '',
      isPublic: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setSearchQuery('')
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false)
    setSelectedTicket(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='ticket-config-content flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
          <span className='text-gray-600 font-medium'>Đang tải danh sách vé...</span>
        </div>
      </div>
    )
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
          Tạo mới vé
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
          Hiển thị <span className='font-semibold text-gray-900'>{tickets.length}</span> vé
          {searchQuery && ' (đã lọc)'}
        </p>
        {isFetching && <Loader2 className='w-4 h-4 animate-spin text-cyan-400' />}
      </div>

      {/* Ticket List */}
      <div className='ticket-list'>
        <TicketList tickets={tickets} onUpdate={handleUpdateClick} onDelete={handleDeleteTicket} />
      </div>

      {/* Pagination Placeholder */}
      {tickets.length > 0 && (
        <div className='flex items-center justify-center gap-2 py-6'>
          <Button variant='outline' size='sm' disabled={pageIndex === 1} onClick={() => setPageIndex(pageIndex - 1)}>
            &lt;&lt; Prev
          </Button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
            <Button
              key={page}
              variant={page === pageIndex ? 'default' : 'outline'}
              size='sm'
              className={page === pageIndex ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
              onClick={() => setPageIndex(page)}
            >
              {page}
            </Button>
          ))}
          <Button variant='outline' size='sm' onClick={() => setPageIndex(pageIndex + 1)}>
            Next &gt;&gt;
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddTicketModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} eventCode={eventCode} />

      <UpdateTicketModal
        isOpen={isUpdateModalOpen}
        ticket={selectedTicket}
        eventCode={eventCode}
        onClose={handleCloseUpdateModal}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        ticket={ticketToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteTicketMutation.isPending}
      />
    </div>
  )
}
