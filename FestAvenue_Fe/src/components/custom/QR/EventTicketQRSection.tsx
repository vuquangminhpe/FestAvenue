import React from 'react'
import { Ticket, Download, Calendar, DollarSign, User, Phone, Mail } from 'lucide-react'
import QRCode from 'react-qr-code'
import { FaTimes } from 'react-icons/fa'
import type { getPaymentForUserData } from '@/types/user.types'
import { SeatStatus } from '@/types/user.types'

interface EventTicketQRSectionProps {
  ticketData: getPaymentForUserData
  handleClose: () => void
}

const EventTicketQRSection: React.FC<EventTicketQRSectionProps> = ({ ticketData, handleClose }) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Generate QR data with eventCode, seatIndex, and email
  const getQRData = () => {
    const firstSeat = ticketData.seats[0]
    if (!firstSeat) return null

    const qrPayload = {
      eventCode: ticketData.event.eventCode,
      seatIndex: firstSeat.seatIndex,
      email: ticketData.user.email
    }

    return JSON.stringify(qrPayload)
  }

  const finalQRData = getQRData()

  const handleDownloadQR = () => {
    const svg = document.querySelector('#event-ticket-qr svg') as SVGElement
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      canvas.width = 400
      canvas.height = 400

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, 400, 400)
          ctx.drawImage(img, 0, 0, 400, 400)
        }

        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = url
        link.download = `event-ticket-${ticketData.event.eventCode}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const firstSeat = ticketData.seats[0]
  const transactionDateTime = firstSeat?.paymentTime ? formatDateTime(firstSeat.paymentTime) : { date: '', time: '' }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4'>
      <div className='bg-white rounded-2xl p-6 border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'>
              <Ticket className='h-6 w-6 text-white' />
            </div>
            <h3 className='text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
              VÉ SỰ KIỆN
            </h3>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            aria-label='Close'
          >
            <FaTimes className='text-gray-600 hover:text-gray-900 transition-colors' size={20} />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* QR Code Section */}
          <div className='lg:col-span-1'>
            <div
              className='bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 text-center shadow-inner'
              id='event-ticket-qr'
            >
              {finalQRData ? (
                <>
                  <div className='bg-white p-4 rounded-lg inline-block shadow-md'>
                    <QRCode
                      value={finalQRData}
                      size={220}
                      level='H'
                      className='mx-auto'
                      bgColor='#FFFFFF'
                      fgColor='#000000'
                    />
                  </div>
                  <div className='mt-4 p-3 bg-white rounded-lg border border-gray-200'>
                    <p className='text-xs text-gray-500 mb-1'>QR Data:</p>
                    <div className='text-xs font-mono text-gray-700 break-all max-h-20 overflow-y-auto'>
                      {JSON.parse(finalQRData).eventCode} | {JSON.parse(finalQRData).seatIndex.split('-').slice(-1)[0]}
                    </div>
                  </div>
                </>
              ) : (
                <div className='h-64 flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg'>
                  <div className='text-center'>
                    <p className='text-red-600 text-sm font-medium'>Không có dữ liệu vé</p>
                    <p className='text-red-500 text-xs mt-1'>Không thể tạo QR code</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Information */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Event Details */}
            <div className='bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200'>
              <h4 className='font-bold text-lg text-gray-800 mb-2'>{ticketData.event.eventName}</h4>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>
                  <span className='text-gray-600'>Mã sự kiện:</span>
                  <p className='font-semibold text-cyan-700'>{ticketData.event.eventCode}</p>
                </div>
              </div>
              {ticketData.event.description && (
                <p className='text-sm text-gray-600 mt-2'>{ticketData.event.description}</p>
              )}
            </div>

            {/* Transaction Info */}
            {transactionDateTime.date && (
              <div className='bg-green-50 rounded-lg p-4 border border-green-200'>
                <div className='flex items-center gap-2 text-sm font-medium text-gray-700 mb-2'>
                  <Calendar className='h-4 w-4 text-green-600' />
                  <span>Thông tin giao dịch</span>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <p className='text-sm text-gray-600'>Ngày</p>
                    <p className='font-bold text-green-600'>{transactionDateTime.date}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Giờ</p>
                    <p className='font-bold text-green-600'>{transactionDateTime.time}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seats & Amount */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='bg-purple-50 rounded-lg p-3 border border-purple-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <Ticket className='h-4 w-4 text-purple-600' />
                  <p className='text-sm font-medium text-gray-700'>Số lượng ghế</p>
                </div>
                <p className='text-2xl font-bold text-purple-600'>{ticketData.seats.length}</p>
                <div className='mt-2 flex flex-wrap gap-1'>
                  {ticketData.seats.slice(0, 5).map((seat, idx) => (
                    <span key={idx} className='text-xs bg-purple-100 px-2 py-1 rounded'>
                      {seat.ticketName}
                    </span>
                  ))}
                  {ticketData.seats.length > 5 && (
                    <span className='text-xs bg-purple-100 px-2 py-1 rounded'>+{ticketData.seats.length - 5}</span>
                  )}
                </div>
              </div>

              <div className='bg-orange-50 rounded-lg p-3 border border-orange-200'>
                <div className='flex items-center gap-2 mb-1'>
                  <DollarSign className='h-4 w-4 text-orange-600' />
                  <p className='text-sm font-medium text-gray-700'>Tổng tiền</p>
                </div>
                <p className='text-2xl font-bold text-orange-600'>{formatCurrency(ticketData.amount)}</p>
                {ticketData.event.package && (
                  <p className='text-xs text-gray-600 mt-1'>Gói: {ticketData.event.package}</p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
              <p className='text-sm font-medium text-gray-700 mb-2'>Thông tin khách hàng</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <User className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-700'>
                    {ticketData.user.firstName} {ticketData.user.lastName}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-4 w-4 text-gray-500' />
                  <span className='text-gray-700 truncate'>{ticketData.user.email}</span>
                </div>
                {ticketData.user.phone && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-700'>{ticketData.user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Refund Info if applicable */}
            {ticketData.event.refundAmount && ticketData.event.refundAmount > 0 && (
              <div className='bg-red-50 rounded-lg p-3 border border-red-200'>
                <p className='text-sm font-medium text-red-700 mb-1'>Thông tin hoàn tiền</p>
                <p className='text-lg font-bold text-red-600'>{formatCurrency(ticketData.event.refundAmount)}</p>
                {ticketData.event.refundReason && (
                  <p className='text-xs text-gray-600 mt-1'>Lý do: {ticketData.event.refundReason}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seats Details Table */}
        {ticketData.seats.length > 0 && (
          <div className='mt-6'>
            <h4 className='text-sm font-semibold text-gray-700 mb-3'>Chi tiết ghế</h4>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='bg-gray-100 border-b'>
                    <th className='text-left p-2'>#</th>
                    <th className='text-left p-2'>Vị trí</th>
                    <th className='text-left p-2'>Loại vé</th>
                    <th className='text-right p-2'>Giá ghế</th>
                    <th className='text-right p-2'>Giá vé</th>
                    <th className='text-center p-2'>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketData.seats.map((seat, index) => {
                    console.log(seat)
                    return (
                      <tr key={seat.seatIndex} className='border-b hover:bg-gray-50'>
                        <td className='p-2'>{index + 1}</td>
                        <td className='p-2 font-mono text-xs'>{seat.seatIndex.split('-').slice(-1)[0]}</td>
                        <td className='p-2 font-medium'>{seat.ticketName}</td>
                        <td className='p-2 text-right font-semibold text-cyan-600'>{formatCurrency(seat.seatPrice)}</td>
                        <td className='p-2 text-right font-semibold text-blue-600'>
                          {formatCurrency(seat.ticketPrice)}
                        </td>
                        <td className='p-2 text-center'>
                          {seat.seatStatus === SeatStatus.Scanned ? (
                            <span className='inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded'>
                              Đã quét
                            </span>
                          ) : seat.seatStatus === SeatStatus.Scannable ? (
                            <span className='inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded'>
                              Cho phép quét
                            </span>
                          ) : seat.seatStatus === SeatStatus.NotActivated ? (
                            <span className='inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded'>
                              Chưa kích hoạt
                            </span>
                          ) : (
                            <span className='inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded'>
                              Không xác định
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='mt-6 flex flex-col sm:flex-row gap-3 justify-center'>
          <button
            onClick={handleDownloadQR}
            disabled={!finalQRData}
            className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            <Download className='h-5 w-5' />
            Tải mã QR
          </button>
        </div>

        {/* Instructions */}
        <div className='mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl'>
          <div className='flex items-start gap-3'>
            <div className='p-2 bg-amber-100 rounded-lg'>
              <Ticket className='h-5 w-5 text-amber-600' />
            </div>
            <div>
              <p className='text-amber-900 text-sm font-semibold mb-1'>Hướng dẫn sử dụng</p>
              <p className='text-amber-800 text-sm'>
                Vui lòng xuất trình mã QR này tại cổng vào sự kiện để nhân viên quét và xác nhận vé của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventTicketQRSection
