import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/guards/PermissionGuard'
import { Loader2, Save, Trash2, Download } from 'lucide-react'
import type { SeatMapData } from '@/types/seat.types'

interface EditorToolbarProps {
  ticketPackageId?: string
  handleSaveSeatingChart: () => void
  isCreating: boolean
  isUpdating: boolean
  isLoadingEvent: boolean
  hasExistingStructure: boolean
  handleDeleteSeatMap: () => void
  isDeletingByEventCode: boolean
  exportToJSON: () => void
  mapData: SeatMapData
  capacity: number
}

export default function EditorToolbar({
  handleSaveSeatingChart,
  isCreating,
  isUpdating,
  isLoadingEvent,
  hasExistingStructure,
  handleDeleteSeatMap,
  isDeletingByEventCode,
  exportToJSON,
  mapData,
  capacity
}: EditorToolbarProps) {
  return (
    <div className='absolute top-4 right-4 z-50 flex flex-col gap-2 animate-in slide-in-from-right duration-500'>
      {/* Primary Actions */}
      <div className='flex flex-col gap-2 bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl border border-purple-500/30 shadow-2xl'>
        {hasExistingStructure ? (
          <PermissionGuard action='Cập nhật sơ đồ'>
            <Button
              onClick={handleSaveSeatingChart}
              disabled={isCreating || isUpdating || isLoadingEvent || mapData.sections.length === 0}
              className='bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              size='sm'
            >
              {isUpdating ? (
                <>
                  <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-1' />
                  Cập nhật sơ đồ
                </>
              )}
            </Button>
          </PermissionGuard>
        ) : (
          <PermissionGuard action='Lưu sơ đồ'>
            <Button
              onClick={handleSaveSeatingChart}
              disabled={isCreating || isUpdating || isLoadingEvent || mapData.sections.length === 0}
              className='bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              size='sm'
            >
              {isCreating ? (
                <>
                  <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-1' />
                  Lưu sơ đồ
                </>
              )}
            </Button>
          </PermissionGuard>
        )}

        {hasExistingStructure && (
          <PermissionGuard action='Xóa sơ đồ ghế'>
            <Button
              onClick={handleDeleteSeatMap}
              disabled={isDeletingByEventCode}
              className='bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              size='sm'
            >
              {isDeletingByEventCode ? (
                <>
                  <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className='w-4 h-4 mr-1' />
                  Xóa sơ đồ ghế
                </>
              )}
            </Button>
          </PermissionGuard>
        )}

        {/* Export Button */}
        <PermissionGuard action='Xuất JSON' hideWithoutPermission>
          <Button
            onClick={exportToJSON}
            disabled={mapData.sections.length === 0}
            className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            size='sm'
          >
            <Download className='w-4 h-4 mr-1' />
            Xuất JSON
          </Button>
        </PermissionGuard>
      </div>

      {/* Capacity Info Badge */}
      {(() => {
        let totalSeats = 0
        mapData.sections.forEach((section) => {
          if (section.seats) {
            totalSeats += section.seats.length
          }
        })

        return totalSeats > 0 ? (
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-500 text-xs font-semibold animate-in fade-in zoom-in ${
              totalSeats > capacity
                ? 'bg-gradient-to-br from-red-600/95 to-red-700/95 text-white border border-red-400/50 shadow-red-500/30'
                : 'bg-gradient-to-br from-blue-600/95 to-blue-700/95 text-white border border-blue-400/50 shadow-blue-500/30'
            }`}
          >
            <div className='flex flex-col items-center gap-1'>
              <span className='text-[10px] opacity-90 uppercase tracking-wider'>Tổng ghế</span>
              <span className='text-2xl font-bold'>{totalSeats}</span>
              <div className='h-px w-full bg-white/20 my-1'></div>
              <span className='text-xs opacity-90'>Sức chứa: {capacity}</span>
              {totalSeats > capacity && (
                <div className='mt-1 px-2 py-1 bg-white/20 rounded text-[10px] text-red-100 animate-pulse font-bold'>
                  ⚠️ Vượt {totalSeats - capacity} ghế
                </div>
              )}
            </div>
          </div>
        ) : null
      })()}

      {/* Section Count Badge */}
      {mapData.sections.length > 0 && (
        <div className='px-4 py-2 rounded-xl bg-purple-600/90 backdrop-blur-xl border border-purple-400/50 shadow-lg text-white text-xs font-semibold animate-in fade-in duration-500'>
          <div className='flex flex-col items-center gap-1'>
            <span className='text-[10px] opacity-90 uppercase tracking-wider'>Khu vực</span>
            <span className='text-xl font-bold'>{mapData.sections.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
