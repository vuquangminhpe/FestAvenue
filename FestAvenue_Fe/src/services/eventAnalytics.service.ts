import type { EventAnalytics } from '../types/eventAnalytics.types'
import { mockEventAnalytics } from '../mocks/eventAnalytics.mock'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class EventAnalyticsService {
  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    await delay(800)
    // In real app, fetch from API with eventId
    return { ...mockEventAnalytics, summary: { ...mockEventAnalytics.summary, eventId } }
  }

  async getMultipleEventsAnalytics(eventIds: string[]): Promise<EventAnalytics[]> {
    await delay(1000)
    // In real app, fetch multiple events data
    return eventIds.map((id) => ({
      ...mockEventAnalytics,
      summary: { ...mockEventAnalytics.summary, eventId: id }
    }))
  }
}

export const eventAnalyticsService = new EventAnalyticsService()
