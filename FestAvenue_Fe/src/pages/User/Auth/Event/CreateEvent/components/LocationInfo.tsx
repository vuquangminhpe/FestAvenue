import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { MapPin, AlertTriangle } from 'lucide-react'
import { useProvinceData } from '../hooks/useProvinceData'
import { useGoongGeocoding } from '../hooks/useGoongGeocoding'
import { useWatch } from 'react-hook-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const GoongMap = lazy(() => import('@/components/custom/GoongMap/GoongMap'))
const GoongAutocomplete = lazy(() => import('@/components/custom/GoongMap/GoongAutocomplete'))

interface LocationInfoProps {
  form: UseFormReturn<EventFormData>
}

export function LocationInfo({ form }: LocationInfoProps) {
  const { provinces, selectedProvinceCode, setSelectedProvinceCode } = useProvinceData()
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  const { reverseGeocode, isLoading: isGeocodingLoading } = useGoongGeocoding()
  const coordinates = useWatch({
    control: form.control,
    name: 'location.coordinates'
  })

  const handleMapClick = async (e: { lat: number; lng: number }) => {
    // Reverse geocode to get address from coordinates FIRST
    const result = await reverseGeocode(e.lat, e.lng)

    if (result) {
      // Only update coordinates if location is valid (inside Vietnam)
      form.setValue('location.coordinates.latitude', e.lat, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
      form.setValue('location.coordinates.longitude', e.lng, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })

      // Auto-fill address details with validation options
      if (result.formatted_address) {
        form.setValue('location.address.street', result.formatted_address, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
      }

      if (result.compound?.province) {
        const province = provinces.find((p) => result.compound?.province?.includes(p.name))

        if (province) {
          form.setValue('location.address.city', province.name, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
          })
          setSelectedProvinceCode(province.code)
        } else {
          // Fallback: set directly from result
          form.setValue('location.address.city', result.compound.province, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
          })
        }
      }
    } else {
      // Location is outside Vietnam - show warning dialog
      // DO NOT update coordinates to keep map stable
      setShowWarningDialog(true)
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
    // Update coordinates with validation options
    form.setValue('location.coordinates.latitude', place.lat, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    form.setValue('location.coordinates.longitude', place.lng, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    // Update address with validation options
    form.setValue('location.address.street', place.formatted_address, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    // Update province if available
    if (place.compound?.province) {
      const province = provinces.find((p) => place.compound?.province?.includes(p.name))

      if (province) {
        form.setValue('location.address.city', province.name, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
        setSelectedProvinceCode(province.code)
      } else {
        // Fallback: set directly from result
        form.setValue('location.address.city', place.compound.province, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
      }
    }
  }

  const latitude = form.watch('location.coordinates.latitude')
  const longitude = form.watch('location.coordinates.longitude')
  const streetValue = form.watch('location.address.street')
  const streetValueSplit = streetValue.split(', ')
  const cityValue = streetValue.split(', ')[streetValueSplit.length - 1]
  // Check if location has been selected - use useMemo to ensure reactivity
  const hasSelectedLocation = useMemo(() => {
    const hasCoords = latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
    const hasAddress = streetValue && streetValue.trim().length > 0
    const hasCity = cityValue && cityValue.trim().length > 0
    return !!(hasCoords && hasAddress && hasCity)
  }, [latitude, longitude, streetValue, cityValue])

  // Memoize markerPosition to ensure stable reference
  const markerPosition = useMemo(() => {
    const lat = Number(coordinates?.latitude)
    const lng = Number(coordinates?.longitude)
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined
  }, [coordinates?.latitude, coordinates?.longitude])

  // Trigger validation when location changes
  useEffect(() => {
    if (hasSelectedLocation) {
      form.trigger('location')
    }
  }, [latitude, longitude, streetValue, cityValue, hasSelectedLocation, form])

  useEffect(() => {
    if (provinces.length > 0 && !selectedProvinceCode) {
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
      {/* Search box with autocomplete */}
      <Card className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <div className='mb-2 flex items-center gap-2 text-slate-700'>
          <MapPin className='w-5 h-5 text-blue-600' />
          <h4 className='font-semibold'>
            Tìm kiếm địa điểm <span className='text-red-500'>*</span>
          </h4>
        </div>
        <p className='text-sm text-slate-600 mb-3'>
          <strong>Bắt buộc:</strong> Gõ tên địa điểm để tự động điền thông tin và hiển thị trên bản đồ
        </p>
        <Suspense fallback={<div className='h-[42px] bg-white rounded-lg animate-pulse' />}>
          <GoongAutocomplete
            onPlaceSelect={handlePlaceSelect}
            onLocationOutsideVietnam={() => setShowWarningDialog(true)}
            placeholder='Tìm kiếm địa điểm (VD: Bitexco, Nhà hát lớn Hà Nội...)'
          />
        </Suspense>

        {/* Location Status */}
        {!hasSelectedLocation && (
          <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-700 font-medium'>⚠️ Vị trí địa chỉ không tồn tại</p>
            <p className='text-xs text-red-600 mt-1'>
              Vui lòng tìm kiếm và chọn địa điểm từ danh sách gợi ý hoặc click trên bản đồ bên dưới
            </p>
          </div>
        )}

        {hasSelectedLocation && (
          <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-sm text-green-700 font-medium'>✓ Đã chọn địa điểm</p>
            <div className='mt-2 space-y-1'>
              <p className='text-xs text-slate-700'>
                <strong>Địa chỉ:</strong> {streetValue}
              </p>
              <p className='text-xs text-slate-700'>
                <strong>Tỉnh/TP:</strong> {cityValue}
              </p>
              <p className='text-xs text-slate-600'>
                <strong>Tọa độ:</strong> {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </p>
            </div>
          </div>
        )}
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
            center={{
              lat: markerPosition?.lat ?? 10.8231,
              lng: markerPosition?.lng ?? 106.6297
            }}
            zoom={13}
            onMapClick={handleMapClick}
            markerPosition={markerPosition}
          />
        </Suspense>
      </Card>

      {/* Address Fields - Required for validation */}
      <div className='space-y-4'>
        <FormField
          control={form.control}
          name='location.address.street'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Địa chỉ đường phố <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Địa chỉ sẽ tự động điền khi chọn trên bản đồ...'
                  className='bg-white border-slate-200'
                  readOnly
                />
              </FormControl>
              <FormDescription>Địa chỉ chi tiết (tự động cập nhật từ bản đồ)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='location.address.city'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Tỉnh/Thành phố <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='Tỉnh/Thành phố sẽ tự động điền...'
                  className='bg-white border-slate-200'
                  readOnly
                />
              </FormControl>
              <FormDescription>Tỉnh/Thành phố (tự động cập nhật từ bản đồ)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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

      {/* Warning Dialog for locations outside Vietnam */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent
          className='border-4 border-red-300'
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            boxShadow: '0 20px 50px rgba(220, 38, 38, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-3 text-white text-2xl font-bold'>
              <div className='p-3 bg-white/20 rounded-full backdrop-blur-sm'>
                <AlertTriangle className='w-8 h-8 text-white' />
              </div>
              <span className='drop-shadow-lg'>Cảnh báo: Địa điểm không hợp lệ!</span>
            </AlertDialogTitle>
            <AlertDialogDescription className='text-white/95 text-base font-semibold mt-4 leading-relaxed drop-shadow-md'>
              Chúng tôi chỉ hỗ trợ các sự kiện tại Việt Nam, vui lòng sử dụng đúng mục đích, nếu không tài khoản của
              bạn sẽ bị cấm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowWarningDialog(false)}
              className='bg-white text-red-700 hover:bg-red-50 font-bold shadow-lg hover:shadow-xl transition-all'
            >
              Tôi đã hiểu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
