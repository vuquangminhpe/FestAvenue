import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { useQuery } from '@tanstack/react-query'
import categoryApis from '@/apis/categories.api'

interface BasicInfoProps {
  form: UseFormReturn<EventFormData>
}

export function BasicInfo({ form }: BasicInfoProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApis.getCategoryActive()
  })

  const categories = categoriesData?.data || []

  return (
    <div className='space-y-6'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Tên sự kiện <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder='Nhập tên sự kiện...'
                {...field}
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </FormControl>
            <FormDescription>Tên sự kiện sẽ hiển thị công khai</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='categoryId'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Danh mục <span className='text-red-500'>*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='bg-white border-slate-200'>
                  <SelectValue placeholder='Chọn danh mục sự kiện' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Danh mục giúp người dùng tìm kiếm sự kiện dễ dàng hơn</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='shortDescription'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Mô tả ngắn <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder='Mô tả ngắn gọn về sự kiện...'
                {...field}
                rows={3}
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none'
              />
            </FormControl>
            <FormDescription>Mô tả ngắn gọn, thu hút (10-300 ký tự)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Mô tả chi tiết <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder='Mô tả chi tiết về sự kiện, nội dung, lịch trình...'
                {...field}
                rows={8}
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none'
              />
            </FormControl>
            <FormDescription>Mô tả chi tiết về sự kiện (tối thiểu 50 ký tự)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
