import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, CheckCircle2, XCircle, Loader2, Mail, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useNavigate } from 'react-router'
import { InvitationStatus, type InvitationResult } from '@/types/userManagement.types'
import { useGetInvitationsReceived } from '@/pages/User/Process/UserManagementInEvents/hooks/useInvitations'
import {
  useAcceptInvitation,
  useDeclineInvitation
} from '@/pages/User/Process/UserManagementInEvents/hooks/useInvitations'
import path from '@/constants/path'
import { generateNameId } from '@/utils/utils'

const getStatusConfig = (status: number) => {
  const configs = {
    [InvitationStatus.Pending]: {
      label: 'Chờ phản hồi',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: Mail
    },
    [InvitationStatus.Accepted]: {
      label: 'Đã chấp nhận',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2
    },
    [InvitationStatus.Declined]: {
      label: 'Đã từ chối',
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle
    },
    [InvitationStatus.Canceled]: {
      label: 'Đã hủy',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: XCircle
    }
  }
  return configs[status as keyof typeof configs] || configs[InvitationStatus.Pending]
}

export default function InvitationsTable() {
  const navigate = useNavigate()
  const { data: invitationsData, isLoading } = useGetInvitationsReceived({
    paginationParam: {
      pageIndex: 1,
      isPaging: true,
      pageSize: 20
    }
  })

  const acceptMutation = useAcceptInvitation()
  const declineMutation = useDeclineInvitation()

  const invitations = invitationsData?.data?.result || []

  const handleAccept = (invitationId: string) => {
    acceptMutation.mutate(invitationId)
  }

  const handleDecline = (invitationId: string) => {
    declineMutation.mutate(invitationId)
  }

  const handleManage = (invitation: InvitationResult) => {
    navigate(
      `${path.user.event_owner.user_management}?${generateNameId({
        id: invitation.event.eventCode,
        name: `${invitation.event.organization.name}-${invitation.event.eventName}`
      })}`
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card className='p-12 text-center'>
        <Mail className='w-16 h-16 text-slate-300 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-slate-700 mb-2'>Chưa có lời mời nào</h3>
        <p className='text-slate-500'>Bạn chưa nhận được lời mời tham gia sự kiện nào</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[400px]'>Sự kiện</TableHead>
            <TableHead className='w-[150px]'>Ngày bắt đầu</TableHead>
            <TableHead className='w-[150px]'>Địa điểm</TableHead>
            <TableHead className='w-[150px]'>Trạng thái</TableHead>
            <TableHead className='w-[200px]'>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation: InvitationResult) => {
            const status = getStatusConfig(invitation.invitationStatus)
            const StatusIcon = status.icon

            return (
              <TableRow key={invitation.invitationId} className='hover:bg-slate-50'>
                {/* Event Info */}
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-3'>
                    <div className='w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden'>
                      {invitation.event.bannerUrl ? (
                        <img
                          src={invitation.event.bannerUrl}
                          alt={invitation.event.eventName}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center'>
                          <Calendar className='w-6 h-6 text-slate-400' />
                        </div>
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='font-semibold text-slate-800 truncate'>{invitation.event.eventName}</p>
                      <p className='text-sm text-slate-600 truncate'>{invitation.event.shortDescription}</p>
                      <p className='text-xs text-slate-500 mt-1'>{invitation.event.organization.name}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Start Date */}
                <TableCell>
                  <div className='flex items-center gap-2 text-sm text-slate-600'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      {invitation.event.startDate
                        ? format(new Date(invitation.event.startDate), 'dd MMM yyyy', { locale: vi })
                        : 'Chưa có'}
                    </span>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className='flex items-center gap-2 text-sm text-slate-600'>
                    <MapPin className='w-4 h-4' />
                    <span className='truncate'>{invitation.event.location?.address?.city || 'Chưa có địa điểm'}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge className={`${status.color} border flex items-center gap-1 px-3 py-1 w-fit`}>
                    <StatusIcon className='w-3 h-3' />
                    {status.label}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  {invitation.invitationStatus === InvitationStatus.Pending && (
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        className='bg-green-600 hover:bg-green-700'
                        onClick={() => handleAccept(invitation.invitationId)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {acceptMutation.isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <CheckCircle2 className='w-4 h-4' />
                        )}
                        <span className='ml-1'>Chấp nhận</span>
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='border-red-300 text-red-700 hover:bg-red-50'
                        onClick={() => handleDecline(invitation.invitationId)}
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                      >
                        {declineMutation.isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <XCircle className='w-4 h-4' />
                        )}
                        <span className='ml-1'>Từ chối</span>
                      </Button>
                    </div>
                  )}
                  {invitation.invitationStatus === InvitationStatus.Accepted && (
                    <Button
                      size='sm'
                      className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white'
                      onClick={() => handleManage(invitation)}
                    >
                      <Settings className='w-4 h-4' />
                      <span className='ml-1'>Quản lí</span>
                    </Button>
                  )}
                  {invitation.invitationStatus !== InvitationStatus.Pending &&
                    invitation.invitationStatus !== InvitationStatus.Accepted && (
                      <span className='text-sm text-slate-500'>Không có hành động</span>
                    )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
