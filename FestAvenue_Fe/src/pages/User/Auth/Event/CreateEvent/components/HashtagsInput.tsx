import { useState } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Hash, X, Plus } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { toast } from 'sonner'

interface HashtagsInputProps {
  form: UseFormReturn<EventFormData>
}

export function HashtagsInput({ form }: HashtagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const hashtags = form.watch('hashtags') || []

  const addHashtag = () => {
    if (!inputValue.trim()) {
      toast.error('Vui lòng nhập hashtag')
      return
    }

    // Remove # if user typed it
    const cleanTag = inputValue.trim().replace(/^#+/, '')

    if (cleanTag.length < 2) {
      toast.error('Hashtag phải có ít nhất 2 ký tự')
      return
    }

    if (cleanTag.length > 30) {
      toast.error('Hashtag không được quá 30 ký tự')
      return
    }

    if (hashtags.includes(cleanTag)) {
      toast.error('Hashtag này đã tồn tại')
      return
    }

    if (hashtags.length >= 10) {
      toast.error('Chỉ được thêm tối đa 10 hashtags')
      return
    }

    form.setValue('hashtags', [...hashtags, cleanTag])
    setInputValue('')
    toast.success(`Đã thêm #${cleanTag}`)
  }

  const removeHashtag = (tag: string) => {
    form.setValue(
      'hashtags',
      hashtags.filter((t) => t !== tag)
    )
    toast.info(`Đã xóa #${tag}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag()
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 pb-4 border-b border-slate-200'>
        <div className='p-2 bg-purple-100 rounded-lg'>
          <Hash className='w-5 h-5 text-purple-600' />
        </div>
        <div>
          <h3 className='font-semibold text-slate-800'>Hashtags</h3>
          <p className='text-sm text-slate-600'>Thêm hashtags để giúp người dùng tìm kiếm sự kiện dễ dàng hơn</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name='hashtags'
        render={() => (
          <FormItem>
            <FormLabel className='text-slate-700'>Thêm hashtags (tùy chọn)</FormLabel>
            <FormControl>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Hash className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='VD: festival, music, concert...'
                    className='border-slate-300 focus:border-purple-500 pl-10'
                    maxLength={30}
                  />
                </div>
                <Button
                  type='button'
                  onClick={addHashtag}
                  variant='outline'
                  className='border-purple-300 text-purple-600 hover:bg-purple-50'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Thêm
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              Nhập hashtag và nhấn Enter hoặc nút Thêm. Tối đa 10 hashtags, mỗi hashtag dưới 30 ký tự.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Display Hashtags */}
      {hashtags.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-slate-700'>Hashtags đã thêm ({hashtags.length}/10):</p>
          <div className='flex flex-wrap gap-2'>
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                variant='secondary'
                className='bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 text-sm flex items-center gap-2'
              >
                <Hash className='w-3 h-3' />
                {tag}
                <button
                  type='button'
                  onClick={() => removeHashtag(tag)}
                  className='ml-1 hover:bg-purple-300 rounded-full p-0.5 transition-colors'
                >
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hashtags.length === 0 && (
        <div className='text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200'>
          <Hash className='w-12 h-12 text-slate-400 mx-auto mb-2' />
          <p className='text-sm text-slate-500'>Chưa có hashtag nào. Hãy thêm hashtag để tăng khả năng tìm kiếm!</p>
        </div>
      )}
    </div>
  )
}
