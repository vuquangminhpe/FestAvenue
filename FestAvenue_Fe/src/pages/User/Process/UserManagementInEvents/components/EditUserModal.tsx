import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useState, useEffect, useRef } from 'react'
import { Loader2, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import gsap from 'gsap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import permissionEventApi from '@/apis/permissionEvent.api'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserServicePackageResult | null
  eventId: string
}

export default function EditUserModal({ isOpen, onClose, user, eventId }: EditUserModalProps) {
  const [selectedActions, setSelectedActions] = useState<Record<string, string[]>>({})
  const [originalActions, setOriginalActions] = useState<Record<string, string[]>>({})
  const [openPackages, setOpenPackages] = useState<string[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // 1. Fetch all available permissions (structure)
  const { data: allPermissionsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['eventPermissions', eventId],
    queryFn: () => permissionEventApi.getPermissionEvent(eventId),
    enabled: !!eventId && isOpen
  })

  // 2. Fetch user's current permissions
  const { data: userPermissionsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['userPermissions', eventId, user?.userId],
    queryFn: () => permissionEventApi.getPermissionEventByMemberId(eventId, user!.userId),
    enabled: !!eventId && !!user?.userId && isOpen
  })

  const updatePermissionMutation = useMutation({
    mutationFn: permissionEventApi.updateMemberPermission,
    onSuccess: () => {
      toast.success('Cập nhật quyền thành công')
      queryClient.invalidateQueries({ queryKey: ['userPermissions', eventId] })
      onClose()
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật quyền thất bại')
    }
  })

  // Initialize state when data is loaded
  useEffect(() => {
    const userData = (userPermissionsData?.data as any)?.[0]

    if (userData?.servicePackagePermissions && allPermissionsData?.data) {
      // Create ID -> Name map
      const actionIdToNameMap: Record<string, string> = {}
      allPermissionsData.data.forEach((pkg) => {
        pkg.permissionActions.forEach((action) => {
          actionIdToNameMap[action.permissionActionId] = action.actionName
        })
      })

      const initialActions: Record<string, string[]> = {}
      userData.servicePackagePermissions.forEach((pkg: any) => {
        // Map IDs to Names for state
        const actionNames = (pkg.permissions || [])
          .map((id: string) => actionIdToNameMap[id])
          .filter((name: string) => !!name)

        initialActions[pkg.servicePackageId] = actionNames
      })

      setSelectedActions(initialActions)
      setOriginalActions(JSON.parse(JSON.stringify(initialActions))) // Deep copy

      // Open packages that have active permissions by default
      const activePackages = userData.servicePackagePermissions
        .filter((pkg: any) => pkg.permissions && pkg.permissions.length > 0)
        .map((pkg: any) => pkg.servicePackageId)
      setOpenPackages(activePackages)
    }
  }, [userPermissionsData, allPermissionsData])

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.from(contentRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      })
    }
  }, [isOpen])

  const handleActionToggle = (packageId: string, actionName: string) => {
    setSelectedActions((prev) => {
      const currentPackageActions = prev[packageId] || []
      const isSelected = currentPackageActions.includes(actionName)

      let newPackageActions
      if (isSelected) {
        newPackageActions = currentPackageActions.filter((a) => a !== actionName)
      } else {
        newPackageActions = [...currentPackageActions, actionName]
      }

      return {
        ...prev,
        [packageId]: newPackageActions
      }
    })
  }

  const handleSelectAllPackage = (packageId: string, allActions: string[]) => {
    setSelectedActions((prev) => {
      const currentPackageActions = prev[packageId] || []
      const isAllSelected = allActions.every((a) => currentPackageActions.includes(a))

      return {
        ...prev,
        [packageId]: isAllSelected ? [] : [...allActions]
      }
    })
  }

  const togglePackageOpen = (packageId: string) => {
    setOpenPackages((prev) => (prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const permissionsChanges = []

    // Create a map of actionName -> permissionActionId for easy lookup
    const actionNameToIdMap: Record<string, string> = {}
    if (allPermissionsData?.data) {
      allPermissionsData.data.forEach((pkg) => {
        pkg.permissionActions.forEach((action) => {
          actionNameToIdMap[action.actionName] = action.permissionActionId
        })
      })
    }

    // Iterate over all packages found in allPermissionsData (or combined keys)
    const allPackageIds = new Set([...Object.keys(selectedActions), ...Object.keys(originalActions)])

    for (const packageId of allPackageIds) {
      const currentNames = selectedActions[packageId] || []
      const originalNames = originalActions[packageId] || []

      // Check if there are any changes (order doesn't matter, so sort or set compare)
      const currentSet = new Set(currentNames)
      const originalSet = new Set(originalNames)

      const hasChanges =
        currentNames.length !== originalNames.length || [...currentSet].some((name) => !originalSet.has(name))

      if (hasChanges) {
        // Map ALL current names to IDs
        const permissionIds = currentNames.map((name) => actionNameToIdMap[name]).filter((id): id is string => !!id)

        permissionsChanges.push({
          servicePackageId: packageId,
          permissionIds
        })
      }
    }

    if (permissionsChanges.length === 0) {
      onClose()
      return
    }

    updatePermissionMutation.mutate({
      eventCode: eventId,
      memberId: user.userId,
      permissionsChanges
    })
  }

  if (!user) return null

  const isLoading = isLoadingAll || isLoadingUser
  const allPackages = allPermissionsData?.data || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-cyan-100'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent flex items-center gap-2'>
            <ShieldCheck className='w-6 h-6 text-cyan-400' />
            Phân quyền chi tiết
          </DialogTitle>
          <div className='mt-2'>
            <p className='text-sm font-medium text-gray-700'>{user.fullName}</p>
            <p className='text-sm text-gray-500'>{user.email}</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          <div ref={contentRef} className='space-y-4'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-cyan-400 mb-2' />
                <span className='text-sm text-gray-500'>Đang tải dữ liệu phân quyền...</span>
              </div>
            ) : (
              <div className='space-y-4'>
                {allPackages.map((pkg) => {
                  const packageActions = pkg.permissionActions.map((a) => a.actionName)
                  const selectedCount = (selectedActions[pkg.servicePackageId] || []).length
                  const totalCount = packageActions.length
                  const isAllSelected = totalCount > 0 && selectedCount === totalCount
                  const isOpen = openPackages.includes(pkg.servicePackageId)

                  return (
                    <Collapsible
                      key={pkg.servicePackageId}
                      open={isOpen}
                      onOpenChange={() => togglePackageOpen(pkg.servicePackageId)}
                      className='border rounded-lg bg-gray-50/50 overflow-hidden transition-all duration-200'
                    >
                      <div className='flex items-center justify-between p-4 bg-white border-b'>
                        <div className='flex items-center gap-3 flex-1'>
                          <CollapsibleTrigger asChild>
                            <Button variant='ghost' size='sm' className='p-0 h-6 w-6 hover:bg-transparent'>
                              {isOpen ? (
                                <ChevronDown className='h-4 w-4 text-gray-500' />
                              ) : (
                                <ChevronRight className='h-4 w-4 text-gray-500' />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <div className='flex flex-col'>
                            <span className='font-medium text-gray-900'>{pkg.servicePackageName}</span>
                            <span className='text-xs text-gray-500'>
                              Đã chọn {selectedCount}/{totalCount} quyền
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectAllPackage(pkg.servicePackageId, packageActions)
                            }}
                            className='text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50'
                          >
                            {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                          </Button>
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className='p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/30'>
                          {pkg.permissionActions.map((action) => {
                            const isChecked = (selectedActions[pkg.servicePackageId] || []).includes(action.actionName)
                            return (
                              <div
                                key={action.permissionActionId}
                                className={cn(
                                  'flex items-start space-x-3 p-3 rounded-md transition-colors border',
                                  isChecked
                                    ? 'bg-cyan-50 border-cyan-200'
                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                )}
                              >
                                <Checkbox
                                  id={action.permissionActionId}
                                  checked={isChecked}
                                  onCheckedChange={() => handleActionToggle(pkg.servicePackageId, action.actionName)}
                                  className='mt-1 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500'
                                />
                                <div className='grid gap-1.5 leading-none'>
                                  <Label
                                    htmlFor={action.permissionActionId}
                                    className='text-sm font-medium text-gray-700 cursor-pointer'
                                  >
                                    {action.actionName}
                                  </Label>
                                  <p className='text-xs text-gray-500'>{action.description}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={updatePermissionMutation.isPending}
              className='hover:bg-gray-100'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={updatePermissionMutation.isPending || isLoading}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white shadow-md'
            >
              {updatePermissionMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang lưu...
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
