import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { mockEventUsers } from '@/mocks/userManagement.mock'
import type { EventUser } from '@/types/userManagement.types'
import UserFilters from './components/UserFilters'
import UserTable from './components/UserTable'
import AddUserModal from './components/AddUserModal'
import ViewUserModal from './components/ViewUserModal'
import EditUserModal from './components/EditUserModal'
import gsap from 'gsap'

export default function UserManagementInEvents() {
  const [users, setUsers] = useState<EventUser[]>(mockEventUsers)
  const [filteredUsers, setFilteredUsers] = useState<EventUser[]>(mockEventUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EventUser | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const usersPerPage = 10

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

  // Filter users
  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedRole, users])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const handleAddUser = (newUser: Omit<EventUser, 'id' | 'status'>) => {
    const user: EventUser = {
      ...newUser,
      id: String(users.length + 1),
      status: 'active'
    }
    setUsers([...users, user])
  }

  const handleViewUser = (user: EventUser) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleEditUser = (user: EventUser) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = (updatedUser: EventUser) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div ref={headerRef} className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
            Quản lý thành viên trong sự kiện
          </h1>
          <p className='text-gray-600 mt-2'>Quản lý và phân quyền cho các thành viên tham gia sự kiện</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-6 rounded-xl'
        >
          <Plus className='w-5 h-5' />
          Thêm thành viên
        </Button>
      </div>

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

      {/* Table */}
      <UserTable
        users={currentUsers}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddUser} />
      <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />
    </div>
  )
}
