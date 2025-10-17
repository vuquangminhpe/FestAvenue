import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useRef } from 'react'
import { Edit, Loader2, Package as PackageIcon } from 'lucide-react'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import gsap from 'gsap'
import { useUpdateServicePackageForUser } from '../hooks/useUserManagement'
import { useQuery } from '@tanstack/react-query'
import packageApis from '@/apis/package.api'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserServicePackageResult | null
  eventId: string
}

export default function EditUserModal({ isOpen, onClose, user, eventId }: EditUserModalProps) {
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const updatePackagesMutation = useUpdateServicePackageForUser()

  // Fetch all available service packages
  const { data: allPackagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['servicePackages', 'active'],
    queryFn: () => packageApis.getServicesPackageByStatus({ isActive: true })
  })

  // Handle different possible response structures
  const allPackages = (allPackagesData?.data as any)?.result || allPackagesData?.data || []

  useEffect(() => {
    if (user) {
      // Set currently active packages
      setSelectedPackageIds(user.servicePackages.filter((pkg) => pkg.isActive).map((pkg) => pkg.id))
    }
  }, [user])

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      })
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const currentPackageIds = user.servicePackages.filter((pkg) => pkg.isActive).map((pkg) => pkg.id)
    const addServicePackageIds = selectedPackageIds.filter((id) => !currentPackageIds.includes(id))
    const removeServicePackageIds = currentPackageIds.filter((id) => !selectedPackageIds.includes(id))

    // Only send request if there are actual changes
    if (addServicePackageIds.length === 0 && removeServicePackageIds.length === 0) {
      onClose()
      return
    }

    updatePackagesMutation.mutate(
      {
        eventCode: eventId,
        userId: user.userId,
        addServicePackageIds,
        removeServicePackageIds
      },
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]
    )
  }

  if (!user) return null

  // Get user's current package IDs
  const userPackageIds = user.servicePackages.map((pkg) => pkg.id)

  // Separate packages into: user has (active), user has (inactive), and available to add
  const userActivePackages = user.servicePackages.filter((pkg) => pkg.isActive)
  const userInactivePackages = user.servicePackages.filter((pkg) => !pkg.isActive)
  const availablePackages = allPackages.filter((pkg: any) => !userPackageIds.includes(pkg.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-cyan-100'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent flex items-center gap-2'>
            <Edit className='w-6 h-6 text-cyan-400' />
            Cập nhật quyền cho thành viên
          </DialogTitle>
          <div className='mt-2'>
            <p className='text-sm font-medium text-gray-700'>{user.fullName}</p>
            <p className='text-sm text-gray-500'>{user.email}</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          <div ref={contentRef} className='space-y-6'>
            {/* Service Packages */}
            <div className='space-y-3'>
              <Label className='text-gray-700 font-medium flex items-center gap-2'>
                <PackageIcon className='w-4 h-4' />
                Chọn các chức năng (Service Packages)
              </Label>

              {isLoadingPackages ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-cyan-400' />
                  <span className='ml-2 text-sm text-gray-500'>Đang tải packages...</span>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* User's Active Packages */}
                  {userActivePackages.length > 0 && (
                    <div>
                      <p className='text-xs font-medium text-gray-600 mb-2 uppercase'>Packages đang sử dụng</p>
                      <div className='grid grid-cols-1 gap-3 p-4 bg-green-50 rounded-lg border border-green-200'>
                        {userActivePackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className='flex items-center space-x-3 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors'
                          >
                            <Checkbox
                              id={`active-${pkg.id}`}
                              checked={selectedPackageIds.includes(pkg.id)}
                              onCheckedChange={() => handlePackageToggle(pkg.id)}
                              className='border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-blue-300'
                            />
                            <Label
                              htmlFor={`active-${pkg.id}`}
                              className='text-sm font-medium text-gray-800 cursor-pointer'
                            >
                              {pkg.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User's Inactive Packages */}
                  {userInactivePackages.length > 0 && (
                    <div>
                      <p className='text-xs font-medium text-gray-600 mb-2 uppercase'>
                        Packages không khả dụng (hết hạn hoặc chưa thanh toán)
                      </p>
                      <div className='grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                        {userInactivePackages.map((pkg) => (
                          <div key={pkg.id} className='flex items-center space-x-3 p-3 rounded-lg bg-white opacity-60'>
                            <Checkbox
                              id={`inactive-${pkg.id}`}
                              checked={false}
                              disabled={true}
                              className='border-gray-300'
                            />
                            <Label htmlFor={`inactive-${pkg.id}`} className='text-sm font-medium text-gray-500'>
                              {pkg.name}
                              <span className='ml-2 text-xs text-red-500'>(Không khả dụng)</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Packages to Add */}
                  {availablePackages.length > 0 && (
                    <div>
                      <p className='text-xs font-medium text-gray-600 mb-2 uppercase'>
                        Packages có thể thêm cho người dùng này
                      </p>
                      <div className='grid grid-cols-1 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                        {availablePackages.map((pkg: any) => (
                          <div
                            key={pkg.id}
                            className='flex items-center space-x-3 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors'
                          >
                            <Checkbox
                              id={`available-${pkg.id}`}
                              checked={selectedPackageIds.includes(pkg.id)}
                              onCheckedChange={() => handlePackageToggle(pkg.id)}
                              className='border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-blue-300'
                            />
                            <Label
                              htmlFor={`available-${pkg.id}`}
                              className='text-sm font-medium text-gray-800 cursor-pointer'
                            >
                              {pkg.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No packages available message */}
                  {userActivePackages.length === 0 &&
                    userInactivePackages.length === 0 &&
                    availablePackages.length === 0 && (
                      <div className='text-center py-8 text-gray-500'>
                        <PackageIcon className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                        <p>Chưa có service package nào trong hệ thống</p>
                      </div>
                    )}
                </div>
              )}

              <p className='text-xs text-gray-500 mt-2'>
                💡 Tip: Bạn có thể thêm hoặc xóa service packages để cấp quyền cho người dùng này sử dụng các chức năng
                tương ứng trong event.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={updatePackagesMutation.isPending}
              className='hover:bg-gray-100 transition-all duration-300'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={updatePackagesMutation.isPending || isLoadingPackages}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white shadow-md hover:shadow-lg transition-all duration-300'
            >
              {updatePackagesMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
