import type { APIResponse } from "@/types/API.types"
import http from "@/utils/http"
import type { getPermissionEventByMemberIdRes, getPermissionEventRes, updateMemberPermissionReq } from "@/types/permissionEvent.types"

const permissionEventApi = {
    getPermissionEvent: async (eventCode: string) => {
        const data = await http.get<APIResponse<getPermissionEventRes[]>>(`/event-permission/get-permissions-by-event-code`,{
            params: {
                eventCode
            }
        })
        return data?.data
    },
    updateMemberPermission: async (body: updateMemberPermissionReq) => {
        const data = await http.post<APIResponse<{ messages: string }>>(`/event-permission/update-member-permissions-in-event`, body)
        return data?.data
    },
    getPermissionEventByMemberId: async (eventCode: string,memberId: string) => {
        const data = await http.get<APIResponse<getPermissionEventByMemberIdRes>>(`/event-permission/get-member-permissions-in-event`,{
            params: {
                eventCode,
                userId: memberId
            }
        })
        return data?.data
    }
}
export default permissionEventApi
