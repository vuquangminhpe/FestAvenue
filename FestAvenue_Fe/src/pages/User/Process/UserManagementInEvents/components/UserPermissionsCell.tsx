import { useQuery } from '@tanstack/react-query'
import permissionEventApi from '@/apis/permissionEvent.api'
import { Badge } from '@/components/ui/badge'
import { Loader2, Crown } from 'lucide-react'

interface UserPermissionsCellProps {
  userId: string
  eventId: string
  isOwner?: boolean
}

const getPackageBadgeColor = (index: number) => {
  const colors = [
    'bg-gradient-to-r from-cyan-400 to-blue-300 text-white',
    'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
    'bg-gradient-to-r from-green-400 to-teal-400 text-white',
    'bg-gradient-to-r from-orange-400 to-red-400 text-white',
    'bg-gradient-to-r from-indigo-400 to-purple-400 text-white'
  ]
  return colors[index % colors.length]
}

export default function UserPermissionsCell({ userId, eventId, isOwner }: UserPermissionsCellProps) {
  if (isOwner) {
    return (
      <Badge className='bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 gap-1 shadow-sm'>
        <Crown className='w-3 h-3 fill-yellow-500 text-yellow-600' />
        Chủ sự kiện
      </Badge>
    )
  }
  
  // 1. Fetch all available permissions (structure) - This will be cached by React Query
  const { data: allPermissionsData } = useQuery({
    queryKey: ['eventPermissions', eventId],
    queryFn: () => permissionEventApi.getPermissionEvent(eventId),
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000 // Cache for 10 mins
  })

  // 2. Fetch user's current permissions
  const { data: userPermissionsData, isLoading } = useQuery({
    queryKey: ['userPermissions', eventId, userId],
    queryFn: () => permissionEventApi.getPermissionEventByMemberId(eventId, userId),
    enabled: !!eventId && !!userId
  })

  // Map IDs to Names
  const userActionNames: string[] = []
  const userData = (userPermissionsData?.data as any)?.[0]

  if (userData?.servicePackagePermissions && allPermissionsData?.data) {
    const actionIdToNameMap: Record<string, string> = {}
    allPermissionsData.data.forEach(pkg => {
      pkg.permissionActions.forEach(action => {
        actionIdToNameMap[action.permissionActionId] = action.actionName
      })
    })

    userData.servicePackagePermissions.forEach((pkg: any) => {
      if (pkg.permissions) {
        pkg.permissions.forEach((id: string) => {
          const name = actionIdToNameMap[id]
          if (name) userActionNames.push(name)
        })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (userActionNames.length === 0) {
    return <Badge className='bg-gray-200 text-gray-600 px-3 py-1'>Không có quyền</Badge>
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {userActionNames.map((actionName, index) => (
        <Badge
          key={index}
          className={`${getPackageBadgeColor(index)} shadow-md px-3 py-1`}
        >
          {actionName}
        </Badge>
      ))}
    </div>
  )
}
