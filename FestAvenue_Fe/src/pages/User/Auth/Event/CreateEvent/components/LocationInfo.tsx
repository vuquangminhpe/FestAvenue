import { Suspense, lazy } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { MapPin } from 'lucide-react'

const LeafletMap = lazy(() => import('@/components/custom/MapLeaflet/MapLeadflet'))

interface LocationInfoProps {
  form: UseFormReturn<EventFormData>
}

export function LocationInfo({ form }: LocationInfoProps) {
  const handleMapClick = (e: { lat: number; lng: number }) => {
    form.setValue('location.coordinates.latitude', e.lat)
    form.setValue('location.coordinates.longitude', e.lng)
  }

  const latitude = form.watch('location.coordinates.latitude')
  const longitude = form.watch('location.coordinates.longitude')

  return (
    <div className='space-y-6'>
      <FormField
        control={form.control}
        name='location.address.street'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Địa chỉ <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder='Số nhà, tên đường...' {...field} className='bg-white border-slate-200' />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='location.address.city'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Thành phố <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Thành phố/Tỉnh' {...field} className='bg-white border-slate-200' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='location.address.country'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Quốc gia <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Quốc gia' {...field} className='bg-white border-slate-200' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Map for selecting location */}
      <Card className='p-4 bg-slate-50'>
        <div className='mb-3 flex items-center gap-2 text-slate-700'>
          <MapPin className='w-5 h-5 text-blue-600' />
          <h4 className='font-semibold'>Chọn vị trí trên bản đồ</h4>
        </div>
        <p className='text-sm text-slate-600 mb-3'>Click vào bản đồ để chọn vị trí chính xác cho sự kiện</p>
        <Suspense fallback={<div className='h-[300px] bg-slate-200 rounded-lg animate-pulse' />}>
          <LeafletMap
            center={{ lat: latitude || 10.8231, lng: longitude || 106.6297 }}
            zoom={13}
            onMapClick={handleMapClick}
            markerPosition={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
          />
        </Suspense>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='location.coordinates.latitude'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>Vĩ độ</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='10.8231'
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='bg-white border-slate-200'
                  readOnly
                />
              </FormControl>
              <FormDescription>Tọa độ vĩ độ (tự động cập nhật khi chọn trên bản đồ)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='location.coordinates.longitude'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>Kinh độ</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.000001'
                  placeholder='106.6297'
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='bg-white border-slate-200'
                  readOnly
                />
              </FormControl>
              <FormDescription>Tọa độ kinh độ (tự động cập nhật khi chọn trên bản đồ)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
