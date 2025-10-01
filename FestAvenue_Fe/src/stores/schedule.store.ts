import { create } from 'zustand'
import { scheduleService } from '../services/schedule.service'
import type { Schedule, ScheduleFilter, ScheduleView } from '@/types/schedule.types'

interface ScheduleState {
  schedules: Schedule[]
  allSchedules: Schedule[]
  selectedSchedule: Schedule | null
  filter: ScheduleFilter
  view: ScheduleView
  isLoading: boolean
  error: string | null

  // Actions
  fetchSchedules: () => Promise<void>
  fetchScheduleById: (id: string) => Promise<void>
  searchSchedules: (query: string) => void
  setFilter: (filter: Partial<ScheduleFilter>) => void
  setView: (view: ScheduleView) => void
  setSelectedSchedule: (schedule: Schedule | null) => void
  clearError: () => void
  refreshSchedules: () => Promise<void>
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  allSchedules: [],
  selectedSchedule: null,
  filter: {
    searchQuery: '',
    showCompleted: true,
    sortBy: 'startDate',
    sortOrder: 'asc'
  },
  view: 'month',
  isLoading: false,
  error: null,

  fetchSchedules: async () => {
    set({ isLoading: true, error: null })
    try {
      const schedules = await scheduleService.getAllSchedules()
      set({ schedules, allSchedules: schedules, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
        isLoading: false
      })
    }
  },

  fetchScheduleById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const schedule = await scheduleService.getScheduleById(id)
      set({ selectedSchedule: schedule, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch schedule',
        isLoading: false
      })
    }
  },

  searchSchedules: (query: string) => {
    const { allSchedules } = get()

    if (!query.trim()) {
      set({ schedules: allSchedules, filter: { ...get().filter, searchQuery: '' } })
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = allSchedules.filter((schedule) => {
      const titleMatch = schedule.title.toLowerCase().includes(lowercaseQuery)
      const descriptionMatch = schedule.description?.toLowerCase().includes(lowercaseQuery)
      const subTaskMatch = schedule.subTasks.some(
        (st) =>
          st.title.toLowerCase().includes(lowercaseQuery) || st.description?.toLowerCase().includes(lowercaseQuery)
      )
      return titleMatch || descriptionMatch || subTaskMatch
    })

    set({ schedules: filtered, filter: { ...get().filter, searchQuery: query } })
  },

  setFilter: (newFilter: Partial<ScheduleFilter>) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter }
    }))
  },

  setView: (view: ScheduleView) => {
    set({ view })
  },

  setSelectedSchedule: (schedule: Schedule | null) => {
    set({ selectedSchedule: schedule })
  },

  clearError: () => {
    set({ error: null })
  },

  refreshSchedules: async () => {
    await get().fetchSchedules()
    // Reset search after refresh
    set({ filter: { ...get().filter, searchQuery: '' } })
  }
}))
