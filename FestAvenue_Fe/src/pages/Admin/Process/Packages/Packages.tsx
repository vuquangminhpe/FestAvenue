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
  Package as PackageIcon,
  Loader2,
  DollarSign,
  CheckCircle,
  XCircle,
  Trash2,
  Save,
  Star,
  Boxes
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

import packageApis from '@/apis/package.api'
import type { Package, PackageCreateOrUpdate, ServicePackage, bodyCreateServicesPackage } from '@/types/package.types'

// Package Schema with comprehensive validation
const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .trim()
    .min(3, 'Tên gói phải có ít nhất 3 ký tự')
    .max(100, 'Tên gói không được vượt quá 100 ký tự')
    .regex(/^(?=.*[a-zA-ZÀ-ỹ])[a-zA-ZÀ-ỹ0-9\s\-_.]+$/,
      'Tên gói phải chứa ít nhất một chữ cái và chỉ bao gồm chữ, số, khoảng trắng, dấu gạch ngang, gạch dưới, dấu chấm')
    .refine((val) => val.trim().length > 0, 'Tên gói không được chỉ chứa khoảng trắng')
    .refine((val) => !/^\d+$/.test(val), 'Tên gói không được chỉ chứa số')
    .refine((val) => !/^[^a-zA-ZÀ-ỹ0-9]+$/.test(val), 'Tên gói không được chỉ chứa ký tự đặc biệt'),
  description: z.string()
    .trim()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .refine((val) => val.trim().length >= 10, 'Mô tả không được chỉ chứa khoảng trắng')
    .refine((val) => !/^[^a-zA-ZÀ-ỹ0-9]+$/.test(val), 'Mô tả phải chứa ít nhất một chữ cái hoặc số'),
  totalPrice: z.number()
    .min(0, 'Giá phải lớn hơn hoặc bằng 0')
    .max(999999999, 'Giá không được vượt quá 999,999,999')
    .refine((val) => Number.isFinite(val), 'Giá phải là số hợp lệ')
    .refine((val) => val >= 0, 'Giá không được âm'),
  priority: z.number()
    .min(0, 'Độ ưu tiên phải lớn hơn hoặc bằng 0')
    .max(100, 'Độ ưu tiên không được vượt quá 100')
    .int('Độ ưu tiên phải là số nguyên')
    .refine((val) => Number.isFinite(val), 'Độ ưu tiên phải là số hợp lệ'),
  servicePackageIds: z.array(z.string().min(1, 'ID dịch vụ không hợp lệ'))
    .min(1, 'Phải chọn ít nhất 1 dịch vụ')
    .max(20, 'Không được chọn quá 20 dịch vụ'),
  isActive: z.boolean()
})

// Service Package Schema with comprehensive validation
const servicePackageSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .trim()
    .min(3, 'Tên dịch vụ phải có ít nhất 3 ký tự')
    .max(100, 'Tên dịch vụ không được vượt quá 100 ký tự')
    .regex(/^(?=.*[a-zA-ZÀ-ỹ])[a-zA-ZÀ-ỹ0-9\s\-_.]+$/,
      'Tên dịch vụ phải chứa ít nhất một chữ cái và chỉ bao gồm chữ, số, khoảng trắng, dấu gạch ngang, gạch dưới, dấu chấm')
    .refine((val) => val.trim().length > 0, 'Tên dịch vụ không được chỉ chứa khoảng trắng')
    .refine((val) => !/^\d+$/.test(val), 'Tên dịch vụ không được chỉ chứa số')
    .refine((val) => !/^[^a-zA-ZÀ-ỹ0-9]+$/.test(val), 'Tên dịch vụ không được chỉ chứa ký tự đặc biệt'),
  description: z.string()
    .trim()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .refine((val) => val.trim().length >= 10, 'Mô tả không được chỉ chứa khoảng trắng')
    .refine((val) => !/^[^a-zA-ZÀ-ỹ0-9]+$/.test(val), 'Mô tả phải chứa ít nhất một chữ cái hoặc số'),
  icon: z.string()
    .trim()
    .min(1, 'Icon là bắt buộc')
    .max(10, 'Icon không được quá dài')
    .refine((val) => val.length > 0, 'Icon không được để trống'),
  price: z.number()
    .min(0, 'Giá phải lớn hơn hoặc bằng 0')
    .max(999999999, 'Giá không được vượt quá 999,999,999')
    .refine((val) => Number.isFinite(val), 'Giá phải là số hợp lệ')
    .refine((val) => val >= 0, 'Giá không được âm'),
  isActive: z.boolean()
})

type PackageFormData = z.infer<typeof packageSchema>
type ServicePackageFormData = z.infer<typeof servicePackageSchema>

export default function Packages() {
  const [activeTab, setActiveTab] = useState<'packages' | 'services'>('packages')

  // Package states
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [isPublicFilter, setIsPublicFilter] = useState<boolean>(true)

  // Service Package states
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServicePackage | null>(null)
  const [isServiceActiveFilter, setIsServiceActiveFilter] = useState<boolean>(true)
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Package Form
  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      name: '',
      description: '',
      totalPrice: 0,
      priority: 0,
      servicePackageIds: [],
      isActive: true
    }
  })

  // Service Package Form
  const serviceForm = useForm<ServicePackageFormData>({
    resolver: zodResolver(servicePackageSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      price: 0,
      isActive: true
    }
  })

  // Queries
  const packagesQuery = useQuery({
    queryKey: ['packages', isPublicFilter],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: isPublicFilter })
  })

  const servicesQuery = useQuery({
    queryKey: ['services', isServiceActiveFilter],
    queryFn: () => packageApis.getServicesPackageByStatus({ isActive: isServiceActiveFilter })
  })

  // Query ALL services for package form (including inactive ones)
  const allServicesQuery = useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => packageApis.getServicesPackageByStatus({ isActive: 'all' })
  })

  // Package Mutations
  const createPackageMutation = useMutation({
    mutationFn: packageApis.createPackageForAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Tạo gói thành công!')
      setIsPackageFormOpen(false)
      resetPackageForm()
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
      setIsPackageFormOpen(false)
      resetPackageForm()
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật gói')
    }
  })

  const updatePackageStatusMutation = useMutation({
    mutationFn: packageApis.updateStatusPackageForAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Cập nhật trạng thái thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  })

  // Service Package Mutations
  const createServiceMutation = useMutation({
    mutationFn: packageApis.createServicesPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Tạo dịch vụ thành công!')
      setIsServiceFormOpen(false)
      resetServiceForm()
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo dịch vụ')
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: packageApis.updateServicesPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Cập nhật dịch vụ thành công!')
      setIsServiceFormOpen(false)
      resetServiceForm()
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ')
    }
  })

  const updateServiceStatusMutation = useMutation({
    mutationFn: packageApis.updateStatusServicePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Cập nhật trạng thái dịch vụ thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: packageApis.deleteServicePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Xóa dịch vụ thành công!')
      setDeleteServiceId(null)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ')
    }
  })

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    }
  }, [])

  // Package Handlers
  const resetPackageForm = () => {
    packageForm.reset()
    setEditingPackage(null)
  }

  const handleCreatePackage = () => {
    resetPackageForm()
    setIsPackageFormOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    packageForm.setValue('id', pkg.id)
    packageForm.setValue('name', pkg.name)
    packageForm.setValue('description', pkg.description || '')
    packageForm.setValue('totalPrice', pkg.totalPrice)
    packageForm.setValue('priority', pkg.priority)
    packageForm.setValue('servicePackageIds', pkg.servicePackages.map(sp => sp.id))
    packageForm.setValue('isActive', pkg.isActive)
    setIsPackageFormOpen(true)
  }

  const handleTogglePackageStatus = async (pkg: Package) => {
    try {
      await updatePackageStatusMutation.mutateAsync({
        id: pkg.id,
        isActive: !pkg.isActive
      })
    } catch (error) {
      console.error('Toggle status error:', error)
    }
  }

  const handleSubmitPackage = async (data: PackageFormData) => {
    try {
      const payload: PackageCreateOrUpdate = {
        name: data.name.trim(),
        description: data.description.trim(),
        totalPrice: data.totalPrice,
        priority: data.priority,
        servicePackageIds: data.servicePackageIds,
        isActive: data.isActive
      }

      if (editingPackage) {
        await updatePackageMutation.mutateAsync({
          ...payload,
          id: editingPackage.id
        })
      } else {
        await createPackageMutation.mutateAsync(payload)
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  // Service Package Handlers
  const resetServiceForm = () => {
    serviceForm.reset()
    setEditingService(null)
  }

  const handleCreateService = () => {
    resetServiceForm()
    setIsServiceFormOpen(true)
  }

  const handleEditService = (service: ServicePackage) => {
    setEditingService(service)
    serviceForm.setValue('id', service.id)
    serviceForm.setValue('name', service.name)
    serviceForm.setValue('description', service.description || '')
    serviceForm.setValue('icon', service.icon)
    serviceForm.setValue('price', service.price)
    serviceForm.setValue('isActive', service.isActive)
    setIsServiceFormOpen(true)
  }

  const handleToggleServiceStatus = async (service: ServicePackage) => {
    try {
      await updateServiceStatusMutation.mutateAsync({
        id: service.id,
        isActive: !service.isActive
      })
    } catch (error) {
      console.error('Toggle service status error:', error)
    }
  }

  const handleDeleteService = async () => {
    if (deleteServiceId) {
      try {
        await deleteServiceMutation.mutateAsync(deleteServiceId)
      } catch (error) {
        console.error('Delete service error:', error)
      }
    }
  }

  const handleSubmitService = async (data: ServicePackageFormData) => {
    try {
      const payload: bodyCreateServicesPackage = {
        name: data.name.trim(),
        description: data.description.trim(),
        icon: data.icon.trim(),
        price: data.price,
        isActive: data.isActive
      }

      if (editingService) {
        await updateServiceMutation.mutateAsync({
          ...payload,
          id: editingService.id
        })
      } else {
        await createServiceMutation.mutateAsync(payload)
      }
    } catch (error) {
      console.error('Submit service error:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getAvailableServices = () => {
    // Use allServicesQuery for package form to show all services (including inactive)
    return (allServicesQuery?.data as any)?.data || []
  }

  const toggleServiceSelection = (serviceId: string) => {
    const currentIds = packageForm.getValues('servicePackageIds')
    if (currentIds.includes(serviceId)) {
      packageForm.setValue('servicePackageIds', currentIds.filter(id => id !== serviceId))
    } else {
      packageForm.setValue('servicePackageIds', [...currentIds, serviceId])
    }
  }

  return (
    <div ref={containerRef} className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Quản lý gói dịch vụ</h1>
          <p className='text-muted-foreground'>Tạo và quản lý các gói dịch vụ cho hệ thống</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className='space-y-6'>
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='packages' className='flex items-center gap-2'>
            <PackageIcon className='h-4 w-4' />
            Gói dịch vụ
          </TabsTrigger>
          <TabsTrigger value='services' className='flex items-center gap-2'>
            <Boxes className='h-4 w-4' />
            Dịch vụ
          </TabsTrigger>
        </TabsList>

        {/* PACKAGES TAB */}
        <TabsContent value='packages' className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2 bg-gray-100 p-1 rounded-lg'>
              <Button
                variant={isPublicFilter ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsPublicFilter(true)}
              >
                Công khai
              </Button>
              <Button
                variant={!isPublicFilter ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsPublicFilter(false)}
              >
                Riêng tư
              </Button>
            </div>
            <Button onClick={handleCreatePackage} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Tạo gói mới
            </Button>
          </div>

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
              {(packagesQuery?.data as any)?.data?.map((pkg: Package) => (
                <Card key={pkg.id} className='hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
                  <div className={`absolute top-0 left-0 w-full h-1 ${pkg.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />

                  <CardHeader className='pb-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        <PackageIcon className='h-5 w-5 text-blue-600' />
                        <CardTitle className='text-xl'>{pkg.name}</CardTitle>
                      </div>
                      <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                        {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                    {pkg.description && (
                      <p className='text-sm text-muted-foreground mt-2'>{pkg.description}</p>
                    )}
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-5 w-5 text-blue-600' />
                        <span className='font-medium'>Giá</span>
                      </div>
                      <span className='text-xl font-bold text-blue-600'>{formatCurrency(pkg.totalPrice)}</span>
                    </div>

                    <div className='flex items-center justify-between p-3 bg-purple-50 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Star className='h-5 w-5 text-purple-600' />
                        <span className='font-medium'>Độ ưu tiên</span>
                      </div>
                      <span className='font-semibold text-purple-600'>{pkg.priority}</span>
                    </div>

                    <div>
                      <h4 className='font-medium mb-2 flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-green-500' />
                        Dịch vụ ({pkg.servicePackages.length})
                      </h4>
                      <ul className='space-y-1 text-sm'>
                        {pkg.servicePackages.slice(0, 3).map((service) => (
                          <li key={service.id} className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 bg-blue-500 rounded-full' />
                            {service.name}
                          </li>
                        ))}
                        {pkg.servicePackages.length > 3 && (
                          <li className='text-muted-foreground italic'>+{pkg.servicePackages.length - 3} dịch vụ khác</li>
                        )}
                      </ul>
                    </div>

                    <div className='flex gap-2 pt-2'>
                      <Button variant='outline' size='sm' onClick={() => handleEditPackage(pkg)} className='flex-1'>
                        <Edit className='h-4 w-4 mr-1' />
                        Sửa
                      </Button>
                      <Button
                        variant={pkg.isActive ? 'destructive' : 'default'}
                        size='sm'
                        onClick={() => handleTogglePackageStatus(pkg)}
                        disabled={updatePackageStatusMutation.isPending}
                        className='flex-1'
                      >
                        {updatePackageStatusMutation.isPending ? (
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

          {!packagesQuery.isLoading && !(packagesQuery?.data as any)?.data?.length && (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <PackageIcon className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có gói dịch vụ nào</h3>
              <p className='text-gray-500 mb-6'>Tạo gói dịch vụ đầu tiên để bắt đầu quản lý.</p>
              <Button onClick={handleCreatePackage}>
                <Plus className='h-4 w-4 mr-2' />
                Tạo gói đầu tiên
              </Button>
            </div>
          )}
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value='services' className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2 bg-gray-100 p-1 rounded-lg'>
              <Button
                variant={isServiceActiveFilter ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsServiceActiveFilter(true)}
              >
                Hoạt động
              </Button>
              <Button
                variant={!isServiceActiveFilter ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setIsServiceActiveFilter(false)}
              >
                Tạm dừng
              </Button>
            </div>
            <Button onClick={handleCreateService} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Tạo dịch vụ mới
            </Button>
          </div>

          {servicesQuery.isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3].map((i) => (
                <Card key={i} className='animate-pulse'>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      <div className='h-6 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                      <div className='h-10 bg-gray-200 rounded'></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {(servicesQuery?.data as any)?.data?.map((service: ServicePackage) => (
                <Card key={service.id} className='hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
                  <div className={`absolute top-0 left-0 w-full h-1 ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />

                  <CardHeader className='pb-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='text-2xl'>{service.icon}</div>
                        <CardTitle className='text-xl'>{service.name}</CardTitle>
                      </div>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className='text-sm text-muted-foreground mt-2'>{service.description}</p>
                    )}
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-5 w-5 text-green-600' />
                        <span className='font-medium'>Giá</span>
                      </div>
                      <span className='text-xl font-bold text-green-600'>{formatCurrency(service.price)}</span>
                    </div>

                    <div className='flex gap-2 pt-2'>
                      <Button variant='outline' size='sm' onClick={() => handleEditService(service)} className='flex-1'>
                        <Edit className='h-4 w-4 mr-1' />
                        Sửa
                      </Button>
                      <Button
                        variant={service.isActive ? 'destructive' : 'default'}
                        size='sm'
                        onClick={() => handleToggleServiceStatus(service)}
                        disabled={updateServiceStatusMutation.isPending}
                        className='flex-1'
                      >
                        {updateServiceStatusMutation.isPending ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : service.isActive ? (
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
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => setDeleteServiceId(service.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!servicesQuery.isLoading && !(servicesQuery?.data as any)?.data?.length && (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <Boxes className='h-16 w-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có dịch vụ nào</h3>
              <p className='text-gray-500 mb-6'>Tạo dịch vụ đầu tiên để bắt đầu quản lý.</p>
              <Button onClick={handleCreateService}>
                <Plus className='h-4 w-4 mr-2' />
                Tạo dịch vụ đầu tiên
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Package Form Dialog */}
      <Dialog open={isPackageFormOpen} onOpenChange={setIsPackageFormOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</DialogTitle>
          </DialogHeader>

          <Form {...packageForm}>
            <form onSubmit={packageForm.handleSubmit(handleSubmitPackage)} className='space-y-6'>
              <FormField
                control={packageForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên gói *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Gói khởi nghiệp' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={packageForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Mô tả chi tiết về gói dịch vụ...' {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={packageForm.control}
                  name='totalPrice'
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
                  control={packageForm.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Độ ưu tiên (0-100) *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='100'
                          placeholder='0'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={packageForm.control}
                name='servicePackageIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn dịch vụ * (Tối thiểu 1, tối đa 20)</FormLabel>
                    <div className='space-y-3'>
                      {allServicesQuery.isLoading ? (
                        <p className='text-sm text-muted-foreground'>Đang tải danh sách dịch vụ...</p>
                      ) : getAvailableServices().length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          Chưa có dịch vụ nào. Vui lòng tạo dịch vụ trước.
                        </p>
                      ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3'>
                          {getAvailableServices().map((service: ServicePackage) => (
                            <label
                              key={service.id}
                              className='flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer'
                              htmlFor={`service-${service.id}`}
                            >
                              <Checkbox
                                id={`service-${service.id}`}
                                checked={field.value.includes(service.id)}
                                onCheckedChange={() => toggleServiceSelection(service.id)}
                              />
                              <div className='flex-1'>
                                <div className='flex items-center gap-2'>
                                  <span>{service.icon}</span>
                                  <p className='font-medium text-sm'>{service.name}</p>
                                </div>
                                <p className='text-xs text-muted-foreground mt-1'>{formatCurrency(service.price)}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                      <div className='text-sm text-muted-foreground'>
                        Đã chọn: {field.value?.length || 0} dịch vụ
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={packageForm.control}
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

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button type='button' variant='outline' onClick={() => setIsPackageFormOpen(false)}>
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

      {/* Service Package Form Dialog */}
      <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</DialogTitle>
          </DialogHeader>

          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(handleSubmitService)} className='space-y-6'>
              <FormField
                control={serviceForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dịch vụ *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Quản lý sự kiện cơ bản' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={serviceForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Mô tả chi tiết về dịch vụ...' {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={serviceForm.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Emoji) *</FormLabel>
                      <FormControl>
                        <Input placeholder='🎉' {...field} maxLength={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceForm.control}
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
              </div>

              <FormField
                control={serviceForm.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Trạng thái hoạt động</FormLabel>
                      <div className='text-sm text-muted-foreground'>Dịch vụ có thể được sử dụng</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button type='button' variant='outline' onClick={() => setIsServiceFormOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  className='flex items-center gap-2'
                >
                  {createServiceMutation.isPending || updateServiceMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4' />
                      {editingService ? 'Cập nhật' : 'Tạo mới'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Service Confirmation Dialog */}
      <AlertDialog open={!!deleteServiceId} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các gói dịch vụ đang sử dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              disabled={deleteServiceMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteServiceMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
