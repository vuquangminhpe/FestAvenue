import type { UseFormReturn } from 'react-hook-form'
import { Mail, Phone, MapPin, Check, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import LeafletMap from '@/components/custom/MapLeaflet'
import { cn } from '@/lib/utils'
import type { FormData, MapCenter } from '../../types'

interface AddressContactProps {
  form: UseFormReturn<FormData>
  mapCenter: MapCenter
  mapZoom: number
  onMapClick: ({ lat, lng }: { lat: number; lng: number }) => void
  onCheckLocation: () => void
  isLocationChecked: boolean
  isCheckingLocation: boolean
}

export function AddressContact({
  form,
  mapCenter,
  mapZoom,
  onMapClick,
  onCheckLocation,
  isLocationChecked,
  isCheckingLocation
}: AddressContactProps) {
  return (
    <div className='space-y-6'>
      {/* Contact Info */}
      <div className='grid md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                <Mail className='w-4 h-4' />
                Email liên hệ *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='email'
                  placeholder='contact@company.com'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                <Phone className='w-4 h-4' />
                Số điện thoại *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='0123456789'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='fax'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Fax (tùy chọn)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='0123456789'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
          <MapPin className='w-5 h-5' />
          Địa chỉ
        </h3>

        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='street'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel className='text-slate-700 font-medium'>Địa chỉ *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='123 Đường ABC, Phường XYZ'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 font-medium'>Thành phố *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Hà Nội'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 font-medium'>Tỉnh/Bang *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Hà Nội'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='postalCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 font-medium'>Mã bưu điện *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='100000'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 font-medium'>Quốc gia *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Việt Nam'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Map */}
        <div className='mt-6'>
          <label className='text-sm font-medium text-slate-700 mb-3 block'>Chọn vị trí trên bản đồ (tùy chọn)</label>

          {/* Coordinate Inputs */}
          <div className='grid md:grid-cols-2 gap-4 mb-4'>
            <FormField
              control={form.control}
              name='latitude'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-700 font-medium'>Vĩ độ (Latitude)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='21.0285'
                      className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                      onChange={(e) => {
                        field.onChange(e)
                        const lat = parseFloat(e.target.value)
                        const lng = parseFloat(form.getValues('longitude') || '0')
                        if (!isNaN(lat) && !isNaN(lng)) {
                          onMapClick({ lat, lng })
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='longitude'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-700 font-medium'>Kinh độ (Longitude)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='105.8542'
                      className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                      onChange={(e) => {
                        field.onChange(e)
                        const lng = parseFloat(e.target.value)
                        const lat = parseFloat(form.getValues('latitude') || '0')
                        if (!isNaN(lat) && !isNaN(lng)) {
                          onMapClick({ lat, lng })
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location Check Button */}
          <div className='flex items-center gap-4 mb-4'>
            <Button
              type='button'
              onClick={onCheckLocation}
              disabled={isCheckingLocation}
              variant={isLocationChecked ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-2',
                isLocationChecked
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                  : 'border-cyan-400 text-cyan-600 hover:bg-cyan-50'
              )}
            >
              {isCheckingLocation ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Đang kiểm tra...
                </>
              ) : isLocationChecked ? (
                <>
                  <Check className='w-4 h-4' />
                  Vị trí đã được kiểm tra
                </>
              ) : (
                <>
                  <MapPin className='w-4 h-4' />
                  Kiểm tra vị trí
                </>
              )}
            </Button>

            {isLocationChecked && (
              <div className='text-sm text-green-600 flex items-center gap-2'>
                <Check className='w-4 h-4' />
                Vị trí hợp lệ, bạn có thể tiếp tục
              </div>
            )}
          </div>

          <div className='h-[300px] rounded-lg overflow-hidden border border-slate-200 shadow-sm'>
            <LeafletMap
              center={mapCenter}
              zoom={mapZoom}
              onMapClick={onMapClick}
              markerPosition={
                form.watch('latitude') && form.watch('longitude')
                  ? {
                      lat: parseFloat(form.watch('latitude') || '0'),
                      lng: parseFloat(form.watch('longitude') || '0')
                    }
                  : undefined
              }
            />
          </div>
          <p className='text-sm text-slate-500 mt-2'>
            Nhấp vào bản đồ để chọn vị trí chính xác của tổ chức hoặc nhập tọa độ trực tiếp. Sau khi nhập tọa độ, vui
            lòng bấm "Kiểm tra vị trí" để xác nhận.
          </p>
        </div>
      </div>
    </div>
  )
}
