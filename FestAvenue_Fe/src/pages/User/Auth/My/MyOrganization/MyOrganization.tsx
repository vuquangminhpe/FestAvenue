import userApi from '@/apis/user.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Helmet } from 'react-helmet-async'
import {
  Pen,
  Trash,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Building2,
  Users,
  Calendar,
  Shield,
  Palette,
  ChevronRight,
  Save,
  X,
  Plus,
  UserPlus
} from 'lucide-react'
import type { OrganizationResponse } from '@/types/organization.types'
import { Link, useNavigate } from 'react-router-dom'
import path from '@/constants/path'
import type { updateOrganizationBody } from '@/types/user.types'
import { SubDescriptionStatus } from '@/constants/enum'
import { generateNameId } from '@/utils/utils'
import InviteUsersModal from './components/InviteUsersModal'
import { useInviteUsers } from './hooks/useInviteUsers'
import packageApis from '@/apis/package.api'
import type { getPackageByStatusRes } from '@/types/package.types'

export default function MyOrganization() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrgIndex, setSelectedOrgIndex] = useState<number>(0)
  const [selectedOrgForDelete, setSelectedOrgForDelete] = useState<OrganizationResponse['organization'] | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({
    name: '',
    description: '',
    industry: '',
    size: '',
    website: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    contactFax: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostalCode: '',
    addressCountry: '',
    socialMediaFacebook: '',
    socialMediaTwitter: '',
    socialMediaLinkedin: '',
    socialMediaInstagram: ''
  })
  const { data: getDataPackage } = useQuery({
    queryKey: ['getDataPackage'],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: true })
  })
  const { data: dataGetAllCurrentOrganization, isLoading } = useQuery({
    queryKey: ['dataGetAllCurrentOrganization'],
    queryFn: () => userApi.getCurrentOrganization()
  })
  const uploadsStorageMutation = useMutation({
    mutationFn: userApi.uploadsStorage,
    onSuccess: (data) => {
      if (data?.data) {
        setUploadedLogoUrl(data?.data as any)
        setEditFormData((prev: any) => ({ ...prev, logo: data.data }))
      }
    },
    onError: (error) => {
      console.error('Error uploading logo:', error)
    }
  })
  const updateOrganizationMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: updateOrganizationBody }) =>
      userApi.updateOrganizationById(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataGetAllCurrentOrganization'] })
    },
    onError: (error) => {
      console.error('Error updating organization:', error)
    }
  })
  const organizations = dataGetAllCurrentOrganization?.data || []
  const selectedOrg = organizations[selectedOrgIndex] as any
  const isOwner = selectedOrg?.isOwner || false

  const { inviteUsers, isLoading: isInviteLoading } = useInviteUsers()

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })

      if (listRef.current) {
        gsap.fromTo(
          listRef.current,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
        )
      }

      if (detailsRef.current) {
        gsap.fromTo(
          detailsRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.4 }
        )
      }
    }
  }, [isLoading, organizations])

  const handleOrgSelection = (index: number) => {
    if (detailsRef.current) {
      gsap.fromTo(
        detailsRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
    setSelectedOrgIndex(index)
  }

  const handleCardHover = (element: HTMLElement, isHovering: boolean) => {
    gsap.to(element, {
      scale: isHovering ? 1.02 : 1,
      x: isHovering ? 5 : 0,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-gray-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động'
      case 'inactive':
        return 'Không hoạt động'
      case 'pending':
        return 'Đang chờ'
      default:
        return status
    }
  }

  const getSubscriptionStatusColor = (status: string | number) => {
    const statusStr = status.toString()
    switch (statusStr) {
      case 'active':
      case '1':
        return 'bg-emerald-500'
      case 'trial':
      case '2':
        return 'bg-blue-500'
      case 'inactive':
      case '0':
        return 'bg-red-500'
      case 'suspended':
      case '3':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSubscriptionStatusText = (status: string | number) => {
    const statusStr = status.toString()
    switch (statusStr) {
      case 'active':
      case '1':
        return 'Đang hoạt động'
      case 'trial':
      case '2':
        return 'Dùng thử'
      case 'inactive':
      case '0':
        return 'Không hoạt động'
      case 'suspended':
      case '3':
        return 'Tạm ngừng'
      default:
        return status
    }
  }

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      await userApi.deleteOrganization(orgId)
      setDeleteDialogOpen(false)
      setSelectedOrgForDelete(null)
      // Refetch data or handle success
    } catch (error) {
      console.error('Error deleting organization:', error)
    }
  }

  const handleEditOrganization = (org: any) => {
    setUploadedLogoUrl('') // Reset uploaded logo URL
    setEditFormData({
      name: org.name || '',
      description: org.description || '',
      industry: org.industry || '',
      size: org.size || '',
      website: org.website || '',
      logo: org.logo || '',
      contactEmail: org.contact?.email || '',
      contactPhone: org.contact?.phone || '',
      contactFax: org.contact?.fax || '',
      addressStreet: org.address?.street || '',
      addressCity: org.address?.city || '',
      addressState: org.address?.state || '',
      addressPostalCode: org.address?.postalCode || '',
      addressCountry: org.address?.country || '',
      socialMediaFacebook: org.socialMedia?.facebook || '',
      socialMediaTwitter: org.socialMedia?.twitter || '',
      socialMediaLinkedin: org.socialMedia?.linkedIn || '',
      socialMediaInstagram: org.socialMedia?.instagram || ''
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      if (!selectedOrg) return

      const updateData: updateOrganizationBody = {
        id: selectedOrg.organization.id,
        name: editFormData.name,
        description: editFormData.description,
        industry: editFormData.industry,
        size: editFormData.size,
        website: editFormData.website,
        logo: uploadedLogoUrl || editFormData.logo,
        contact: {
          email: editFormData.contactEmail,
          phone: editFormData.contactPhone,
          fax: editFormData.contactFax || ''
        },
        address:
          editFormData.addressStreet ||
          editFormData.addressCity ||
          editFormData.addressState ||
          editFormData.addressPostalCode ||
          editFormData.addressCountry
            ? {
                street: editFormData.addressStreet || '',
                city: editFormData.addressCity || '',
                state: editFormData.addressState || '',
                postalCode: editFormData.addressPostalCode || '',
                country: editFormData.addressCountry || ''
              }
            : undefined,
        socialMedia:
          editFormData.socialMediaFacebook ||
          editFormData.socialMediaTwitter ||
          editFormData.socialMediaLinkedin ||
          editFormData.socialMediaInstagram
            ? {
                facebook: editFormData.socialMediaFacebook || undefined,
                twitter: editFormData.socialMediaTwitter || undefined,
                linkedin: editFormData.socialMediaLinkedin || undefined,
                instagram: editFormData.socialMediaInstagram || undefined
              }
            : undefined,
        subscription: selectedOrg.organization.subDescription || {
          plan: '',
          startDate: new Date(),
          endDate: new Date(),
          status: 0
        }
      }

      await updateOrganizationMutation.mutateAsync({ id: selectedOrg.organization.id, body: updateData })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating organization:', error)
    }
  }

  const handleInviteUsers = async (emails: string[]) => {
    if (!selectedOrg) return

    try {
      await inviteUsers({
        emails,
        organizationId: selectedOrg.organization.id
      })
      setInviteModalOpen(false)
    } catch (error) {
      console.error('Error inviting users:', error)
    }
  }
  const dataPackageInOrganization = (getDataPackage?.data as any)?.filter(
    (data: getPackageByStatusRes) => data?.id === selectedOrg?.organization?.subDescription?.plan
  )

  if (isLoading) {
    return (
      <div className='w-full min-h-screen bg-white'>
        <Helmet>
          <title>Tổ chức của tôi - FestAvenue</title>
          <meta name='description' content='Quản lý các tổ chức mà bạn tham gia' />
        </Helmet>
        {/* Header with gradient */}
        <div className='bg-gradient-to-r from-cyan-400 to-blue-300 py-12'>
          <div className='container mx-auto px-4'>
            <div className='flex items-center justify-between'>
              <div>
                <Skeleton className='h-10 w-64 bg-white/20' />
                <Skeleton className='h-6 w-96 bg-white/20 mt-2' />
              </div>
              <Skeleton className='h-10 w-32 bg-white/20' />
            </div>
          </div>
        </div>
        <div className='container mx-auto px-4 py-8'>
          <div className='grid grid-cols-12 gap-6'>
            {/* Left sidebar skeleton */}
            <div className='col-span-12 lg:col-span-4'>
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className='p-4'>
                    <div className='flex items-center space-x-4'>
                      <Skeleton className='h-12 w-12 rounded-full' />
                      <div className='space-y-2 flex-1'>
                        <Skeleton className='h-5 w-32' />
                        <Skeleton className='h-4 w-24' />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            {/* Right details skeleton */}
            <div className='col-span-12 lg:col-span-8'>
              <Card className='h-96'>
                <CardHeader>
                  <div className='flex items-center space-x-4'>
                    <Skeleton className='h-24 w-24 rounded-full' />
                    <div className='space-y-2'>
                      <Skeleton className='h-8 w-48' />
                      <Skeleton className='h-6 w-64' />
                      <Skeleton className='h-5 w-32' />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Skeleton className='h-6 w-full' />
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-32 w-full' />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-white' ref={containerRef}>
      <Helmet>
        <title>Tổ chức của tôi - FestAvenue</title>
        <meta name='description' content='Quản lý các tổ chức mà bạn tham gia' />
      </Helmet>

      {/* Header with gradient */}
      <div className='bg-gradient-to-br from-cyan-400 to-blue-300 rounded-sm py-16 relative overflow-hidden'>
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>
        <div className='container mx-auto px-4 relative z-10'>
          <div className='flex items-center justify-between'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30'>
                  <Building2 className='h-8 w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-5xl font-bold text-white mb-1 drop-shadow-lg'>Tổ chức của tôi</h1>
                  <p className='text-cyan-100 text-xl font-medium'>
                    Quản lý và theo dõi các tổ chức bạn tham gia ({organizations.length} tổ chức)
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <Link
                to={path.user.organization.created_organization}
                className='bg-white flex items-center cursor-pointer text-cyan-600 hover:bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-3 rounded-xl'
              >
                <Plus className='mr-2 h-5 w-5' />
                Tạo tổ chức mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        {organizations.length === 0 ? (
          <div className='text-center py-16'>
            <Building2 className='h-24 w-24 text-gray-300 mx-auto mb-4' />
            <h3 className='text-2xl font-semibold text-gray-600 mb-2'>Chưa có tổ chức nào</h3>
            <p className='text-gray-500 mb-6'>Bạn chưa tham gia hoặc tạo tổ chức nào</p>
            <Button
              onClick={() => navigate(path.user.organization.created_organization)}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
            >
              <Building2 className='mr-2 h-4 w-4' />
              Tạo tổ chức đầu tiên
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-12 gap-6'>
            {/* Left Sidebar - Organization List */}
            <div className='col-span-12 lg:col-span-4' ref={listRef}>
              <Card className='overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl'>
                <CardHeader className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white relative overflow-hidden rounded-t-2xl'>
                  <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="3" cy="3" r="0.5"/%3E%3C/g%3E%3C/svg%3E")] opacity-40'></div>
                  <CardTitle className='flex py-4 px-2 items-center relative z-10 text-xl font-bold'>
                    <div className='p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 mr-3'>
                      <Building2 className='h-5 w-5 text-white' />
                    </div>
                    Danh sách tổ chức
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='space-y-1'>
                    {organizations.map((org: any, index) => (
                      <div
                        key={org.organization.id}
                        className={`p-5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-300 group ${
                          index === selectedOrgIndex
                            ? 'bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border-l-4 border-cyan-500 shadow-inner'
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 hover:border-l-4 hover:border-cyan-300'
                        }`}
                        onClick={() => handleOrgSelection(index)}
                        onMouseEnter={(e) => handleCardHover(e.currentTarget, true)}
                        onMouseLeave={(e) => handleCardHover(e.currentTarget, false)}
                      >
                        <div className='flex items-center space-x-4'>
                          <div className='relative'>
                            <Avatar className='h-14 w-14 border-3 border-white shadow-lg ring-2 ring-cyan-100 transition-all duration-300 group-hover:ring-cyan-200'>
                              <AvatarImage src={org.organization.logo} alt={org.organization.name} />
                              <AvatarFallback className='bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg'>
                                {org.organization.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {index === selectedOrgIndex && (
                              <div className='absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-white animate-pulse'></div>
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-bold text-gray-900 truncate text-lg mb-1 group-hover:text-cyan-700 transition-colors'>
                              {org.organization.name}
                            </h4>
                            <div className='flex items-center space-x-2 mb-2'>
                              <Badge
                                variant='outline'
                                className={`text-xs font-medium ${getStatusColor(
                                  org.organization.status
                                )} text-white border-0 rounded-full px-3 py-1 shadow-sm`}
                              >
                                {getStatusText(org.organization.status)}
                              </Badge>
                              {org.isOwner && (
                                <Badge
                                  variant='outline'
                                  className='text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 rounded-full px-3 py-1 shadow-sm font-medium'
                                >
                                  <Shield className='mr-1 h-3 w-3' />
                                  Chủ sở hữu
                                </Badge>
                              )}
                            </div>
                            <p className='text-sm text-gray-600 truncate leading-relaxed'>
                              {org.organization.description || 'Chưa có mô tả'}
                            </p>
                          </div>
                          <div className='flex items-center'>
                            <ChevronRight
                              className={`h-5 w-5 transition-all duration-300 ${
                                index === selectedOrgIndex
                                  ? 'rotate-90 text-cyan-600 scale-110'
                                  : 'text-gray-400 group-hover:text-cyan-500 group-hover:scale-105'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Organization Details */}
            <div className='col-span-12 lg:col-span-8' ref={detailsRef}>
              {selectedOrg && (
                <Card className='overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm rounded-2xl'>
                  {/* Organization Header */}
                  <div className='relative bg-gradient-to-br from-cyan-400 rounded-sm to-blue-300 p-10 overflow-hidden'>
                    <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>
                    <div className='flex items-start justify-between relative z-10'>
                      <div className='flex items-center space-x-8'>
                        <div className='relative'>
                          <Avatar className='h-28 w-28 border-4 border-white shadow-2xl ring-4 ring-white/50'>
                            <AvatarImage src={selectedOrg.organization.logo} alt={selectedOrg.organization.name} />
                            <AvatarFallback className='text-3xl font-bold bg-white text-cyan-600'>
                              {selectedOrg.organization.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg'>
                            <Building2 className='h-4 w-4 text-cyan-600' />
                          </div>
                        </div>
                        <div className='text-white space-y-4'>
                          <div>
                            <h2 className='text-4xl font-bold mb-2 drop-shadow-lg'>{selectedOrg.organization.name}</h2>
                            <p className='text-cyan-100 text-xl font-medium leading-relaxed max-w-md'>
                              {selectedOrg.organization.description || 'Chưa có mô tả'}
                            </p>
                          </div>
                          <div className='flex items-center gap-4'>
                            <Badge
                              className={`${getStatusColor(
                                selectedOrg.organization.status
                              )} text-white border-0 rounded-full px-4 py-2 font-semibold shadow-lg`}
                            >
                              {getStatusText(selectedOrg.organization.status)}
                            </Badge>
                            {isOwner && (
                              <Badge
                                variant='outline'
                                className='bg-white/20 text-white border-white/30 rounded-full px-4 py-2 font-semibold backdrop-blur-sm'
                              >
                                <Shield className='mr-2 h-4 w-4' />
                                Chủ sở hữu
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isOwner && (
                        <div className='flex flex-col gap-3'>
                          <Button
                            size='default'
                            onClick={() => setInviteModalOpen(true)}
                            className='bg-green-500/20 backdrop-blur-sm text-white border border-green-300/30 hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-300 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl'
                          >
                            <UserPlus className='h-4 w-4 mr-2' />
                            Mời thành viên
                          </Button>
                          <Button
                            size='default'
                            onClick={() => handleEditOrganization(selectedOrg.organization)}
                            className='bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-cyan-600 transition-all duration-300 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl'
                          >
                            <Pen className='h-4 w-4 mr-2' />
                            Chỉnh sửa
                          </Button>
                          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size='default'
                                variant='destructive'
                                className='bg-red-500/20 backdrop-blur-sm text-white border border-red-300/30 hover:bg-red-500 hover:border-red-500 transition-all duration-300 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl'
                                onClick={() => setSelectedOrgForDelete(selectedOrg.organization)}
                              >
                                <Trash className='h-4 w-4 mr-2' />
                                Xóa
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận xóa tổ chức</DialogTitle>
                                <DialogDescription>
                                  Bạn có chắc chắn muốn xóa tổ chức "{selectedOrgForDelete?.name}"? Hành động này không
                                  thể hoàn tác.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
                                  Hủy
                                </Button>
                                <Button
                                  variant='destructive'
                                  onClick={() =>
                                    selectedOrgForDelete && handleDeleteOrganization(selectedOrgForDelete.id)
                                  }
                                >
                                  Xóa tổ chức
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className='p-8'>
                    <div>
                      {!isEditing && (
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                          {/* Basic Information */}
                          <div className='space-y-6'>
                            <div className='border-l-4 border-gradient-to-b from-cyan-400 to-blue-300 pl-4'>
                              <h3 className='text-xl font-semibold text-gray-800 mb-4'>Thông tin cơ bản</h3>
                              <div className='space-y-3'>
                                <div className='flex items-center text-gray-600'>
                                  <Building2 className='h-4 w-4 mr-3 text-cyan-500' />
                                  <span className='font-medium mr-2'>Ngành:</span>
                                  {selectedOrg.organization.industry}
                                </div>
                                <div className='flex items-center text-gray-600'>
                                  <Users className='h-4 w-4 mr-3 text-cyan-500' />
                                  <span className='font-medium mr-2'>Quy mô:</span>
                                  {selectedOrg.organization.size} nhân viên
                                </div>
                                {selectedOrg.organization.website && (
                                  <div className='flex items-center text-gray-600'>
                                    <Globe className='h-4 w-4 mr-3 text-cyan-500' />
                                    <a
                                      href={selectedOrg.organization.website}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-600 hover:underline'
                                    >
                                      {selectedOrg.organization.website}
                                    </a>
                                  </div>
                                )}
                                <div className='flex items-center text-gray-600'>
                                  <Calendar className='h-4 w-4 mr-3 text-cyan-500' />
                                  <span className='font-medium mr-2'>Tạo lúc:</span>
                                  {new Date(selectedOrg.organization.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>

                            {/* Contact Information */}
                            {selectedOrg.organization.contact && (
                              <div className='border-l-4 border-gradient-to-b from-cyan-400 to-blue-300 pl-4'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-4'>Thông tin liên hệ</h3>
                                <div className='space-y-3'>
                                  <div className='flex items-center text-gray-600'>
                                    <Mail className='h-4 w-4 mr-3 text-cyan-500' />
                                    {selectedOrg.organization.contact.email}
                                  </div>
                                  <div className='flex items-center text-gray-600'>
                                    <Phone className='h-4 w-4 mr-3 text-cyan-500' />
                                    {selectedOrg.organization.contact.phone}
                                  </div>
                                  {selectedOrg.organization.contact.fax && (
                                    <div className='flex items-center text-gray-600'>
                                      <Phone className='h-4 w-4 mr-3 text-cyan-500' />
                                      <span className='font-medium mr-2'>Fax:</span>
                                      {selectedOrg.organization.contact.fax}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Additional Information */}
                          <div className='space-y-6'>
                            {/* Address */}
                            {selectedOrg.organization.address && (
                              <div className='border-l-4 border-gradient-to-b from-cyan-400 to-blue-300 pl-4'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-4'>Địa chỉ</h3>
                                <div className='flex items-start text-gray-600'>
                                  <MapPin className='h-4 w-4 mr-3 text-cyan-500 mt-1' />
                                  <div>
                                    <p>{selectedOrg.organization.address.street}</p>
                                    <p>
                                      {selectedOrg.organization.address.city}, {selectedOrg.organization.address.state}
                                    </p>
                                    <p>
                                      {selectedOrg.organization.address.country}{' '}
                                      {selectedOrg.organization.address.postalCode}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Subscription Info */}
                            {selectedOrg.organization.subDescription && (
                              <div className='border-l-4 border-gradient-to-b from-cyan-400 to-blue-300 pl-4'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-4'>Gói dịch vụ</h3>
                                <div className='space-y-3'>
                                  <div className='flex items-center'>
                                    <Badge
                                      className={`${getSubscriptionStatusColor(
                                        selectedOrg.organization.subDescription.status
                                      )} text-white border-0`}
                                    >
                                      {getSubscriptionStatusText(selectedOrg.organization.subDescription.status)}
                                    </Badge>
                                  </div>
                                  <div className='text-gray-600'>
                                    <p>
                                      <span className='font-medium'>Gói:</span> {dataPackageInOrganization?.[0]?.name}
                                    </p>
                                    <p>
                                      <span className='font-medium'>Bắt đầu:</span>{' '}
                                      {new Date(selectedOrg.organization.subDescription.startDate).toLocaleDateString(
                                        'vi-VN'
                                      )}
                                    </p>
                                    <p>
                                      <span className='font-medium'>Kết thúc:</span>{' '}
                                      {new Date(selectedOrg.organization.subDescription.endDate).toLocaleDateString(
                                        'vi-VN'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Social Media */}
                            {selectedOrg.organization.socialMedia && (
                              <div className='border-l-4 border-gradient-to-b from-cyan-400 to-blue-300 pl-4'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-4'>Mạng xã hội</h3>
                                <div className='flex gap-3'>
                                  {selectedOrg.organization.socialMedia.facebook && (
                                    <a
                                      href={selectedOrg.organization.socialMedia.facebook}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <Facebook className='h-6 w-6 text-blue-600 hover:text-blue-700' />
                                    </a>
                                  )}
                                  {selectedOrg.organization.socialMedia.twitter && (
                                    <a
                                      href={selectedOrg.organization.socialMedia.twitter}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <Twitter className='h-6 w-6 text-sky-500 hover:text-sky-600' />
                                    </a>
                                  )}
                                  {selectedOrg.organization.socialMedia.linkedIn && (
                                    <a
                                      href={selectedOrg.organization.socialMedia.linkedIn}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <Linkedin className='h-6 w-6 text-blue-700 hover:text-blue-800' />
                                    </a>
                                  )}
                                  {selectedOrg.organization.socialMedia.instagram && (
                                    <a
                                      href={selectedOrg.organization.socialMedia.instagram}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <Instagram className='h-6 w-6 text-pink-600 hover:text-pink-700' />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Settings Preview */}
                            {selectedOrg.organization.settings && (
                              <div className='mt-8 pt-8 border-t border-gray-200'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-6 flex items-center'>
                                  <Palette className='h-5 w-5 mr-2 text-cyan-500' />
                                  Cài đặt tổ chức
                                </h3>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                  {selectedOrg.organization.settings.branding && (
                                    <div className='bg-gray-50 rounded-lg p-6'>
                                      <h4 className='font-semibold text-gray-800 mb-3'>Thương hiệu</h4>
                                      <div className='space-y-2'>
                                        {selectedOrg.organization.settings.branding.colors && (
                                          <div className='flex items-center gap-2'>
                                            <span className='text-gray-600'>Màu sắc:</span>
                                            <div className='flex gap-2'>
                                              <div
                                                className='w-6 h-6 rounded-full border-2 border-white shadow'
                                                style={{
                                                  backgroundColor:
                                                    selectedOrg.organization.settings.branding.colors.primary
                                                }}
                                                title='Màu chính'
                                              />
                                              <div
                                                className='w-6 h-6 rounded-full border-2 border-white shadow'
                                                style={{
                                                  backgroundColor:
                                                    selectedOrg.organization.settings.branding.colors.secondary
                                                }}
                                                title='Màu phụ'
                                              />
                                              <div
                                                className='w-6 h-6 rounded-full border-2 border-white shadow'
                                                style={{
                                                  backgroundColor:
                                                    selectedOrg.organization.settings.branding.colors.accent
                                                }}
                                                title='Màu nhấn'
                                              />
                                            </div>
                                          </div>
                                        )}
                                        {selectedOrg.organization.settings.branding.customDomain && (
                                          <div className='text-gray-600'>
                                            <span className='font-medium'>Tên miền:</span>{' '}
                                            {selectedOrg.organization.settings.branding.customDomain}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {selectedOrg.organization.settings.security && (
                                    <div className='bg-gray-50 rounded-lg p-6'>
                                      <h4 className='font-semibold text-gray-800 mb-3 flex items-center'>
                                        <Shield className='h-4 w-4 mr-1' />
                                        Bảo mật
                                      </h4>
                                      <div className='space-y-2 text-gray-600'>
                                        <div>
                                          <span className='font-medium'>SSO:</span>{' '}
                                          {selectedOrg.organization.settings.security.ssoEnabled
                                            ? 'Đã kích hoạt'
                                            : 'Chưa kích hoạt'}
                                        </div>
                                        {selectedOrg.organization.settings.security.passwordPolicy && (
                                          <div>
                                            <span className='font-medium'>Chính sách mật khẩu:</span> Đã thiết lập
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>{' '}
                          {/* close right space-y-6 */}
                        </div>
                      )}

                      {isEditing && (
                        <div className='space-y-8'>
                          {/* Edit Form */}
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {/* Thông tin cơ bản */}
                            <div className='space-y-4'>
                              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>Thông tin cơ bản</h3>
                              <div>
                                <Label htmlFor='name' className='text-sm font-semibold text-gray-700'>
                                  Tên tổ chức *
                                </Label>
                                <Input
                                  id='name'
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='Nhập tên tổ chức'
                                />
                              </div>
                              <div>
                                <Label htmlFor='industry' className='text-sm font-semibold text-gray-700'>
                                  Ngành nghề
                                </Label>
                                <Input
                                  id='industry'
                                  value={editFormData.industry}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, industry: e.target.value }))
                                  }
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='Ví dụ: Công nghệ thông tin'
                                />
                              </div>
                              <div>
                                <Label htmlFor='size' className='text-sm font-semibold text-gray-700'>
                                  Quy mô
                                </Label>
                                <Input
                                  id='size'
                                  value={editFormData.size}
                                  onChange={(e) => setEditFormData((prev: any) => ({ ...prev, size: e.target.value }))}
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='Số nhân viên'
                                />
                              </div>
                              <div>
                                <Label htmlFor='website' className='text-sm font-semibold text-gray-700'>
                                  Website
                                </Label>
                                <Input
                                  id='website'
                                  value={editFormData.website}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, website: e.target.value }))
                                  }
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='https://example.com'
                                />
                              </div>
                            </div>

                            {/* Thông tin liên hệ */}
                            <div className='space-y-4'>
                              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>Thông tin liên hệ</h3>
                              <div>
                                <Label htmlFor='contactEmail' className='text-sm font-semibold text-gray-700'>
                                  Email liên hệ *
                                </Label>
                                <Input
                                  id='contactEmail'
                                  type='email'
                                  value={editFormData.contactEmail}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, contactEmail: e.target.value }))
                                  }
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='contact@example.com'
                                />
                              </div>
                              <div>
                                <Label htmlFor='contactPhone' className='text-sm font-semibold text-gray-700'>
                                  Số điện thoại *
                                </Label>
                                <Input
                                  id='contactPhone'
                                  value={editFormData.contactPhone}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, contactPhone: e.target.value }))
                                  }
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='0123-456-789'
                                />
                              </div>
                              <div>
                                <Label htmlFor='contactFax' className='text-sm font-semibold text-gray-700'>
                                  Fax
                                </Label>
                                <Input
                                  id='contactFax'
                                  value={editFormData.contactFax}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, contactFax: e.target.value }))
                                  }
                                  className='mt-2 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                  placeholder='0123-456-789'
                                />
                              </div>
                            </div>

                            {/* Địa chỉ */}
                            <div className='space-y-4'>
                              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>Địa chỉ</h3>
                              <div>
                                <Input
                                  placeholder='Đường/Số nhà'
                                  value={editFormData.addressStreet}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, addressStreet: e.target.value }))
                                  }
                                  className='mb-3 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                                <Input
                                  placeholder='Thành phố'
                                  value={editFormData.addressCity}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, addressCity: e.target.value }))
                                  }
                                  className='mb-3 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                                <Input
                                  placeholder='Tỉnh/Bang'
                                  value={editFormData.addressState}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, addressState: e.target.value }))
                                  }
                                  className='mb-3 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                                <Input
                                  placeholder='Mã bưu chính'
                                  value={editFormData.addressPostalCode}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, addressPostalCode: e.target.value }))
                                  }
                                  className='mb-3 rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                                <Input
                                  placeholder='Quốc gia'
                                  value={editFormData.addressCountry}
                                  onChange={(e) =>
                                    setEditFormData((prev: any) => ({ ...prev, addressCountry: e.target.value }))
                                  }
                                  className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                              </div>
                            </div>
                          </div>

                          {/* Mô tả và Mạng xã hội */}
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Mô tả */}
                            <div>
                              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2 mb-4'>Mô tả</h3>
                              <Textarea
                                value={editFormData.description}
                                onChange={(e) =>
                                  setEditFormData((prev: any) => ({ ...prev, description: e.target.value }))
                                }
                                className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 min-h-[120px]'
                                placeholder='Mô tả ngắn về tổ chức của bạn...'
                              />
                            </div>

                            {/* Logo Upload */}
                            <div>
                              <h3 className='text-lg font-semibold text-gray-800 border-b pb-2 mb-4'>Logo tổ chức</h3>
                              <div className='space-y-3'>
                                <Input
                                  type='file'
                                  accept='image/*'
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      uploadsStorageMutation.mutate(file)
                                    }
                                  }}
                                  className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                                />
                                {uploadsStorageMutation.isPending && (
                                  <p className='text-sm text-blue-600'>Đang tải lên...</p>
                                )}
                                {(editFormData.logo || uploadedLogoUrl) && (
                                  <div className='flex items-center space-x-3'>
                                    <img
                                      src={uploadedLogoUrl || editFormData.logo}
                                      alt='Logo preview'
                                      className='w-12 h-12 rounded-lg object-cover border'
                                    />
                                    <p className='text-sm text-green-600'>Logo đã được tải lên</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Mạng xã hội */}
                          <div>
                            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2 mb-4'>Mạng xã hội</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                              <Input
                                placeholder='Facebook URL'
                                value={editFormData.socialMediaFacebook}
                                onChange={(e) =>
                                  setEditFormData((prev: any) => ({ ...prev, socialMediaFacebook: e.target.value }))
                                }
                                className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                              />
                              <Input
                                placeholder='Twitter URL'
                                value={editFormData.socialMediaTwitter}
                                onChange={(e) =>
                                  setEditFormData((prev: any) => ({ ...prev, socialMediaTwitter: e.target.value }))
                                }
                                className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                              />
                              <Input
                                placeholder='LinkedIn URL'
                                value={editFormData.socialMediaLinkedin}
                                onChange={(e) =>
                                  setEditFormData((prev: any) => ({ ...prev, socialMediaLinkedin: e.target.value }))
                                }
                                className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                              />
                              <Input
                                placeholder='Instagram URL'
                                value={editFormData.socialMediaInstagram}
                                onChange={(e) =>
                                  setEditFormData((prev: any) => ({ ...prev, socialMediaInstagram: e.target.value }))
                                }
                                className='rounded-lg border-gray-300 focus:border-cyan-500 focus:ring-cyan-500'
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex justify-between items-center pt-6 border-t border-gray-200'>
                            <div className='text-sm text-gray-500'>Các thay đổi sẽ được áp dụng ngay lập tức</div>
                            <div className='flex gap-3'>
                              <Button
                                variant='outline'
                                onClick={() => setIsEditing(false)}
                                className='px-6 py-2.5 rounded-lg border-gray-300 hover:border-gray-400 transition-colors'
                                disabled={updateOrganizationMutation.isPending}
                              >
                                <X className='h-4 w-4 mr-2' />
                                Hủy
                              </Button>
                              <Button
                                onClick={handleSaveEdit}
                                className='bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50'
                                disabled={updateOrganizationMutation.isPending}
                              >
                                {updateOrganizationMutation.isPending ? (
                                  <>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                    Đang lưu...
                                  </>
                                ) : (
                                  <>
                                    <Save className='h-4 w-4 mr-2' />
                                    Lưu thay đổi
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedOrg.organization.subDescription.status !== SubDescriptionStatus.Paymented && (
                      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200'>
                        <h4 className='font-semibold text-blue-800 mb-3 flex items-center'>
                          <Shield className='h-4 w-4 mr-2' />
                          Thanh toán gói dịch vụ
                        </h4>
                        <p className='text-blue-700 text-sm mb-4'>
                          Gói dịch vụ của bạn chưa được thanh toán. Vui lòng hoàn tất thanh toán để tiếp tục sử dụng đầy
                          đủ tính năng.
                        </p>
                        <Link
                          to={`${path.user.payment.payment_organization}?${generateNameId({
                            id: `${selectedOrg.organization.id}_${selectedOrg.organization.subDescription.plan}` as any,
                            name: selectedOrg.organization.name
                          })}`}
                          className='inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold'
                        >
                          <Shield className='h-4 w-4 mr-2' />
                          Thanh toán ngay
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <InviteUsersModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onInvite={handleInviteUsers}
          organizationName={selectedOrg?.organization?.name || ''}
          isLoading={isInviteLoading}
        />
      </div>
    </div>
  )
}
