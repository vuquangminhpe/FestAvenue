import http_v2 from '@/utils/http_v2'

const moduleEvent = {
  getModuleEvent: async () => {
    const data = await http_v2.get('/module-event/get-all-module-event')
    return data?.data
  }
}
export default moduleEvent
