import React from 'react'
import { Ticket, Download, MapPin, Clock, User, Phone } from 'lucide-react'
import QRCode from 'react-qr-code'
import { FaTimes } from 'react-icons/fa'

interface TicketQRSectionProps {
  qrData: string
  ticketCode: string
  bookingData: {
    movie?: {
      title: string
      poster_url?: string
    }
    theater?: {
      name: string
      location: string
    }
    screen?: {
      name: string
    }
    showtime?: {
      start_time: string
    }
    seats: Array<{
      row: string
      number: number
    }>
    total_amount: number
    user?: {
      full_name?: string
      phone?: string
    }
  }
  handleClose: () => void
}

const TicketQRSection: React.FC<TicketQRSectionProps> = ({ qrData, ticketCode, bookingData, handleClose }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatSeats = (seats: Array<{ row: string; number: number }>) => {
    return seats.map((seat) => `${seat.row}${seat.number}`).join(', ')
  }

  // SIMPLIFIED: Chỉ sử dụng ticket_code trong QR
  const getQRData = () => {
    // Ưu tiên ticketCode trước
    if (ticketCode && ticketCode.trim()) {
      return ticketCode.trim()
    }

    // Fallback: sử dụng qrData nếu có
    if (qrData && qrData.trim()) {
      return qrData.trim()
    }

    // Error case
    console.error('No ticket code available for QR generation')
    return null
  }

  // Simple validation - chỉ cần kiểm tra có giá trị hay không
  const finalQRData = getQRData()

  const handleDownloadQR = () => {
    const svg = document.querySelector('#ticket-qr svg') as SVGElement
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      // FIX 4: Tăng size canvas để QR rõ hơn
      canvas.width = 400
      canvas.height = 400

      img.onload = () => {
        if (ctx) {
          // Vẽ background trắng trước
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, 400, 400)

          // Vẽ QR code
          ctx.drawImage(img, 0, 0, 400, 400)
        }

        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = url
        link.download = `ticket-${ticketCode || 'qr'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const showtime = bookingData.showtime ? formatDateTime(bookingData.showtime.start_time) : null

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200 w-full max-w-4xl mx-auto shadow-lg'>
      <div className='flex justify-end text-black '>
        <FaTimes onClick={() => handleClose()} className='hover:scale-150 transition-all duration-300 cursor-pointer' />
      </div>

      <div className='flex items-center justify-center gap-2 mb-6'>
        <Ticket className='h-6 w-6 text-blue-600' />
        <h3 className='text-xl font-bold text-gray-800'>QR CODE</h3>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Movie Poster Section */}
        {bookingData.movie?.poster_url && (
          <div className='lg:col-span-1'>
            <div className='bg-gray-50 p-3 rounded-lg'>
              <p className='text-sm font-medium text-gray-700 mb-2 text-center'>Poster</p>
              <div className='relative group'>
                <img
                  src={bookingData.movie.poster_url}
                  alt={bookingData.movie.title}
                  className='w-full h-48 lg:h-60 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg'></div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Section - Simplified */}
        <div className={`${bookingData.movie?.poster_url ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <div className='bg-gray-50 p-4 rounded-lg text-center' id='ticket-qr'>
            {finalQRData ? (
              <>
                <QRCode
                  value={finalQRData}
                  size={160}
                  level='L' // Low error correction = dễ tạo nhất
                  className='mx-auto'
                  bgColor='#FFFFFF' // Background trắng
                  fgColor='#000000' // Foreground đen
                />
                <p className='text-sm text-gray-600 mt-2 font-mono'>{finalQRData}</p>

                {/* Simple debug info */}
                <div className='mt-2 text-xs text-gray-400 border-t pt-2'>
                  <p>Ticket Code: {finalQRData}</p>
                </div>
              </>
            ) : (
              <div className='h-40 flex items-center justify-center bg-red-50 border border-red-200 rounded'>
                <div className='text-center'>
                  <p className='text-red-600 text-sm font-medium'>No Ticket Code</p>
                  <p className='text-red-500 text-xs mt-1'>Không thể tạo QR code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Information */}
        <div className={`${bookingData.movie?.poster_url ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {/* Movie & Theater */}
          <div className='bg-blue-50 rounded-lg p-4'>
            <h4 className='font-semibold text-gray-800 mb-2'>{bookingData.movie?.title}</h4>
            <div className='flex items-center gap-2 text-sm text-gray-600 mb-1'>
              <MapPin className='h-4 w-4' />
              <span>{bookingData.theater?.name}</span>
            </div>
            <p className='text-xs text-gray-500 ml-6'>{bookingData.theater?.location}</p>
          </div>

          {/* Showtime & Screen */}
          {showtime && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='bg-green-50 rounded-lg p-3'>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-1'>
                  <Clock className='h-4 w-4 text-green-600' />
                  <span>Show times</span>
                </div>
                <p className='text-sm text-gray-800'>{showtime.date}</p>
                <p className='text-lg font-bold text-green-600'>{showtime.time}</p>
              </div>
            </div>
          )}

          {/* Seats & Amount */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='bg-orange-50 rounded-lg p-3'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Seat</p>
              <p className='text-lg font-bold text-orange-600'>{formatSeats(bookingData.seats)}</p>
            </div>
            <div className='bg-red-50 rounded-lg p-3'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Total</p>
              <p className='text-xl font-bold text-red-600'>{bookingData.total_amount.toLocaleString('vi-VN')} ₫</p>
            </div>
          </div>

          {/* Customer Info */}
          {(bookingData.user?.full_name || bookingData.user?.phone) && (
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='text-sm font-medium text-gray-700 mb-2'>Customer information</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {bookingData.user?.full_name && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-700'>{bookingData.user.full_name}</span>
                  </div>
                )}
                {bookingData.user?.phone && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-700'>{bookingData.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Button */}
      <div className='mt-6 flex justify-center'>
        <button
          onClick={handleDownloadQR}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
        >
          <Download className='h-4 w-4' />
          Download QR Code
        </button>
      </div>

      {/* Instructions */}
      <div className='mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
        <p className='text-amber-800 text-xs font-medium mb-1'>User manual</p>
        <p className='text-amber-700 text-xs'>
          Show this QR code to the staff at the cinema to scan and enter to watch the movie.
        </p>
      </div>
    </div>
  )
}

export default TicketQRSection
