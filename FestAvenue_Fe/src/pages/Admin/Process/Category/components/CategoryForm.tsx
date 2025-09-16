import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Upload, X, Image } from 'lucide-react'
import type { getCategoryActiveRes } from '@/types/categories.types'
import type { bodyCreateCategory, bodyUpdateCategory } from '@/types/admin.types'

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  imageUrl: z.string().url('URL hình ảnh không hợp lệ').or(z.literal('')),
  isActive: z.boolean()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: getCategoryActiveRes
  onSubmit: (data: bodyCreateCategory | bodyUpdateCategory) => void
  isLoading?: boolean
  onCancel?: () => void
  uploadImageMutation: any
}

export default function CategoryForm({ category, onSubmit, isLoading, onCancel, uploadImageMutation }: CategoryFormProps) {
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      isActive: true
    }
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive
      })
      setImagePreview(category.imageUrl)
    }
  }, [category, form])

  const handleImageUrlChange = (url: string) => {
    form.setValue('imageUrl', url)
    setImagePreview(url)
    setSelectedFile(null) // Clear file selection when URL is used
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      form.setValue('imageUrl', '') // Clear URL when file is selected
    }
  }

  const uploadFile = async (): Promise<string> => {
    if (!selectedFile) return form.getValues('imageUrl')

    try {
      const result = await uploadImageMutation.mutateAsync(selectedFile)
      return result?.data || ''
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      // Upload file if selected, otherwise use URL
      const imageUrl = await uploadFile()

      const finalData = {
        ...data,
        imageUrl: imageUrl
      }

      if (category) {
        const updateData: bodyUpdateCategory = {
          id: category.id,
          ...finalData
        }
        onSubmit(updateData)
      } else {
        const createData: bodyCreateCategory = finalData
        onSubmit(createData)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{category ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên danh mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả danh mục"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh danh mục</FormLabel>
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Tải ảnh lên
                      </Button>
                      {selectedFile && (
                        <span className="text-sm text-muted-foreground">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <hr className="flex-1" />
                      <span className="text-sm text-muted-foreground">hoặc</span>
                      <hr className="flex-1" />
                    </div>

                    {/* URL Input */}
                    <FormControl>
                      <Input
                        placeholder="Nhập URL hình ảnh"
                        {...field}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                    </FormControl>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview('')}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            handleImageUrlChange('')
                            setSelectedFile(null)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* No Image Placeholder */}
                    {!imagePreview && (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Image className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-xs">Không có ảnh</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái hoạt động</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Bật/tắt để cho phép danh mục hiển thị
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading || uploadImageMutation.isPending}
                className="flex-1"
              >
                {(isLoading || uploadImageMutation.isPending) ? 'Đang xử lý...' : (category ? 'Cập nhật' : 'Tạo mới')}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Hủy
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}