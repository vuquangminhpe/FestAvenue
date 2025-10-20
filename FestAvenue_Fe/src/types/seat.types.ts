export interface Point {
  x: number
  y: number
}

export interface Seat {
  id: string
  x: number
  y: number
  row: number
  number: number
  status: 'available' | 'occupied' | 'locked'
  section: string
  category?: 'vip' | 'premium' | 'standard'
  price?: number // Deprecated: Use ticketId instead
  email?: string
  ticketType?: 'vip' | 'premium' | 'standard' | 'economy' // Deprecated: Use ticketId instead
  ticketId?: string // ID của ticket từ API
}

export interface TicketType {
  id: string
  name: string
  displayName: string
  price: number
  color: string
}

export interface Section {
  id: string
  name: string
  displayName?: string
  points: Point[]
  path?: string
  color: string
  strokeColor?: string
  gradient?: { from: string; to: string }
  rows: number
  seatsPerRow: number
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
  shape?: 'polygon' | 'arc' | 'circle' | 'custom' | 'grid' | 'rectangle' | 'star' | 'crescent'
  seats?: Seat[]
  layer?: number
  category?: string
  position?: { x: number; y: number }
  angle?: number
  labelPosition?: { x: number; y: number }
  price?: number // Deprecated: Use ticketId instead
  ticketType?: 'vip' | 'premium' | 'standard' | 'economy' // Deprecated: Use ticketId instead
  ticketId?: string // ID của ticket từ API - áp dụng cho tất cả ghế trong section
}

export interface SeatMapData {
  sections: Section[]
  stage: { x: number; y: number; width: number; height: number }
  aisles?: { start: Point; end: Point; width: number }[]
}

export interface DetectedText {
  text: string
  confidence: number
  bbox: number[]
  language: string
}

export interface ExtractionResult {
  polygons: number[][][]
  confidence_scores: number[]
  areas: number[]
  bounding_boxes: number[][]
  labels: string[]
  seat_groups: Record<string, number[]>
  detected_text: DetectedText[]
  processing_info: {
    total_polygons: number
    processing_time: number
    model_type: string
    dominant_colors_found: number
    text_regions_detected: boolean
    roi_applied: boolean
    techniques_used: string[]
  }
  cache_hit: boolean
}

export type ShapeType = 'polygon' | 'rectangle' | 'circle' | 'star' | 'crescent' | 'arc' | 'custom'
export type EditTool = 'select' | 'move' | 'draw' | 'shape' | 'label' | 'split' | 'edit-points'
