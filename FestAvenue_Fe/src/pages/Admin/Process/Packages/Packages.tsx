import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { gsap } from 'gsap'
import {
  Plus,
  Edit,
  Package,
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  Save
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import packageApis from '@/apis/package.api'
import type { bodyCreatePackage, getPackageByStatusRes } from '@/types/package.types'

const packageSchema = z.object({
  name: z.string().min(1, 'Tên gói là bắt buộc'),
  type: z.string().min(1, 'Loại gói là bắt buộc'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  durationMonth: z.number().min(1, 'Thời hạn phải ít nhất 1 tháng'),
  features: z.array(z.string()).min(1, 'Phải có ít nhất 1 tính năng'),
  isActive: z.boolean()
})

type PackageFormData = z.infer<typeof packageSchema>

const packageTypes = [
  { value: 'basic', label: 'Cơ bản' },
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'premium', label: 'Cao cấp' },
  { value: 'enterprise', label: 'Doanh nghiệp' }
]

export default function Packages() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<getPackageByStatusRes | null>(null)
  const [featureInput, setFeatureInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      type: '',
      price: 0,
      durationMonth: 1,
      features: [],
      isActive: true
    }
  })

  // Queries
  const packagesQuery = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: 'all' })
  })

  // Mutations
  const createPackageMutation = useMutation({
    mutationFn: packageApis.createPackageForAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Tạo gói thành công!')
      setIsFormOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo gói')
    }
  })

  const updatePackageMutation = useMutation({
    mutationFn: packageApis.updatePackageForAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Cập nhật gói thành công!')
      setIsFormOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật gói')
    }
  })

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    }
  }, [])

  const resetForm = () => {
    form.reset()
    setEditingPackage(null)
    setFeatureInput('')
  }

  const handleCreate = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleEdit = (pkg: getPackageByStatusRes) => {
    setEditingPackage(pkg)
    form.setValue('name', pkg.name)
    form.setValue('type', pkg.type)
    form.setValue('price', pkg.price)
    form.setValue('durationMonth', pkg.durationMonth)
    form.setValue('features', pkg.features)
    form.setValue('isActive', pkg.isActive)
    setIsFormOpen(true)
  }

  const handleToggleStatus = async (pkg: getPackageByStatusRes) => {
    try {
      await updatePackageMutation.mutateAsync({
        id: pkg.id,
        isActive: !pkg.isActive
      })
    } catch (error) {
      console.error('Toggle status error:', error)
    }
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues('features')
      form.setValue('features', [...currentFeatures, featureInput.trim()])
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features')
    form.setValue(
      'features',
      currentFeatures.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = async (data: PackageFormData) => {
    try {
      if (editingPackage) {
        await updatePackageMutation.mutateAsync({
          id: editingPackage.id,
          isActive: data.isActive
        })
      } else {
        await createPackageMutation.mutateAsync(data as bodyCreatePackage)
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    return packageTypes.find((t) => t.value === type)?.label || type
  }

  return (
    <div ref={containerRef} className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Quản lý gói dịch vụ</h1>
          <p className='text-muted-foreground'>Tạo và quản lý các gói dịch vụ cho hệ thống</p>
        </div>
        <Button onClick={handleCreate} className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Tạo gói mới
        </Button>
      </div>

      {/* Package List */}
      {packagesQuery.isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-20 bg-gray-200 rounded'></div>
                  <div className='h-10 bg-gray-200 rounded'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {(packagesQuery?.data as any)?.data?.map((pkg: getPackageByStatusRes) => (
            <Card key={pkg.id} className='hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
              <div className={`absolute top-0 left-0 w-full h-1 ${pkg.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />

              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-5 w-5 text-blue-600' />
                    <CardTitle className='text-xl'>{pkg.name}</CardTitle>
                  </div>
                  <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                    {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Star className='h-4 w-4' />
                  <span>{getTypeLabel(pkg.type)}</span>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Price */}
                <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='h-5 w-5 text-blue-600' />
                    <span className='font-medium'>Giá</span>
                  </div>
                  <span className='text-xl font-bold text-blue-600'>{formatCurrency(pkg.price)}</span>
                </div>

                {/* Duration */}
                <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5 text-green-600' />
                    <span className='font-medium'>Thời hạn</span>
                  </div>
                  <span className='font-semibold text-green-600'>{pkg.durationMonth} tháng</span>
                </div>

                {/* Features */}
                <div>
                  <h4 className='font-medium mb-2 flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    Tính năng
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className='flex items-center gap-2'>
                        <div className='w-1.5 h-1.5 bg-blue-500 rounded-full' />
                        {feature}
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className='text-muted-foreground italic'>+{pkg.features.length - 3} tính năng khác</li>
                    )}
                  </ul>
                </div>

                {/* Dates */}
                <div className='text-xs text-muted-foreground space-y-1 pt-2 border-t'>
                  <p>Tạo: {formatDate(pkg.createdAt)}</p>
                  <p>Cập nhật: {formatDate(pkg.updatedAt)}</p>
                </div>

                {/* Actions */}
                <div className='flex gap-2 pt-2'>
                  <Button variant='outline' size='sm' onClick={() => handleEdit(pkg)} className='flex-1'>
                    <Edit className='h-4 w-4 mr-1' />
                    Sửa
                  </Button>
                  <Button
                    variant={pkg.isActive ? 'destructive' : 'default'}
                    size='sm'
                    onClick={() => handleToggleStatus(pkg)}
                    disabled={updatePackageMutation.isPending}
                    className='flex-1'
                  >
                    {updatePackageMutation.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : pkg.isActive ? (
                      <>
                        <XCircle className='h-4 w-4 mr-1' />
                        Tắt
                      </>
                    ) : (
                      <>
                        <CheckCircle className='h-4 w-4 mr-1' />
                        Bật
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!packagesQuery.isLoading && !(packagesQuery?.data as any)?.length && (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <Package className='h-16 w-16 mx-auto' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có gói dịch vụ nào</h3>
          <p className='text-gray-500 mb-6'>Tạo gói dịch vụ đầu tiên để bắt đầu quản lý.</p>
          <Button onClick={handleCreate}>
            <Plus className='h-4 w-4 mr-2' />
            Tạo gói đầu tiên
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên gói *</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập tên gói...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại gói *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn loại gói' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packageTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='0'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='durationMonth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời hạn (tháng) *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          placeholder='1'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Features */}
              <FormField
                control={form.control}
                name='features'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tính năng *</FormLabel>
                    <div className='space-y-3'>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Nhập tính năng...'
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <Button type='button' onClick={addFeature} size='sm'>
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>

                      {field.value.length > 0 && (
                        <div className='space-y-2 max-h-32 overflow-y-auto'>
                          {field.value.map((feature, index) => (
                            <div key={index} className='flex items-center justify-between bg-gray-50 p-2 rounded'>
                              <span className='text-sm'>{feature}</span>
                              <Button type='button' variant='ghost' size='sm' onClick={() => removeFeature(index)}>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Trạng thái hoạt động</FormLabel>
                      <div className='text-sm text-muted-foreground'>Gói có thể được sử dụng bởi người dùng</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button type='button' variant='outline' onClick={() => setIsFormOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                  className='flex items-center gap-2'
                >
                  {createPackageMutation.isPending || updatePackageMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      {editingPackage ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
