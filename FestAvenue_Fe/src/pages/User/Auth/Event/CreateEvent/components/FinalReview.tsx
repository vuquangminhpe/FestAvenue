import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { visibilityOptions } from '../constants'
import { Calendar, MapPin, Users, Mail, Phone, Globe } from 'lucide-react'
import { Suspense, lazy } from 'react'

const VideoHLSPlayer = lazy(() => import('@/components/custom/VideoHLSPlayer/VideoHLSPlayer'))

interface FinalReviewProps {
  form: UseFormReturn<EventFormData>
}

export function FinalReview({ form }: FinalReviewProps) {
  const values = form.getValues()

  const visibility = visibilityOptions.find((opt) => opt.value === values.visibility)

  return (
    <div className='space-y-6'>
      <Card className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50'>
        <h3 className='text-lg font-semibold text-slate-800 mb-4'>Xem lại thông tin sự kiện</h3>

        <div className='space-y-4'>
          {/* Basic Info */}
          <div>
            <h4 className='font-semibold text-slate-700 mb-2'>Thông tin cơ bản</h4>
            <div className='bg-white p-4 rounded-lg space-y-2'>
              <p className='text-lg font-bold text-slate-800'>{values.name}</p>
              <p className='text-sm text-slate-600'>{values.shortDescription}</p>
              <div className='flex gap-2 flex-wrap mt-2'>
                <Badge variant='outline'>{visibility?.label}</Badge>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h4 className='font-semibold text-slate-700 mb-2 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              Thời gian
            </h4>
            <div className='bg-white p-4 rounded-lg space-y-2'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-slate-500'>Bắt đầu:</span>
                  <p className='font-medium'>
                    {values.startDate ? format(new Date(values.startDate), 'PPP', { locale: vi }) : 'Chưa chọn'}
                  </p>
                </div>
                <div>
                  <span className='text-slate-500'>Kết thúc:</span>
                  <p className='font-medium'>
                    {values.endDate ? format(new Date(values.endDate), 'PPP', { locale: vi }) : 'Chưa chọn'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className='font-semibold text-slate-700 mb-2 flex items-center gap-2'>
              <MapPin className='w-4 h-4' />
              Địa điểm
            </h4>
            <div className='bg-white p-4 rounded-lg'>
              <p className='text-sm'>
                {values.location.address.street}, {values.location.address.city}, {values.location.address.country}
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <h4 className='font-semibold text-slate-700 mb-2 flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Sức chứa
            </h4>
            <div className='bg-white p-4 rounded-lg'>
              <p className='text-lg font-bold text-blue-600'>{values.capacity.toLocaleString()} người</p>
            </div>
          </div>

          {/* Contact */}
          {(values.publicContactEmail || values.publicContactPhone || values.website) && (
            <div>
              <h4 className='font-semibold text-slate-700 mb-2'>Thông tin liên hệ</h4>
              <div className='bg-white p-4 rounded-lg space-y-2 text-sm'>
                {values.publicContactEmail && (
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-slate-400' />
                    <span>{values.publicContactEmail}</span>
                  </div>
                )}
                {values.publicContactPhone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-slate-400' />
                    <span>{values.publicContactPhone}</span>
                  </div>
                )}
                {values.website && (
                  <div className='flex items-center gap-2'>
                    <Globe className='w-4 h-4 text-slate-400' />
                    <span>{values.website}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media */}
          <div>
            <h4 className='font-semibold text-slate-700 mb-2'>Hình ảnh & Video</h4>
            <div className='bg-white p-4 rounded-lg'>
              <div className='grid grid-cols-3 gap-4'>
                {values.logoUrl && (
                  <div>
                    <p className='text-xs text-slate-500 mb-1'>Logo</p>
                    <img src={values.logoUrl} alt='Logo' className='w-full h-20 object-contain rounded' />
                  </div>
                )}
                {values.bannerUrl && (
                  <div>
                    <p className='text-xs text-slate-500 mb-1'>Banner</p>
                    <img src={values.bannerUrl} alt='Banner' className='w-full h-20 object-cover rounded' />
                  </div>
                )}
                {values.trailerUrl && (
                  <div>
                    <p className='text-xs text-slate-500 mb-1'>Trailer</p>
                    {values.trailerUrl.includes('.m3u8') ? (
                      <div className='w-full h-32 rounded overflow-hidden bg-black'>
                        <Suspense fallback={<div className='w-full h-32 bg-slate-200 animate-pulse' />}>
                          <VideoHLSPlayer src={values.trailerUrl} classNames='w-full h-full' />
                        </Suspense>
                      </div>
                    ) : (
                      <video src={values.trailerUrl} controls className='w-full h-32 object-cover rounded' />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className='p-6 bg-yellow-50 border-yellow-200'>
        <h4 className='font-semibold text-yellow-800 mb-2'>Lưu ý</h4>
        <ul className='text-sm text-yellow-700 space-y-1 list-disc list-inside'>
          <li>Sự kiện sẽ được gửi đến staff để kiểm duyệt</li>
          <li>Thời gian xét duyệt thường từ 1-3 ngày làm việc</li>
          <li>Bạn sẽ nhận được thông báo khi sự kiện được phê duyệt hoặc từ chối</li>
          <li>Tất cả hình ảnh và video đã được kiểm tra bởi AI</li>
        </ul>
      </Card>
    </div>
  )
}
