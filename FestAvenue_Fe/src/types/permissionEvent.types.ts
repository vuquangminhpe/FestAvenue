export interface getPermissionEventRes {
  servicePackageId: string
  servicePackageName: string
  permissionActions: permissionActionType[]
}

export interface permissionActionType {
  permissionActionId: string
  actionName: string
  description: string
  isActive: boolean
}

export interface updateMemberPermissionReq {
  eventCode: string
  memberId: string
  permissionsChanges: permissionsChangesType[]
}

export interface permissionsChangesType {
  servicePackageId: string
  permissionIds: string[]

}

export interface getPermissionEventByMemberIdRes {
  memberId: string
  servicePackagePermissions: {
    servicePackageId: string
    servicePackageName: string
    permissions: string[]
  }[]
}