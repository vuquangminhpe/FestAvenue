import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import { InvitationStatus } from '@/types/userManagement.types'
import UserFilters from './components/UserFilters'
import UserTable from './components/UserTable'
import InvitationTable from './components/InvitationTable'
import AddUserModal from './components/AddUserModal'
import ViewUserModal from './components/ViewUserModal'
import EditUserModal from './components/EditUserModal'
import gsap from 'gsap'
import { useGetUsersInEvent, useGetInvitationsEvent } from './hooks/useUserManagement'
import { getIdFromNameId } from '@/utils/utils'
import { PermissionGuard } from '@/components/guards/PermissionGuard'

export default function UserManagementInEvents() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventId = getIdFromNameId(nameId)

  const [activeTab, setActiveTab] = useState('members')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([])
  const [selectedPackageIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [invitationPage, setInvitationPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserServicePackageResult | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const usersPerPage = 10

  const { data: usersData, isLoading } = useGetUsersInEvent(
    {
      eventCode: eventId,
      searchFullName: searchTerm || '',
      servicePackageIds: selectedPackageIds,
      paginationParam: {
        pageIndex: currentPage,
        isPaging: true,
        pageSize: usersPerPage
      }
    },
    !!eventId
  )

  const { data: invitationsData, isLoading: isLoadingInvitations } = useGetInvitationsEvent(
    {
      eventCode: eventId,
      invitationStatuses: selectedStatuses as any,
      searchMail: searchEmail || '',
      paginationParam: {
        pageIndex: invitationPage,
        isPaging: true,
        pageSize: usersPerPage
      }
    },
    !!eventId && activeTab === 'invitations'
  )

  const users = usersData?.data?.result || []
  const totalUsers = users.length
  const invitations = invitationsData?.data?.result || []
  const totalInvitations = invitations.length

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
    }
  }, [])

  // Pagination
  const totalPages = Math.ceil(totalUsers / usersPerPage)
  const totalInvitationPages = Math.ceil(totalInvitations / usersPerPage)

  const handleViewUser = (user: UserServicePackageResult) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user: UserServicePackageResult) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleStatusToggle = (status: number) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
    setInvitationPage(1) // Reset to first page when filter changes
  }

  const statusOptions = [
    { value: InvitationStatus.Pending, label: 'Chờ phản hồi', color: 'text-yellow-700' },
    { value: InvitationStatus.Accepted, label: 'Đã chấp nhận', color: 'text-green-700' },
    { value: InvitationStatus.Declined, label: 'Đã từ chối', color: 'text-red-700' },
    { value: InvitationStatus.Canceled, label: 'Đã hủy', color: 'text-gray-700' }
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div ref={headerRef} className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
            Quản lý thành viên trong sự kiện
          </h1>
          <p className='text-gray-600 mt-2'>Quản lý và phân quyền cho các thành viên tham gia sự kiện</p>
        </div>

        {/* Only Event Owner can add members */}
        <PermissionGuard requiresEventOwner>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-6 rounded-xl'
          >
            <Plus className='w-5 h-5' />
            Thêm thành viên
          </Button>
        </PermissionGuard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='members'>Thành viên ({totalUsers})</TabsTrigger>
          <TabsTrigger value='invitations'>Lời mời đã gửi ({totalInvitations})</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value='members' className='space-y-4'>
          {/* Filters */}
          <UserFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-cyan-500' />
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <UserTable
              users={users}
              eventId={eventId}
              onView={handleViewUser}
              onEdit={handleEditUser}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value='invitations' className='space-y-4'>
          {/* Filters */}
          <div className='bg-white rounded-xl shadow-md p-4 space-y-4'>
            {/* Search Email */}
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Tìm kiếm theo email</label>
              <input
                type='email'
                placeholder='Nhập email...'
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Lọc theo trạng thái</label>
              <div className='flex flex-wrap gap-4'>
                {statusOptions.map((option) => (
                  <div key={option.value} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={selectedStatuses.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <label
                      htmlFor={`status-${option.value}`}
                      className={`text-sm font-medium cursor-pointer ${option.color}`}
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {selectedStatuses.length > 0 && (
                <p className='text-xs text-gray-500 mt-2'>Đang lọc: {selectedStatuses.length} trạng thái được chọn</p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoadingInvitations && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='w-8 h-8 animate-spin text-cyan-500' />
            </div>
          )}

          {/* Invitations Table */}
          {!isLoadingInvitations && (
            <InvitationTable
              invitations={invitations}
              currentPage={invitationPage}
              totalPages={totalInvitationPages}
              onPageChange={setInvitationPage}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals - Only Event Owner can access */}
      <PermissionGuard requiresEventOwner>
        <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} eventId={eventId} />
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          eventId={eventId}
        />
      </PermissionGuard>

      {/* View modal - Everyone can view */}
      <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
    </div>
  )
}
