import { useQuery } from '@tanstack/react-query'
import serviceSocialMediaApis from '@/apis/serviceSocialMedia.api'

export const useTop5LatestPostByEventCode = (eventCode: string | undefined) => {
  return useQuery({
    queryKey: ['top5LatestPostByEventCode', eventCode],
    queryFn: () => serviceSocialMediaApis.getTop5LatestPostByEventCode(eventCode as string),
    enabled: !!eventCode,
    select: (data) => data?.data || []
  })
}
