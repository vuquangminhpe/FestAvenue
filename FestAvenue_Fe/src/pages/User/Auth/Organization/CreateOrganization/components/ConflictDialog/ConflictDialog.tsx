import type { UseFormReturn } from 'react-hook-form'
import { Building, Users, MessageCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
}

export function ConflictDialog({
  showConflictDialog,
  setShowConflictDialog,
  existingOrganization,
  onConflictResolution,
  form,
  onResetOrganization
}: ConflictDialogProps) {
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
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
