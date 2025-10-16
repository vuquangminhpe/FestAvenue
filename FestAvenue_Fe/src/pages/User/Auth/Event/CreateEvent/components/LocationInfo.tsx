import { Suspense, lazy, useEffect } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { MapPin, Loader2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
import { useProvinceData } from '../hooks/useProvinceData'
import { useGoongGeocoding } from '../hooks/useGoongGeocoding'

const GoongMap = lazy(() => import('@/components/custom/GoongMap/GoongMap'))
const GoongAutocomplete = lazy(() => import('@/components/custom/GoongMap/GoongAutocomplete'))

interface LocationInfoProps {
  form: UseFormReturn<EventFormData>
}

export function LocationInfo({ form }: LocationInfoProps) {
  const { provinces, isLoadingProvinces, selectedProvinceCode, setSelectedProvinceCode } = useProvinceData()

  const { reverseGeocode, isLoading: isGeocodingLoading } = useGoongGeocoding()

  const handleMapClick = async (e: { lat: number; lng: number }) => {
    console.log('Map clicked at:', e)

    // Update coordinates immediately (with trigger to force re-render)
    form.setValue('location.coordinates.latitude', e.lat, { shouldDirty: true, shouldTouch: true })
    form.setValue('location.coordinates.longitude', e.lng, { shouldDirty: true, shouldTouch: true })

    // Reverse geocode to get address from coordinates
    const result = await reverseGeocode(e.lat, e.lng)
    console.log('Reverse geocode result:', result)

    if (result) {
      // Auto-fill address details
      if (result.formatted_address) {
        form.setValue('location.address.street', result.formatted_address)
      }
      if (result.compound?.province) {
        const province = provinces.find((p) => result.compound?.province?.includes(p.name))
        if (province) {
          form.setValue('location.address.city', province.name)
          setSelectedProvinceCode(province.code)
        }
      }
    }
  }

  const handlePlaceSelect = async (place: {
    lat: number
    lng: number
    formatted_address: string
    compound?: {
      province?: string
      district?: string
      commune?: string
    }
  }) => {
    console.log('Place selected:', place)

    // Update coordinates (with trigger to force re-render)
    form.setValue('location.coordinates.latitude', place.lat, { shouldDirty: true, shouldTouch: true })
    form.setValue('location.coordinates.longitude', place.lng, { shouldDirty: true, shouldTouch: true })

    // Update address
    form.setValue('location.address.street', place.formatted_address)

    // Update province if available
    if (place.compound?.province) {
      const province = provinces.find((p) => place.compound?.province?.includes(p.name))
      if (province) {
        form.setValue('location.address.city', province.name)
        setSelectedProvinceCode(province.code)
      }
    }
  }

  const latitude = form.watch('location.coordinates.latitude')
  const longitude = form.watch('location.coordinates.longitude')
  const cityValue = form.watch('location.address.city')
  // const streetValue = form.watch('location.address.street')

  // Debug log
  useEffect(() => {
    console.log('Coordinates changed:', { latitude, longitude })
  }, [latitude, longitude])

  // Find selected province code from city name
  const currentProvinceCode = provinces.find((p) => p.name === cityValue)?.code

  // Sync selectedProvinceCode with form value when provinces are loaded
  useEffect(() => {
    if (provinces.length > 0 && cityValue && !selectedProvinceCode) {
      const provinceCode = provinces.find((p) => p.name === cityValue)?.code
      if (provinceCode) {
        setSelectedProvinceCode(provinceCode)
      }
    }
  }, [provinces, cityValue, selectedProvinceCode, setSelectedProvinceCode])

  // // Manual geocode function (called by button click)
  // const handleManualGeocode = async () => {
  //   if (!cityValue) return

  //   const fullAddress = streetValue ? `${streetValue}, ${cityValue}` : cityValue
  //   const coords = await getCoordinatesForAddress(fullAddress)
  //   if (coords) {
  //     form.setValue('location.coordinates.latitude', coords.lat)
  //     form.setValue('location.coordinates.longitude', coords.lng)
  //   }
  // }

  return (
    <div className='space-y-6'>
      <FormField
        control={form.control}
        name='location.address.street'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Địa chỉ chi tiết <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder='Số nhà, tên đường, phường/xã, quận/huyện...'
                {...field}
                className='bg-white border-slate-200'
              />
            </FormControl>
            <FormDescription>Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Province/City Selection */}
        <FormField
          control={form.control}
          name='location.address.city'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Tỉnh/Thành phố <span className='text-red-500'>*</span>
              </FormLabel>
              <Select
                value={currentProvinceCode ? `${currentProvinceCode}|${field.value}` : ''}
                onValueChange={(value) => {
                  const provinceCode = parseInt(value.split('|')[0])
                  const provinceName = value.split('|')[1]
                  field.onChange(provinceName)
                  setSelectedProvinceCode(provinceCode)
                }}
                disabled={isLoadingProvinces}
              >
                <FormControl>
                  <SelectTrigger className='bg-white border-slate-200 w-full'>
                    <SelectValue placeholder='Chọn tỉnh/thành phố'>{field.value || 'Chọn tỉnh/thành phố'}</SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {isLoadingProvinces ? (
                      <div className='flex items-center justify-center py-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                      </div>
                    ) : (
                      provinces.map((province) => (
                        <SelectItem key={province.code} value={`${province.code}|${province.name}`}>
                          {province.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>Chọn từ 34 tỉnh/thành phố (Cải cách hành chính 2025)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country - Fixed to Vietnam */}
        <FormField
          control={form.control}
          name='location.address.country'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Quốc gia <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value='Việt Nam'
                  readOnly
                  disabled
                  className='bg-slate-100 border-slate-200 text-slate-600'
                />
              </FormControl>
              <FormDescription>Hiện tại chỉ hỗ trợ sự kiện tại Việt Nam</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Search box with autocomplete */}
      <Card className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <div className='mb-2 flex items-center gap-2 text-slate-700'>
          <MapPin className='w-5 h-5 text-blue-600' />
          <h4 className='font-semibold'>Tìm kiếm địa điểm nhanh</h4>
        </div>
        <p className='text-sm text-slate-600 mb-3'>Gõ tên địa điểm để tự động điền thông tin và hiển thị trên bản đồ</p>
        <Suspense fallback={<div className='h-[42px] bg-white rounded-lg animate-pulse' />}>
          <GoongAutocomplete
            onPlaceSelect={handlePlaceSelect}
            placeholder='Tìm kiếm địa điểm (VD: Bitexco, Nhà hát lớn Hà Nội...)'
          />
        </Suspense>
      </Card>
      {/* Map for selecting location */}
      <Card className='p-4 bg-slate-50'>
        <div className='mb-3 flex items-center gap-2 text-slate-700'>
          <MapPin className='w-5 h-5 text-blue-600' />
          <h4 className='font-semibold'>Chọn vị trí trên bản đồ</h4>
        </div>
        <p className='text-sm text-slate-600 mb-3'>
          Click vào bản đồ để chọn vị trí chính xác cho sự kiện
          {isGeocodingLoading && <span className='ml-2 text-blue-600'>(Đang cập nhật vị trí...)</span>}
        </p>
        <Suspense fallback={<div className='h-[400px] bg-slate-200 rounded-lg animate-pulse' />}>
          <GoongMap
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
