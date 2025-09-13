import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { FormField, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import type { FormData } from '../../types'

interface SubscriptionFinalProps {
  form: UseFormReturn<FormData>
  dataPackage: any[]
}

export function SubscriptionFinal({ form, dataPackage }: SubscriptionFinalProps) {
  return (
    <div className='space-y-6'>
      <div className='grid md:grid-cols-3 gap-6'>
        {dataPackage?.map((packageItem: any) => (
          <div
            key={packageItem.id}
            className={cn(
              'relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg',
              form.watch('plan') === packageItem.id
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg scale-105'
                : 'border-slate-200 bg-white hover:border-cyan-300'
            )}
            onClick={() => form.setValue('plan', packageItem.id)}
          >
            {packageItem.type === 'Phổ biến' && (
              <Badge className='absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white'>
                {packageItem.type}
              </Badge>
            )}

            <div className='text-center'>
              <h4 className='text-lg font-semibold text-slate-800 mb-2'>{packageItem.name}</h4>
              <div className='text-2xl font-bold text-cyan-600 mb-4'>
                {packageItem.price === 0
                  ? 'Miễn phí'
                  : `${packageItem.price.toLocaleString('vi-VN')} VNĐ/${packageItem.durationMonth} tháng`}
              </div>

              <div className='text-sm text-slate-600 space-y-2'>
                <div className='space-y-1'>
                  {packageItem.features.map((feature: any, index: any) => (
                    <div key={index}>✓ {feature}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )) || <div className='col-span-3 text-center text-slate-500'>Đang tải gói dịch vụ...</div>}
      </div>

      <FormField control={form.control} name='plan' render={() => <FormMessage />} />

      {/* Summary */}
      <div className='mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200'>
        <h4 className='text-lg font-semibold text-slate-800 mb-4'>Tóm tắt thông tin</h4>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium text-slate-700'>Tên tổ chức:</span>
            <span className='ml-2 text-slate-600'>{form.watch('name') || 'Chưa nhập'}</span>
          </div>
          <div>
            <span className='font-medium text-slate-700'>Ngành nghề:</span>
            <span className='ml-2 text-slate-600'>{form.watch('industry') || 'Chưa chọn'}</span>
          </div>
          <div>
            <span className='font-medium text-slate-700'>Email:</span>
            <span className='ml-2 text-slate-600'>{form.watch('email') || 'Chưa nhập'}</span>
          </div>
          <div>
            <span className='font-medium text-slate-700'>Gói dịch vụ:</span>
            <span className='ml-2 text-slate-600'>
              {dataPackage?.find((p: any) => p.id === form.watch('plan'))?.name || 'Chưa chọn'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
