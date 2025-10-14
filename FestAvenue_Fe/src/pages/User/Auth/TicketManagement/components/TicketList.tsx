import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Ticket } from '../types'

interface TicketListProps {
  tickets: Ticket[]
  onUpdate: (ticket: Ticket) => void
  onDelete: (ticketId: string) => void
}

export default function TicketList({ tickets, onUpdate, onDelete }: TicketListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  if (tickets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
        <p className='text-lg mb-2'>Chưa có vé nào</p>
        <p className='text-sm'>Nhấn "Add ticket" để tạo vé mới</p>
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-gray-50 hover:bg-gray-50'>
            <TableHead className='w-12 text-center font-semibold'>STT</TableHead>
            <TableHead className='font-semibold'>ID</TableHead>
            <TableHead className='font-semibold'>Tên vé</TableHead>
            <TableHead className='font-semibold'>Mô tả thông tin vé</TableHead>
            <TableHead className='font-semibold'>Thông tin ghế ngồi</TableHead>
            <TableHead className='font-semibold text-right'>Giá</TableHead>
            <TableHead className='font-semibold text-center'>Số lượng</TableHead>
            <TableHead className='font-semibold'>Quyền lợi</TableHead>
            <TableHead className='font-semibold text-center'>Công khai</TableHead>
            <TableHead className='font-semibold text-center w-32'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket, index) => (
            <TableRow key={ticket.id} className='hover:bg-gray-50 transition-colors'>
              <TableCell className='text-center font-medium text-gray-600'>{index + 1}</TableCell>
              <TableCell className='font-mono text-xs text-gray-500'>{ticket.id.substring(0, 8)}...</TableCell>
              <TableCell className='font-medium text-gray-900'>{ticket.name}</TableCell>
              <TableCell className='max-w-xs'>
                <p className='text-sm text-gray-600 line-clamp-2'>{ticket.description}</p>
              </TableCell>
              <TableCell className='text-sm text-gray-700'>{ticket.seatInfo}</TableCell>
              <TableCell className='text-right font-semibold text-cyan-600'>{formatPrice(ticket.price)}</TableCell>
              <TableCell className='text-center'>
                <Badge variant={ticket.quantity > 20 ? 'default' : ticket.quantity > 0 ? 'secondary' : 'destructive'}>
                  {ticket.quantity}
                </Badge>
              </TableCell>
              <TableCell className='max-w-xs'>
                <p className='text-sm text-gray-600 line-clamp-2'>{ticket.benefits}</p>
              </TableCell>
              <TableCell className='text-center'>
                <Badge variant={ticket.isActive ? 'default' : 'secondary'} className={ticket.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                  {ticket.isActive ? 'Bật' : 'Tắt'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className='flex flex-col gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onUpdate(ticket)}
                    className='w-full hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300 transition-colors'
                  >
                    Update
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onDelete(ticket.id)}
                    className='w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors'
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
