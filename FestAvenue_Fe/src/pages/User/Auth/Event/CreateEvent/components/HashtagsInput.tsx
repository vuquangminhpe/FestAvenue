import { useState } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Hash, X, Plus, Sparkles, Loader2, Tag } from 'lucide-react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import AIApis from '@/apis/AI.api'
import categoryApis from '@/apis/categories.api'
import type { resGenerateTags } from '@/types/API.types'
import { Card } from '@/components/ui/card'

interface HashtagsInputProps {
  form: UseFormReturn<EventFormData>
}

export function HashtagsInput({ form }: HashtagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [generatedData, setGeneratedData] = useState<resGenerateTags | null>(null)
  const [showGenerated, setShowGenerated] = useState(false)
  const hashtags = useWatch({ control: form.control, name: 'hashtags' }) || []

  // Fetch categories to map categoryId to category name
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApis.getCategoryActive()
  })

  const categories = categoriesData?.data || []

  // Generate tags mutation
  const generateTagsMutation = useMutation({
    mutationFn: AIApis.generateTagsInEvent,
    onSuccess: (response) => {
      if (response) {
        setGeneratedData(response)
        setShowGenerated(true)
        toast.success('Đã tạo gợi ý hashtags thành công!', {
          description: 'Chọn các hashtags phù hợp bên dưới'
        })
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo gợi ý hashtags', {
        description: 'Vui lòng thử lại sau'
      })
    }
  })

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

    form.setValue('hashtags', [...hashtags, cleanTag], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setInputValue('')
    toast.success(`Đã thêm #${cleanTag}`)
  }

  const removeHashtag = (tag: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const newHashtags = hashtags.filter((t) => t !== tag)
    form.setValue('hashtags', newHashtags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    toast.info(`Đã xóa #${tag}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addHashtag()
    }
  }

  const handleAutoGenerate = () => {
    const eventName = form.watch('name')
    const categoryId = form.watch('categoryId')
    const shortDescription = form.watch('shortDescription')
    const description = form.watch('description')

    // Validate required fields
    if (!eventName) {
      toast.error('Vui lòng nhập tên sự kiện trước')
      return
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục trước')
      return
    }
    if (!shortDescription) {
      toast.error('Vui lòng nhập mô tả ngắn trước')
      return
    }
    if (!description) {
      toast.error('Vui lòng nhập mô tả chi tiết trước')
      return
    }

    // Get category name from categoryId
    const category = categories.find((cat: any) => cat.id === categoryId)
    const categoryName = category?.name || 'General'

    // Call API to generate tags
    generateTagsMutation.mutate({
      event_name: eventName,
      category: categoryName,
      short_description: shortDescription,
      detailed_description: description,
      max_tags: 10,
      language: 'vi'
    })
  }

  const addGeneratedTag = (tag: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Remove # if exists
    const cleanTag = tag.trim().replace(/^#+/, '')

    if (hashtags.includes(cleanTag)) {
      toast.info(`#${cleanTag} đã có trong danh sách`)
      return
    }

    if (hashtags.length >= 10) {
      toast.error('Chỉ được thêm tối đa 10 hashtags')
      return
    }

    const newHashtags = [...hashtags, cleanTag]
    form.setValue('hashtags', newHashtags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    toast.success(`Đã thêm #${cleanTag}`)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between pb-4 border-b border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-purple-100 rounded-lg'>
            <Hash className='w-5 h-5 text-purple-600' />
          </div>
          <div>
            <h3 className='font-semibold text-slate-800'>Hashtags</h3>
            <p className='text-sm text-slate-600'>Thêm hashtags để giúp người dùng tìm kiếm sự kiện dễ dàng hơn</p>
          </div>
        </div>
        <Button
          type='button'
          onClick={handleAutoGenerate}
          disabled={generateTagsMutation.isPending}
          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md'
        >
          {generateTagsMutation.isPending ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4 mr-2' />
              Auto Generate
            </>
          )}
        </Button>
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
                className='bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 text-sm flex items-center gap-2 group'
              >
                <Hash className='w-3 h-3' />
                {tag}
                <button
                  type='button'
                  onClick={(e) => removeHashtag(tag, e)}
                  className='ml-1 hover:bg-red-500 hover:text-white rounded-full p-1 transition-all'
                  aria-label={`Xóa ${tag}`}
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

      {/* AI Generated Suggestions */}
      {showGenerated && generatedData && (
        <div className='space-y-4 animate-in fade-in-50 duration-500'>
          <div className='flex items-center gap-2 mb-4'>
            <Sparkles className='w-5 h-5 text-purple-600' />
            <h4 className='font-semibold text-slate-800'>Gợi ý từ AI</h4>
            <Badge variant='secondary' className='bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'>
              Mới
            </Badge>
          </div>

          <div className='grid gap-4'>
            {/* Generated Tags Section */}
            {generatedData.generated_tags && generatedData.generated_tags.length > 0 && (
              <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow'>
                <div className='p-4 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Tag className='w-4 h-4 text-blue-600' />
                    <h5 className='font-semibold text-blue-900'>Generated Tags</h5>
                    <Badge variant='outline' className='bg-blue-100 text-blue-700 border-blue-300 text-xs'>
                      {generatedData.generated_tags.length}
                    </Badge>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {generatedData.generated_tags.map((tag, index) => (
                      <Badge
                        key={`gen-${index}`}
                        onClick={(e) => addGeneratedTag(tag, e)}
                        className='bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 cursor-pointer px-3 py-1.5 transition-all hover:scale-105 active:scale-95 select-none'
                        role='button'
                        tabIndex={0}
                      >
                        <Hash className='w-3 h-3 mr-1' />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Hashtags Section */}
            {generatedData.hashtags && generatedData.hashtags.length > 0 && (
              <Card className='bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm hover:shadow-md transition-shadow'>
                <div className='p-4 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Hash className='w-4 h-4 text-purple-600' />
                    <h5 className='font-semibold text-purple-900'>Hashtags</h5>
                    <Badge variant='outline' className='bg-purple-100 text-purple-700 border-purple-300 text-xs'>
                      {generatedData.hashtags.length}
                    </Badge>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {generatedData.hashtags.map((tag, index) => (
                      <Badge
                        key={`hash-${index}`}
                        onClick={(e) => addGeneratedTag(tag, e)}
                        className='bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300 cursor-pointer px-3 py-1.5 transition-all hover:scale-105 active:scale-95 select-none'
                        role='button'
                        tabIndex={0}
                      >
                        <Hash className='w-3 h-3 mr-1' />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className='text-center'>
            <p className='text-sm text-slate-500 italic'>Click vào các tag để thêm vào danh sách hashtags của bạn</p>
          </div>
        </div>
      )}
    </div>
  )
}
