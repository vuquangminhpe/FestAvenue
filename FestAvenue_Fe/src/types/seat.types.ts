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

export type SemiCircleOrientation = 'top' | 'bottom' | 'left' | 'right'

export type PointConstraint =
  | {
      type: 'circle'
      center: Point
      radius: number
    }
  | {
      type: 'ellipse'
      center: Point
      radiusX: number
      radiusY: number
      rotation?: number
    }
  | {
      type: 'semi-circle'
      center: Point
      radius: number
      orientation: SemiCircleOrientation
    }
  | {
      type: 'arc'
      center: Point
      radius: number
      startAngle: number
      endAngle: number
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
  hasSeats?: boolean // Nếu false, section không có ghế (standing zone, etc.)
  customSeatCount?: number // Số lượng ghế tùy chỉnh thay vì rows * seatsPerRow
  appearance?: {
    templateId: string
    customOverride?: Record<string, unknown>
  }
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

export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    color: string
    area: number
    label?: string
    index: number
    [key: string]: unknown
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface ExtractionResult {
  polygons: number[][][]
  colors: string[] // Màu sắc của từng section được trích xuất từ ảnh
  labels: string[] // Tên của từng section
  confidence_scores: number[]
  areas: number[]
  bounding_boxes: number[][]
  seat_groups: Record<string, number[]>
  detected_text: DetectedText[]
  geojson?: GeoJSON // GeoJSON format với thông tin chi tiết
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
