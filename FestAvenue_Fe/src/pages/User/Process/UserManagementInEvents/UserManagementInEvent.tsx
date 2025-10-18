import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import UserFilters from './components/UserFilters'
import UserTable from './components/UserTable'
import AddUserModal from './components/AddUserModal'
import ViewUserModal from './components/ViewUserModal'
import EditUserModal from './components/EditUserModal'
import gsap from 'gsap'
import { useGetUsersInEvent } from './hooks/useUserManagement'
import { getIdFromNameId } from '@/utils/utils'
import { PermissionGuard } from '@/components/guards/PermissionGuard'

export default function UserManagementInEvents() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventId = getIdFromNameId(nameId)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPackageIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserServicePackageResult | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const usersPerPage = 10

  const { data: usersData, isLoading } = useGetUsersInEvent(
    {
      eventCode: eventId,
      searchFullName: searchTerm,
      servicePackageIds: selectedPackageIds,
      paginationParam: {
        pageIndex: currentPage,
        isPaging: true,
        pageSize: usersPerPage
      }
    },
    !!eventId
  )

  const users = usersData?.data?.result || []
  const totalUsers = users.length

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

  const handleViewUser = (user: UserServicePackageResult) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user: UserServicePackageResult) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

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
