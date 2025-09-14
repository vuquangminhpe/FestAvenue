import type { UseFormReturn } from 'react-hook-form'
import { Building, Users, MessageCircle, AlertTriangle, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUsersStore } from '@/contexts/app.context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import type { OrganizationType } from '@/types/user.types'
import type { FormData } from '../../types'

interface ConflictDialogProps {
  showConflictDialog: boolean
  setShowConflictDialog: (show: boolean) => void
  existingOrganization?: OrganizationType
  onConflictResolution: (type: 'request_admin' | 'request_user' | 'dispute') => void
  form: UseFormReturn<FormData>
  onResetOrganization: () => void
  // Avatar upload props
  avatarPreview?: string | null
  isUploadingAvatar?: boolean
  onAvatarSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveAvatar?: () => void
  // Accept request props
  onAcceptRequest?: (groupChatId: string) => void
}

export function ConflictDialog({
  showConflictDialog,
  setShowConflictDialog,
  existingOrganization,
  onConflictResolution,
  form,
  onResetOrganization,
  avatarPreview,
  isUploadingAvatar,
  onAvatarSelect,
  onRemoveAvatar,
  onAcceptRequest
}: ConflictDialogProps) {
  const userProfile = useUsersStore((state) => state.isProfile)


  const isOwner = userProfile?.id === existingOrganization?.createdBy
  const isRequester = !isOwner 

  return (
    <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
      <AlertDialogContent style={{ width: '700px', maxWidth: '700px' }} className=''>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Building className='w-5 h-5 text-orange-500' />
            Tổ chức đã tồn tại
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-4'>
              <p>
                Tổ chức "<strong>{existingOrganization?.name}</strong>" đã tồn tại trong hệ thống. Vui lòng chọn một
                trong các hành động sau:
              </p>

              {existingOrganization && (
                <div className='p-4 bg-slate-50 rounded-lg border'>
                  <div className='flex items-center gap-3 mb-2'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={existingOrganization?.logo} />
                      <AvatarFallback>
                        <Building className='w-5 h-5' />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className='font-semibold text-slate-800'>{existingOrganization?.name}</h4>
                      <p className='text-sm text-slate-600'>{existingOrganization?.industry}</p>
                    </div>
                  </div>
                  <p className='text-sm text-slate-500'>
                    Địa chỉ: {existingOrganization?.address?.street}, {existingOrganization?.address?.city}
                  </p>
                </div>
              )}

              {/* Avatar Upload Section */}
              <div className='p-4 bg-blue-50 rounded-lg border'>
                <h4 className='font-medium text-blue-800 mb-3'>Tùy chỉnh avatar cho group chat (tùy chọn)</h4>

                {avatarPreview ? (
                  <div className='relative inline-block'>
                    <img
                      src={avatarPreview}
                      alt='Group chat avatar preview'
                      className='w-16 h-16 rounded-full border border-gray-300 object-cover'
                    />
                    {onRemoveAvatar && (
                      <button
                        onClick={onRemoveAvatar}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    )}
                    {isUploadingAvatar && (
                      <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full'>
                        <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex items-center gap-3'>
                    {onAvatarSelect && (
                      <>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={onAvatarSelect}
                          className='hidden'
                          id='group-avatar-upload'
                        />
                        <label
                          htmlFor='group-avatar-upload'
                          className='flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors'
                        >
                          <ImagePlus className='w-4 h-4' />
                          Chọn avatar group chat
                        </label>
                      </>
                    )}
                    <span className='text-sm text-gray-500'>Nếu không chọn, sẽ sử dụng logo của tổ chức hiện tại</span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-col space-y-2 sm:flex-col sm:space-x-0'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 w-full'>
            <Button
              variant='outline'
              onClick={() => onConflictResolution('request_admin')}
              className='w-full text-blue-600 border-blue-200 hover:bg-blue-50'
            >
              <Users className='w-4 h-4 mr-2' />
              Yêu cầu quyền Admin
            </Button>
            <Button
              variant='outline'
              onClick={() => onConflictResolution('request_user')}
              className='w-full text-green-600 border-green-200 hover:bg-green-50'
            >
              <MessageCircle className='w-4 h-4 mr-2' />
              Yêu cầu tham gia
            </Button>
            <Button
              variant='outline'
              onClick={() => onConflictResolution('dispute')}
              className='w-full text-red-600 border-red-200 hover:bg-red-50'
            >
              <AlertTriangle className='w-4 h-4 mr-2' />
              Tranh chấp
            </Button>
          </div>
          <div className='flex gap-2 w-full'>
            <AlertDialogCancel className='flex-1'>Hủy</AlertDialogCancel>

            {/* Owner có thể Accept request */}
            {isOwner && onAcceptRequest && (
              <Button
                onClick={() => {
                  // Giả sử ta cần groupChatId, có thể lấy từ context hoặc tạo temporary
                  // Tạm thời dùng organizationId
                  onAcceptRequest(existingOrganization?.id || '')
                  setShowConflictDialog(false)
                }}
                className='flex-1 bg-green-600 hover:bg-green-700 text-white'
              >
                Chấp nhận yêu cầu
              </Button>
            )}

            {/* Requester có thể đổi tên */}
            {isRequester ? (
              <AlertDialogAction
                onClick={() => {
                  form.setValue('name', '')
                  setShowConflictDialog(false)
                  onResetOrganization()
                }}
                className='flex-1'
              >
                Đổi tên khác
              </AlertDialogAction>
            ) : (
              <Button
                disabled
                className='flex-1 opacity-50 cursor-not-allowed'
                title='Bạn đang là chủ sở hữu, hãy chấp nhận hoặc từ chối yêu cầu'
              >
                Đổi tên khác (Dành cho người request)
              </Button>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
