import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  Eye,
  Edit,
  Trash2,
  Move,
  PenTool,
  X,
  Square,
  Circle,
  Triangle,
  Star,
  Moon,
  Hexagon,
  Shuffle,
  Palette,
  Grid,
  Layers,
  MousePointer,
  Sparkles
} from 'lucide-react'

// Types
interface Point {
  x: number
  y: number
}

interface Seat {
  id: string
  x: number
  y: number
  row: number
  number: number
  status: 'available' | 'occupied' | 'locked'
  section: string
  category?: 'vip' | 'premium' | 'standard'
}

interface Section {
  id: string
  name: string
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
}

interface Zone {
  id: string
  name: string
  bounds: { x: number; y: number; width: number; height: number }
  template: 'grid' | 'staggeredGrid' | 'arc' | 'radial' | 'wedge' | 'theaterCurve'
  priority: number
  density: number
}

interface SeatMapData {
  sections: Section[]
  stage: { x: number; y: number; width: number; height: number }
  aisles?: { start: Point; end: Point; width: number }[]
}

type ShapeType = 'polygon' | 'rectangle' | 'circle' | 'star' | 'crescent' | 'arc' | 'custom'
type EditTool = 'select' | 'move' | 'draw' | 'shape'
type LayoutStyle = 'theater' | 'smart-random'

// Advanced Layout Generator Class
class AdvancedLayoutGenerator {
  private colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']

  generateLayout(style: LayoutStyle, params: any): Section[] {
    const { rows = 15, cols = 20, layers = 3, density = 'normal', aisles = 2, symmetry = true } = params

    if (style === 'smart-random') {
      return this.generateSmartRandomLayout(rows, cols, layers, density, aisles, symmetry)
    }

    return this.generateTheaterLayout(rows, cols, layers)
  }

  private generateSmartRandomLayout(
    rows: number,
    cols: number,
    layers: number,
    density: string,
    numAisles: number,
    symmetry: boolean
  ): Section[] {
    const zones = this.partitionZones(layers, symmetry)
    const zoneTemplates = this.selectTemplatesForZones(zones)
    const aislePositions = this.planAisles(numAisles, symmetry)
    const sections: Section[] = []

    zoneTemplates.forEach((zone, index) => {
      const zoneSections = this.generateZoneSections(zone, rows, cols, density, aislePositions, index)
      sections.push(...zoneSections)
    })

    this.applyAestheticRules(sections, symmetry)
    this.resolveCollisions(sections)

    return sections
  }

  private partitionZones(layers: number, symmetry: boolean): Zone[] {
    const zones: Zone[] = []
    const baseY = 200

    zones.push({
      id: 'orchestra',
      name: 'Orchestra',
      bounds: { x: 200, y: baseY, width: 600, height: 120 },
      template: 'staggeredGrid',
      priority: 1,
      density: 1.0
    })

    if (layers > 1) {
      if (symmetry) {
        zones.push({
          id: 'mezz-left',
          name: 'Mezzanine Left',
          bounds: { x: 150, y: baseY + 130, width: 280, height: 100 },
          template: 'theaterCurve',
          priority: 2,
          density: 0.9
        })

        zones.push({
          id: 'mezz-right',
          name: 'Mezzanine Right',
          bounds: { x: 570, y: baseY + 130, width: 280, height: 100 },
          template: 'theaterCurve',
          priority: 2,
          density: 0.9
        })
      } else {
        zones.push({
          id: 'mezzanine',
          name: 'Mezzanine',
          bounds: { x: 200, y: baseY + 130, width: 600, height: 100 },
          template: 'arc',
          priority: 2,
          density: 0.85
        })
      }
    }

    if (layers > 2) {
      zones.push({
        id: 'balcony',
        name: 'Balcony',
        bounds: { x: 180, y: baseY + 240, width: 640, height: 90 },
        template: 'wedge',
        priority: 3,
        density: 0.75
      })
    }

    return zones
  }

  private selectTemplatesForZones(zones: Zone[]): Zone[] {
    return zones.map((zone) => {
      if (zone.id.includes('box')) {
        zone.template = 'grid'
      } else if (zone.id.includes('orchestra')) {
        zone.template = 'staggeredGrid'
      } else if (zone.id.includes('balcony')) {
        zone.template = 'wedge'
      }
      return zone
    })
  }

  private planAisles(numAisles: number, symmetry: boolean): number[] {
    const positions: number[] = []
    const centerX = 500

    if (numAisles === 0) return positions

    if (symmetry) {
      positions.push(centerX)
      if (numAisles > 1) {
        const spacing = 200
        for (let i = 1; i <= Math.floor(numAisles / 2); i++) {
          positions.push(centerX - spacing * i)
          positions.push(centerX + spacing * i)
        }
      }
    }

    return positions
  }

  private generateZoneSections(
    zone: Zone,
    rows: number,
    cols: number,
    density: string,
    aislePositions: number[],
    zoneIndex: number
  ): Section[] {
    const sections: Section[] = []
    const densityFactor = density === 'sparse' ? 0.7 : density === 'dense' ? 1.3 : 1.0

    const { x, y, width, height } = zone.bounds

    if (zone.template === 'staggeredGrid') {
      const aislesInZone = aislePositions.filter((pos) => pos > x && pos < x + width)

      if (aislesInZone.length === 0) {
        sections.push({
          id: `${zone.id}-grid`,
          name: zone.name,
          points: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
          ],
          color: this.colors[0],
          rows: Math.floor(rows * densityFactor),
          seatsPerRow: Math.floor(cols * densityFactor),
          bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height },
          shape: 'grid'
        })
      } else {
        const leftSection = {
          id: `${zone.id}-left`,
          name: `${zone.name} Left`,
          points: [
            { x, y },
            { x: aislesInZone[0] - 30, y },
            { x: aislesInZone[0] - 30, y: y + height },
            { x, y: y + height }
          ],
          color: this.colors[0],
          rows: Math.floor(rows * densityFactor),
          seatsPerRow: Math.floor((cols / 2) * densityFactor),
          bounds: { minX: x, maxX: aislesInZone[0] - 30, minY: y, maxY: y + height },
          shape: 'grid' as const
        }

        const rightSection = {
          id: `${zone.id}-right`,
          name: `${zone.name} Right`,
          points: [
            { x: aislesInZone[0] + 30, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x: aislesInZone[0] + 30, y: y + height }
          ],
          color: this.colors[0],
          rows: Math.floor(rows * densityFactor),
          seatsPerRow: Math.floor((cols / 2) * densityFactor),
          bounds: { minX: aislesInZone[0] + 30, maxX: x + width, minY: y, maxY: y + height },
          shape: 'grid' as const
        }

        sections.push(leftSection, rightSection)
      }
    } else if (zone.template === 'theaterCurve') {
      const path = d3.path()
      const centerX = x + width / 2
      const curveHeight = 20

      path.moveTo(x, y)
      path.quadraticCurveTo(centerX, y - curveHeight, x + width, y)
      path.lineTo(x + width, y + height)
      path.quadraticCurveTo(centerX, y + height + curveHeight, x, y + height)
      path.closePath()

      sections.push({
        id: `${zone.id}-curve`,
        name: zone.name,
        points: [],
        path: path.toString(),
        color: this.colors[zoneIndex % this.colors.length],
        rows: Math.floor(rows * densityFactor * 0.8),
        seatsPerRow: Math.floor(cols * densityFactor),
        shape: 'custom'
      })
    } else if (zone.template === 'arc') {
      const centerX = x + width / 2
      const centerY = y + height
      const radius = Math.min(width / 2, height) * 1.2

      const path = d3.path()
      path.arc(centerX, centerY, radius, Math.PI * 1.2, Math.PI * -0.2)
      path.arc(centerX, centerY, radius - 40, Math.PI * -0.2, Math.PI * 1.2, true)
      path.closePath()

      sections.push({
        id: `${zone.id}-arc`,
        name: zone.name,
        points: [],
        path: path.toString(),
        color: this.colors[zoneIndex % this.colors.length],
        rows: Math.floor(rows * densityFactor * 0.7),
        seatsPerRow: Math.floor(cols * densityFactor * 0.8),
        shape: 'arc'
      })
    } else if (zone.template === 'wedge') {
      const numWedges = 3
      const wedgeWidth = width / numWedges

      for (let i = 0; i < numWedges; i++) {
        const wedgeX = x + i * wedgeWidth
        const topWidth = wedgeWidth * 0.7
        const bottomWidth = wedgeWidth * 0.95
        const offset = (wedgeWidth - topWidth) / 2

        sections.push({
          id: `${zone.id}-wedge-${i}`,
          name: `${zone.name} ${i + 1}`,
          points: [
            { x: wedgeX + offset, y },
            { x: wedgeX + offset + topWidth, y },
            { x: wedgeX + bottomWidth, y: y + height },
            { x: wedgeX, y: y + height }
          ],
          color: this.colors[(zoneIndex + i) % this.colors.length],
          rows: Math.floor(rows * densityFactor * 0.6),
          seatsPerRow: Math.floor((cols * densityFactor) / numWedges),
          shape: 'polygon'
        })
      }
    } else {
      sections.push({
        id: `${zone.id}-default`,
        name: zone.name,
        points: [
          { x, y },
          { x: x + width, y },
          { x: x + width, y: y + height },
          { x, y: y + height }
        ],
        color: this.colors[zoneIndex % this.colors.length],
        rows: Math.floor(rows * densityFactor),
        seatsPerRow: Math.floor(cols * densityFactor),
        bounds: { minX: x, maxX: x + width, minY: y, maxY: y + height },
        shape: 'grid'
      })
    }

    return sections
  }

  private applyAestheticRules(sections: Section[], symmetry: boolean) {
    if (!symmetry) return

    const centerX = 500
    sections.forEach((section) => {
      const mirrorName = section.name.includes('Left')
        ? section.name.replace('Left', 'Right')
        : section.name.replace('Right', 'Left')

      const mirrorSection = sections.find((s) => s.name === mirrorName)

      if (mirrorSection && section.points.length > 0) {
        mirrorSection.points = section.points.map((p) => ({
          x: centerX + (centerX - p.x),
          y: p.y
        }))
      }
    })
  }

  private resolveCollisions(sections: Section[]) {
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const s1 = sections[i]
        const s2 = sections[j]

        if (s1.bounds && s2.bounds) {
          const overlap = !(
            s1.bounds.maxX < s2.bounds.minX ||
            s2.bounds.maxX < s1.bounds.minX ||
            s1.bounds.maxY < s2.bounds.minY ||
            s2.bounds.maxY < s1.bounds.minY
          )

          if (overlap) {
            const shrinkFactor = 0.95
            s1.bounds.maxX = s1.bounds.minX + (s1.bounds.maxX - s1.bounds.minX) * shrinkFactor
            s1.bounds.maxY = s1.bounds.minY + (s1.bounds.maxY - s1.bounds.minY) * shrinkFactor
          }
        }
      }
    }
  }

  private generateTheaterLayout(rows: number, cols: number, layers: number): Section[] {
    const sections: Section[] = []
    const aisleX = 500
    const aisleWidth = 60

    sections.push({
      id: 'orchestra-left',
      name: 'Orchestra Left',
      points: [
        { x: 200, y: 200 },
        { x: aisleX - aisleWidth / 2, y: 200 },
        { x: aisleX - aisleWidth / 2, y: 350 },
        { x: 200, y: 350 }
      ],
      color: this.colors[0],
      rows: rows,
      seatsPerRow: Math.floor(cols / 2 - 1),
      bounds: { minX: 200, maxX: aisleX - aisleWidth / 2, minY: 200, maxY: 350 },
      shape: 'grid',
      layer: 0
    })

    sections.push({
      id: 'orchestra-right',
      name: 'Orchestra Right',
      points: [
        { x: aisleX + aisleWidth / 2, y: 200 },
        { x: 800, y: 200 },
        { x: 800, y: 350 },
        { x: aisleX + aisleWidth / 2, y: 350 }
      ],
      color: this.colors[0],
      rows: rows,
      seatsPerRow: Math.floor(cols / 2 - 1),
      bounds: { minX: aisleX + aisleWidth / 2, maxX: 800, minY: 200, maxY: 350 },
      shape: 'grid',
      layer: 0
    })

    for (let level = 1; level < layers; level++) {
      const mezzY = 350 + level * 100
      const curve = 20 * level

      const mezzPath = d3.path()
      mezzPath.moveTo(200 - level * 20, mezzY)
      mezzPath.quadraticCurveTo(500, mezzY - curve, 800 + level * 20, mezzY)
      mezzPath.lineTo(800 + level * 20, mezzY + 60)
      mezzPath.quadraticCurveTo(500, mezzY + 60 + curve, 200 - level * 20, mezzY + 60)
      mezzPath.closePath()

      sections.push({
        id: `mezzanine-${level}`,
        name: `Mezzanine ${level}`,
        points: [],
        path: mezzPath.toString(),
        color: this.colors[level],
        rows: Math.floor(rows * 0.7),
        seatsPerRow: cols + level * 2,
        shape: 'custom',
        layer: level
      })
    }

    return sections
  }
}

// Seat Interaction Manager Class
class SeatInteractionManager {
  private animationQueue: Map<string, any> = new Map()
  private seatStates: Map<string, 'available' | 'occupied' | 'locked'> = new Map()

  toggleSeat(
    seatElement: HTMLElement,
    seatId: string,
    onStatusChange: (seatId: string, newStatus: 'available' | 'occupied') => void
  ): boolean {
    const currentStatus = this.seatStates.get(seatId) || 'available'

    if (currentStatus === 'locked') {
      this.showLockedFeedback(seatElement)
      return false
    }

    if (this.animationQueue.has(seatId)) {
      return false
    }

    this.animationQueue.set(seatId, true)

    if (currentStatus === 'occupied') {
      this.animateCharacterLeaving(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'available')
        onStatusChange(seatId, 'available')
        this.animationQueue.delete(seatId)
      })
    } else {
      this.animateCharacterEntering(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'occupied')
        onStatusChange(seatId, 'occupied')
        this.animationQueue.delete(seatId)
      })
    }

    return true
  }

  setSeatStatus(seatId: string, status: 'available' | 'occupied' | 'locked') {
    this.seatStates.set(seatId, status)
  }

  getSeatStatus(seatId: string): 'available' | 'occupied' | 'locked' {
    return this.seatStates.get(seatId) || 'available'
  }

  private animateCharacterLeaving(seatElement: HTMLElement, seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }
    console.log(seatId)

    const character = seatElement.querySelector('.seated-character')
    if (!character) {
      onComplete()
      return
    }

    const seat = seatElement.querySelector('.cinema-seat') as HTMLElement
    const col = parseInt(seatElement.dataset.col || '0')

    const tl = window.gsap.timeline({
      onComplete: () => {
        character.remove()
        if (seat) {
          seat.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          const seatBack = seat.querySelector('.seat-back') as HTMLElement
          if (seatBack) {
            seatBack.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          }
        }
        onComplete()
      }
    })

    tl.to(character, {
      y: -20,
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out'
    }).to(character, {
      x: col < 6 ? -250 : 250,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    })
  }

  private animateCharacterEntering(seatElement: HTMLElement, seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }
    console.log(seatId)

    const col = parseInt(seatElement.dataset.col || '0')

    const character = document.createElement('div')
    character.className = 'walking-character'
    character.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: ${col < 6 ? '-150px' : 'calc(100% + 150px)'};
      width: 40px;
      height: 60px;
      z-index: 100;
    `

    character.innerHTML = this.getCharacterSVG(false)
    seatElement.appendChild(character)

    const seat = seatElement.querySelector('.cinema-seat') as HTMLElement

    const tl = window.gsap.timeline({
      onComplete: () => {
        character.remove()

        const seatedChar = document.createElement('div')
        seatedChar.className = 'seated-character'
        seatedChar.style.cssText = `
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 50px;
          pointer-events: none;
          z-index: 5;
        `
        seatedChar.innerHTML = this.getCharacterSVG(true)
        seatElement.appendChild(seatedChar)

        if (seat) {
          seat.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          const seatBack = seat.querySelector('.seat-back') as HTMLElement
          if (seatBack) {
            seatBack.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          }
        }

        window.gsap.fromTo(
          seatedChar,
          { opacity: 0, scale: 0.5, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
        )

        onComplete()
      }
    })

    tl.to(character, {
      left: '50%',
      x: '-50%',
      duration: 0.8,
      ease: 'power2.inOut'
    }).to(character, {
      y: 5,
      scale: 0.9,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  private getCharacterSVG(isSeated: boolean): string {
    if (isSeated) {
      return `
        <svg width="40" height="50" viewBox="0 0 40 50">
          <ellipse cx="20" cy="12" rx="10" ry="12" fill="#fdbcb4"/>
          <rect x="12" y="20" width="16" height="20" fill="#3b82f6" rx="2"/>
          <rect x="14" y="40" width="5" height="8" fill="#1f2937"/>
          <rect x="21" y="40" width="5" height="8" fill="#1f2937"/>
          <circle cx="16" cy="10" r="1.5" fill="#000"/>
          <circle cx="24" cy="10" r="1.5" fill="#000"/>
          <path d="M 16 14 Q 20 16 24 14" stroke="#000" stroke-width="1" fill="none"/>
        </svg>
      `
    } else {
      return `
        <svg width="40" height="60" viewBox="0 0 40 60">
          <ellipse cx="20" cy="15" rx="12" ry="15" fill="#fdbcb4"/>
          <rect x="10" y="25" width="20" height="25" fill="#3b82f6" rx="2"/>
          <rect class="leg" x="12" y="50" width="6" height="10" fill="#1f2937"/>
          <rect class="leg" x="22" y="50" width="6" height="10" fill="#1f2937"/>
          <circle cx="15" cy="12" r="2" fill="#000"/>
          <circle cx="25" cy="12" r="2" fill="#000"/>
        </svg>
      `
    }
  }

  private showLockedFeedback(seatElement: HTMLElement) {
    if (!window.gsap) return

    window.gsap.to(seatElement, {
      x: -2,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
      onComplete: () => {
        window.gsap.set(seatElement, { x: 0 })
      }
    })

    const lockIcon = document.createElement('div')
    lockIcon.innerHTML = '🔒'
    lockIcon.style.cssText = `
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      z-index: 1000;
    `
    seatElement.appendChild(lockIcon)

    window.gsap.to(lockIcon, {
      y: -10,
      opacity: 0,
      duration: 1,
      onComplete: () => lockIcon.remove()
    })
  }

  clearState() {
    this.animationQueue.clear()
    this.seatStates.clear()
  }
}

// Main Component
export default function AdvancedCinemaSeatMapDesigner() {
  const svgRef = useRef<SVGSVGElement>(null)
  const seat3DRef = useRef<HTMLDivElement>(null)
  const layoutGeneratorRef = useRef(new AdvancedLayoutGenerator())
  const seatManagerRef = useRef(new SeatInteractionManager())

  const [mode, setMode] = useState<'edit' | 'preview' | 'quick-booking'>('edit')
  const [editTool, setEditTool] = useState<EditTool>('select')
  const [selectedShape, setSelectedShape] = useState<ShapeType>('polygon')
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [mapData, setMapData] = useState<SeatMapData>({
    sections: [],
    stage: { x: 350, y: 50, width: 300, height: 80 },
    aisles: []
  })
  const [is3DView, setIs3DView] = useState(false)
  const [seatStatuses, setSeatStatuses] = useState<Map<string, 'available' | 'occupied' | 'locked'>>(new Map())
  const [layoutParams, setLayoutParams] = useState({
    rows: 12,
    cols: 16,
    layers: 3,
    density: 'normal' as 'sparse' | 'normal' | 'dense',
    aisles: 2,
    symmetry: true
  })
  const [sectionConfig, setSectionConfig] = useState({ rows: 8, seatsPerRow: 12 })
  const [colorPicker, setColorPicker] = useState({
    fill: '#3498db',
    stroke: '#2980b9',
    useGradient: false,
    gradientFrom: '#667eea',
    gradientTo: '#764ba2'
  })

  useEffect(() => {
    const loadGSAP = () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        script.async = true
        document.head.appendChild(script)
      }
    }
    loadGSAP()
  }, [])

  const generateShapePath = useCallback((type: ShapeType, center: Point, size: number = 100): string => {
    const path = d3.path()

    switch (type) {
      case 'rectangle':
        path.rect(center.x - size / 2, center.y - size / 2, size, size * 0.7)
        break
      case 'circle':
        path.arc(center.x, center.y, size / 2, 0, 2 * Math.PI)
        break
      case 'star':
        const outerRadius = size / 2
        const innerRadius = size / 4
        const points = 5
        for (let i = 0; i < points * 2; i++) {
          const angle = (Math.PI * i) / points - Math.PI / 2
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const x = center.x + Math.cos(angle) * radius
          const y = center.y + Math.sin(angle) * radius
          i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)
        }
        path.closePath()
        break
      case 'crescent':
        path.arc(center.x, center.y, size / 2, Math.PI * 0.3, Math.PI * 1.7)
        path.arc(center.x + size / 4, center.y, size / 2.5, Math.PI * 1.5, Math.PI * 0.5, true)
        break
      case 'arc':
        path.arc(center.x, center.y, size / 2, Math.PI, 0)
        path.lineTo(center.x + size / 3, center.y)
        path.arc(center.x, center.y, size / 3, 0, Math.PI, true)
        path.closePath()
        break
    }

    return path.toString()
  }, [])

  const createShapeSection = (center: Point) => {
    const path = generateShapePath(selectedShape, center)
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `${selectedShape} ${mapData.sections.length + 1}`,
      points: [],
      path,
      color: colorPicker.useGradient ? '#3498db' : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      shape: selectedShape === 'polygon' ? 'custom' : selectedShape
    }

    newSection.seats = generateSeatsForSection(newSection)

    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })
  }

  const createSectionFromPoints = (points: Point[]) => {
    const bounds = calculateBounds(points)
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `Section ${mapData.sections.length + 1}`,
      points: points,
      color: colorPicker.useGradient ? '#3498db' : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      bounds,
      shape: 'polygon'
    }

    newSection.seats = generateSeatsForSection(newSection)
    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })
  }

  const generateSeatsForSection = useCallback(
    (section: Section): Seat[] => {
      const seats: Seat[] = []

      if (section.bounds || section.points.length > 0) {
        const bounds = section.bounds || calculateBounds(section.points)
        const { minX, minY, maxX, maxY } = bounds
        const width = maxX - minX
        const height = maxY - minY

        const seatSpacingX = width / section.seatsPerRow
        const seatSpacingY = height / section.rows

        for (let row = 0; row < section.rows; row++) {
          for (let col = 0; col < section.seatsPerRow; col++) {
            const x = minX + col * seatSpacingX + seatSpacingX / 2
            const y = minY + row * seatSpacingY + seatSpacingY / 2

            if (!section.points.length || isPointInPolygon({ x, y }, section.points)) {
              const seatId = `${section.id}-R${row + 1}-S${col + 1}`
              const status = seatStatuses.get(seatId) || 'available'
              seats.push({
                id: seatId,
                x,
                y,
                row: row + 1,
                number: col + 1,
                section: section.id,
                status: status,
                category: section.category === 'vip' ? 'vip' : 'standard'
              })
            }
          }
        }
      }

      return seats
    },
    [seatStatuses]
  )

  const calculateBounds = (points: Point[]) => {
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  }

  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y
      const xj = polygon[j].x,
        yj = polygon[j].y
      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }

  const generateAutoLayout = useCallback(
    (style: LayoutStyle) => {
      const generator = layoutGeneratorRef.current
      const newSections = generator.generateLayout(style, layoutParams)

      const updatedSections = newSections.map((section) => {
        const seats = generateSeatsForSection(section)
        return { ...section, seats }
      })

      seatManagerRef.current.clearState()
      updatedSections.forEach((section) => {
        section.seats?.forEach((seat) => {
          seatManagerRef.current.setSeatStatus(seat.id, seat.status)
        })
      })

      setMapData({
        ...mapData,
        sections: updatedSections,
        aisles: layoutParams.aisles > 0 ? [{ start: { x: 470, y: 150 }, end: { x: 470, y: 550 }, width: 60 }] : []
      })
    },
    [mapData.stage, layoutParams, generateSeatsForSection]
  )

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('class', 'main-group')

    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    if (mode === 'preview' || mode === 'quick-booking') {
      svg.call(zoom as any)
    }

    if (mode === 'edit') {
      if (editTool === 'draw' && isDrawing) {
        svg.on('click', handleSvgClick)
      } else if (editTool === 'shape') {
        svg.on('click', (event) => {
          const [x, y] = d3.pointer(event)
          createShapeSection({ x, y })
        })
      } else {
        svg.on('click', null)
      }
    }

    renderMap(g)
  }, [mapData, mode, editTool, isDrawing, drawingPoints, selectedSection, seatStatuses, colorPicker])

  const handleSvgClick = (event: any) => {
    if (!isDrawing || editTool !== 'draw') return

    const [x, y] = d3.pointer(event)
    const newPoints = [...drawingPoints, { x, y }]
    setDrawingPoints(newPoints)

    if (newPoints.length > 2) {
      const first = newPoints[0]
      const distance = Math.sqrt(Math.pow(x - first.x, 2) + Math.pow(y - first.y, 2))

      if (distance < 20) {
        createSectionFromPoints(newPoints.slice(0, -1))
        setDrawingPoints([])
        setIsDrawing(false)
      }
    }
  }

  const renderMap = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    g.selectAll('*').remove()

    const defs = g.append('defs')

    const stageGradient = defs
      .append('linearGradient')
      .attr('id', 'stage-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
    stageGradient.append('stop').attr('offset', '0%').style('stop-color', '#667eea')
    stageGradient.append('stop').attr('offset', '100%').style('stop-color', '#764ba2')

    mapData.sections.forEach((section, i) => {
      if (section.gradient) {
        const grad = defs
          .append('linearGradient')
          .attr('id', `section-gradient-${i}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%')
        grad.append('stop').attr('offset', '0%').style('stop-color', section.gradient.from)
        grad.append('stop').attr('offset', '100%').style('stop-color', section.gradient.to)
      }
    })

    const stage = g.append('g').attr('class', 'stage')
    stage
      .append('rect')
      .attr('x', mapData.stage.x)
      .attr('y', mapData.stage.y)
      .attr('width', mapData.stage.width)
      .attr('height', mapData.stage.height)
      .attr('fill', 'url(#stage-gradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 10)

    stage
      .append('text')
      .attr('x', mapData.stage.x + mapData.stage.width / 2)
      .attr('y', mapData.stage.y + mapData.stage.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text('STAGE')

    if (mapData.aisles) {
      const aisles = g.append('g').attr('class', 'aisles')
      mapData.aisles.forEach((aisle) => {
        aisles
          .append('rect')
          .attr('x', aisle.start.x - aisle.width / 2)
          .attr('y', aisle.start.y)
          .attr('width', aisle.width)
          .attr('height', aisle.end.y - aisle.start.y)
          .attr('fill', 'rgba(255,255,255,0.05)')
          .attr('stroke', 'rgba(255,255,255,0.2)')
          .attr('stroke-dasharray', '5,5')
      })
    }

    mapData.sections.forEach((section, index) => {
      const sectionGroup = g
        .append('g')
        .attr('class', `section section-${section.id}`)
        .style('opacity', section.layer ? 1 - section.layer * 0.1 : 1)

      let sectionElement
      if (section.path) {
        sectionElement = sectionGroup
          .append('path')
          .attr('d', section.path)
          .attr('fill', section.gradient ? `url(#section-gradient-${index})` : section.color)
          .attr('fill-opacity', 0.3)
          .attr('stroke', section.strokeColor || section.color)
          .attr('stroke-width', selectedSection?.id === section.id ? 3 : 2)
          .attr('cursor', 'pointer')
      } else if (section.points.length > 0) {
        const polygonPoints = section.points.map((p) => `${p.x},${p.y}`).join(' ')
        sectionElement = sectionGroup
          .append('polygon')
          .attr('points', polygonPoints)
          .attr('fill', section.gradient ? `url(#section-gradient-${index})` : section.color)
          .attr('fill-opacity', 0.3)
          .attr('stroke', section.strokeColor || section.color)
          .attr('stroke-width', selectedSection?.id === section.id ? 3 : 2)
          .attr('cursor', 'pointer')
      }

      if (mode === 'edit' && editTool === 'select' && sectionElement) {
        sectionElement.on('click', (event) => {
          event.stopPropagation()
          setSelectedSection(section)
        })
      }

      if (mode === 'edit' && editTool === 'move' && selectedSection?.id === section.id && sectionElement) {
        const drag = d3.drag().on('drag', (event) => {
          const dx = event.dx
          const dy = event.dy

          const newSections = mapData.sections.map((s) => {
            if (s.id === selectedSection.id) {
              const newPoints = s.points.map((p) => ({
                x: p.x + dx,
                y: p.y + dy
              }))
              const newBounds = s.bounds
                ? {
                    minX: s.bounds.minX + dx,
                    maxX: s.bounds.maxX + dx,
                    minY: s.bounds.minY + dy,
                    maxY: s.bounds.maxY + dy
                  }
                : undefined

              const newSeats = s.seats?.map((seat) => ({
                ...seat,
                x: seat.x + dx,
                y: seat.y + dy
              }))

              return { ...s, points: newPoints, bounds: newBounds, seats: newSeats }
            }
            return s
          })

          setMapData({ ...mapData, sections: newSections })
        })

        sectionGroup.call(drag as any)
      }

      if (section.bounds || section.points.length > 0) {
        const bounds = section.bounds || calculateBounds(section.points)
        sectionGroup
          .append('text')
          .attr('x', bounds.minX + (bounds.maxX - bounds.minX) / 2)
          .attr('y', bounds.minY - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', section.strokeColor || section.color)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(section.name)
      }

      if (mode === 'preview' || mode === 'quick-booking') {
        const seats = section.seats || generateSeatsForSection(section)

        seats.forEach((seat) => {
          const status = seatStatuses.get(seat.id) || seat.status

          const hitboxGroup = sectionGroup
            .append('g')
            .attr('class', `seat-group seat-${seat.id}`)
            .style('cursor', status === 'locked' ? 'not-allowed' : 'pointer')

          hitboxGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y)
            .attr('r', 12)
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')

          hitboxGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y)
            .attr('r', 5)
            .attr(
              'fill',
              status === 'locked'
                ? '#6b7280'
                : status === 'occupied'
                ? '#ef4444'
                : seat.category === 'vip'
                ? '#ffd700'
                : '#22c55e'
            )
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')

          if (status === 'locked') {
            hitboxGroup
              .append('text')
              .attr('x', seat.x)
              .attr('y', seat.y + 1)
              .attr('text-anchor', 'middle')
              .attr('font-size', '8px')
              .attr('fill', 'white')
              .attr('pointer-events', 'none')
              .text('🔒')
          }

          if (mode === 'quick-booking') {
            hitboxGroup.on('click', (event) => {
              event.stopPropagation()
              handleQuickSeatToggle(seat.id, status)
            })
          }

          hitboxGroup
            .on('mouseover', function () {
              if (status !== 'locked') {
                d3.select(this).select('circle').attr('r', 7)

                const tooltip = g.append('g').attr('class', 'tooltip')
                tooltip
                  .append('rect')
                  .attr('x', seat.x - 35)
                  .attr('y', seat.y - 30)
                  .attr('width', 70)
                  .attr('height', 20)
                  .attr('fill', 'rgba(0,0,0,0.9)')
                  .attr('rx', 3)

                tooltip
                  .append('text')
                  .attr('x', seat.x)
                  .attr('y', seat.y - 15)
                  .attr('text-anchor', 'middle')
                  .attr('fill', 'white')
                  .attr('font-size', '11px')
                  .text(`${section.name} R${seat.row}S${seat.number}`)
              }
            })
            .on('mouseout', function () {
              if (status !== 'locked') {
                d3.select(this).select('circle').attr('r', 5)
              }
              g.selectAll('.tooltip').remove()
            })
        })

        if (mode === 'preview' && sectionElement) {
          sectionElement.on('click', () => openCinema3DView(section))
        }
      }
    })

    if (isDrawing && drawingPoints.length > 0) {
      const drawGroup = g.append('g').attr('class', 'drawing-preview')

      for (let i = 0; i < drawingPoints.length - 1; i++) {
        drawGroup
          .append('line')
          .attr('x1', drawingPoints[i].x)
          .attr('y1', drawingPoints[i].y)
          .attr('x2', drawingPoints[i + 1].x)
          .attr('y2', drawingPoints[i + 1].y)
          .attr('stroke', '#00ff00')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
      }

      drawingPoints.forEach((point, index) => {
        drawGroup
          .append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', index === 0 ? 8 : 5)
          .attr('fill', index === 0 ? '#ff0000' : '#00ff00')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
      })
    }
  }

  const handleQuickSeatToggle = (seatId: string, currentStatus: string) => {
    if (currentStatus === 'locked') return

    const newStatus = currentStatus === 'occupied' ? 'available' : 'occupied'
    setSeatStatuses((prev) => new Map(prev).set(seatId, newStatus))
    seatManagerRef.current.setSeatStatus(seatId, newStatus)
  }

  const openCinema3DView = (section: Section) => {
    setSelectedSection(section)
    setIs3DView(true)
    setTimeout(() => createCinema3DSeats(section), 100)
  }

  const createCinema3DSeats = (section: Section) => {
    if (!seat3DRef.current || !window.gsap) return

    const container = seat3DRef.current
    container.innerHTML = ''

    const cinemaWrapper = document.createElement('div')
    cinemaWrapper.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1500px;
    `

    const cinemaContainer = document.createElement('div')
    cinemaContainer.style.cssText = `
      transform-style: preserve-3d;
      transform: rotateX(20deg);
      padding: 50px;
    `

    const screen = document.createElement('div')
    screen.style.cssText = `
      width: 600px;
      height: 100px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      margin-bottom: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    `
    screen.textContent = section.name.toUpperCase()
    cinemaContainer.appendChild(screen)

    const seatsContainer = document.createElement('div')
    seatsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    `

    for (let row = 0; row < section.rows; row++) {
      const rowContainer = document.createElement('div')
      rowContainer.style.cssText = `display: flex; gap: 10px; justify-content: center;`

      for (let col = 0; col < section.seatsPerRow; col++) {
        rowContainer.appendChild(create3DSeatElement(section, row, col))
      }

      seatsContainer.appendChild(rowContainer)
    }

    cinemaContainer.appendChild(seatsContainer)
    cinemaWrapper.appendChild(cinemaContainer)
    container.appendChild(cinemaWrapper)

    const allSeats = container.querySelectorAll('.cinema-seat')
    window.gsap.fromTo(
      allSeats,
      { opacity: 0, scale: 0, rotationY: -180 },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        stagger: 0.015,
        ease: 'back.out(1.2)'
      }
    )
  }

  const create3DSeatElement = (section: Section, row: number, col: number): HTMLElement => {
    const seatId = `${section.id}-R${row + 1}-S${col + 1}`
    const status = seatManagerRef.current.getSeatStatus(seatId)
    const isLocked = status === 'locked'
    const isOccupied = status === 'occupied'

    const seatWrapper = document.createElement('div')
    seatWrapper.style.cssText = `
      position: relative;
      cursor: ${isLocked ? 'not-allowed' : 'pointer'};
    `
    seatWrapper.dataset.seatId = seatId
    seatWrapper.dataset.row = String(row)
    seatWrapper.dataset.col = String(col)

    const seat = document.createElement('div')
    seat.className = 'cinema-seat'
    seat.style.cssText = `
      width: 55px;
      height: 65px;
      background: ${
        isLocked
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          : isOccupied
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      };
      border-radius: 10px 10px 20px 20px;
      position: relative;
      transform-style: preserve-3d;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      ${isLocked ? 'opacity: 0.6;' : ''}
    `

    const seatBack = document.createElement('div')
    seatBack.className = 'seat-back'
    seatBack.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 35px;
      background: ${
        isLocked
          ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
          : isOccupied
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
      };
      border-radius: 10px 10px 5px 5px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `

    const seatNumber = document.createElement('div')
    seatNumber.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
      pointer-events: none;
      z-index: 10;
    `
    seatNumber.textContent = isLocked ? '🔒' : `${row + 1}-${col + 1}`

    seat.appendChild(seatBack)
    seat.appendChild(seatNumber)
    seatWrapper.appendChild(seat)

    if (isOccupied && !isLocked) {
      const character = document.createElement('div')
      character.className = 'seated-character'
      character.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 50px;
        pointer-events: none;
        z-index: 5;
      `
      character.innerHTML = seatManagerRef.current['getCharacterSVG'](true)
      seatWrapper.appendChild(character)
    }

    if (!isLocked) {
      seatWrapper.addEventListener('click', (e) => {
        e.stopPropagation()

        seatManagerRef.current.toggleSeat(seatWrapper, seatId, (id, newStatus) => {
          setSeatStatuses((prev) => new Map(prev).set(id, newStatus))
        })
      })
    }

    if (!isLocked) {
      seatWrapper.addEventListener('mouseenter', () => {
        if (window.gsap) {
          window.gsap.to(seat, {
            scale: 1.08,
            y: -3,
            duration: 0.2,
            ease: 'power2.out'
          })
        }
      })

      seatWrapper.addEventListener('mouseleave', () => {
        if (window.gsap) {
          window.gsap.to(seat, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.out'
          })
        }
      })
    }

    return seatWrapper
  }

  const close3DView = () => {
    setIs3DView(false)
    setSelectedSection(null)
    if (seat3DRef.current) {
      seat3DRef.current.innerHTML = ''
    }
  }

  const deleteSection = (sectionId: string) => {
    setMapData({
      ...mapData,
      sections: mapData.sections.filter((s) => s.id !== sectionId)
    })
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null)
    }
  }

  const exportToJSON = () => {
    const data = {
      ...mapData,
      seatStatuses: Array.from(seatStatuses.entries())
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `cinema-layout-${Date.now()}.json`)
    linkElement.click()
  }

  return (
    <div className='w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4'>
      <div className='max-w-7xl mx-auto h-full flex flex-col gap-4'>
        <Card className='bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                🎬 Advanced Cinema Seat Map Designer
              </CardTitle>
              <div className='flex gap-2'>
                <Button
                  onClick={() => setMode('edit')}
                  variant={mode === 'edit' ? 'default' : 'outline'}
                  size='sm'
                  className={mode === 'edit' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                >
                  <Edit className='w-4 h-4 mr-1' />
                  Design
                </Button>
                <Button
                  onClick={() => setMode('quick-booking')}
                  variant={mode === 'quick-booking' ? 'default' : 'outline'}
                  size='sm'
                  className={mode === 'quick-booking' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
                >
                  <MousePointer className='w-4 h-4 mr-1' />
                  Quick Book
                </Button>
                <Button
                  onClick={() => setMode('preview')}
                  variant={mode === 'preview' ? 'default' : 'outline'}
                  size='sm'
                  className={mode === 'preview' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : ''}
                >
                  <Eye className='w-4 h-4 mr-1' />
                  3D View
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className='flex-1 flex gap-4'>
          <Card className='w-80 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl overflow-y-auto'>
            <CardContent className='p-4 space-y-4'>
              {mode === 'edit' && (
                <>
                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Layers className='w-4 h-4' />
                      Edit Tools
                    </h3>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        onClick={() => setEditTool('select')}
                        variant={editTool === 'select' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'select' ? 'bg-purple-600' : ''}
                      >
                        <MousePointer className='w-3 h-3 mr-1' />
                        Select
                      </Button>
                      <Button
                        onClick={() => setEditTool('move')}
                        variant={editTool === 'move' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'move' ? 'bg-blue-600' : ''}
                      >
                        <Move className='w-3 h-3 mr-1' />
                        Move
                      </Button>
                      <Button
                        onClick={() => setEditTool('draw')}
                        variant={editTool === 'draw' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'draw' ? 'bg-green-600' : ''}
                      >
                        <PenTool className='w-3 h-3 mr-1' />
                        Draw
                      </Button>
                      <Button
                        onClick={() => setEditTool('shape')}
                        variant={editTool === 'shape' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'shape' ? 'bg-orange-600' : ''}
                      >
                        <Hexagon className='w-3 h-3 mr-1' />
                        Shape
                      </Button>
                    </div>
                  </div>

                  {editTool === 'shape' && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-semibold text-purple-300'>Shape Type</h3>
                      <div className='grid grid-cols-3 gap-2'>
                        {['rectangle', 'circle', 'star', 'crescent', 'arc', 'polygon'].map((shape) => (
                          <Button
                            key={shape}
                            onClick={() => setSelectedShape(shape as ShapeType)}
                            variant={selectedShape === shape ? 'default' : 'outline'}
                            size='sm'
                          >
                            {shape === 'rectangle' && <Square className='w-4 h-4' />}
                            {shape === 'circle' && <Circle className='w-4 h-4' />}
                            {shape === 'star' && <Star className='w-4 h-4' />}
                            {shape === 'crescent' && <Moon className='w-4 h-4' />}
                            {shape === 'arc' && <Triangle className='w-4 h-4' />}
                            {shape === 'polygon' && <Hexagon className='w-4 h-4' />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(editTool === 'draw' || editTool === 'shape' || selectedSection) && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                        <Palette className='w-4 h-4' />
                        Colors
                      </h3>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <label className='text-xs text-gray-400'>Use Gradient</label>
                          <input
                            type='checkbox'
                            checked={colorPicker.useGradient}
                            onChange={(e) => setColorPicker({ ...colorPicker, useGradient: e.target.checked })}
                            className='rounded'
                          />
                        </div>
                        {!colorPicker.useGradient ? (
                          <>
                            <div>
                              <label className='text-xs text-gray-400'>Fill Color</label>
                              <input
                                type='color'
                                value={colorPicker.fill}
                                onChange={(e) => setColorPicker({ ...colorPicker, fill: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                            <div>
                              <label className='text-xs text-gray-400'>Stroke Color</label>
                              <input
                                type='color'
                                value={colorPicker.stroke}
                                onChange={(e) => setColorPicker({ ...colorPicker, stroke: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className='text-xs text-gray-400'>Gradient From</label>
                              <input
                                type='color'
                                value={colorPicker.gradientFrom}
                                onChange={(e) => setColorPicker({ ...colorPicker, gradientFrom: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                            <div>
                              <label className='text-xs text-gray-400'>Gradient To</label>
                              <input
                                type='color'
                                value={colorPicker.gradientTo}
                                onChange={(e) => setColorPicker({ ...colorPicker, gradientTo: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                          </>
                        )}
                        {selectedSection && (
                          <Button
                            onClick={() => {
                              const updatedSections = mapData.sections.map((s) => {
                                if (s.id === selectedSection.id) {
                                  return {
                                    ...s,
                                    color: colorPicker.useGradient ? s.color : colorPicker.fill,
                                    strokeColor: colorPicker.stroke,
                                    gradient: colorPicker.useGradient
                                      ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo }
                                      : undefined
                                  }
                                }
                                return s
                              })
                              setMapData({ ...mapData, sections: updatedSections })
                            }}
                            className='w-full bg-purple-600 hover:bg-purple-700'
                            size='sm'
                          >
                            Apply to Selected
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {(editTool === 'draw' || editTool === 'shape') && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold text-purple-300'>Section Config</h3>
                      <div className='space-y-2'>
                        <div>
                          <label className='text-xs text-gray-400'>Rows</label>
                          <input
                            type='number'
                            value={sectionConfig.rows}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, rows: parseInt(e.target.value) || 8 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='30'
                          />
                        </div>
                        <div>
                          <label className='text-xs text-gray-400'>Seats per Row</label>
                          <input
                            type='number'
                            value={sectionConfig.seatsPerRow}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, seatsPerRow: parseInt(e.target.value) || 12 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='30'
                          />
                        </div>
                      </div>
                      {editTool === 'draw' && (
                        <Button
                          onClick={() => setIsDrawing(!isDrawing)}
                          className={`w-full ${
                            isDrawing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          size='sm'
                        >
                          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
                        </Button>
                      )}
                    </div>
                  )}

                  {isDrawing && (
                    <Alert className='bg-green-600/20 border-green-600/50'>
                      <AlertDescription className='text-xs'>
                        Click to add points. Click near first point to close shape.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      Smart Layout Generator
                    </h3>

                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='text-xs text-gray-400'>Rows</label>
                        <input
                          type='number'
                          value={layoutParams.rows}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              rows: parseInt(e.target.value) || 12
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='5'
                          max='30'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-gray-400'>Seats/Row</label>
                        <input
                          type='number'
                          value={layoutParams.cols}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              cols: parseInt(e.target.value) || 16
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='8'
                          max='40'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-gray-400'>Layers</label>
                        <input
                          type='number'
                          value={layoutParams.layers}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              layers: parseInt(e.target.value) || 3
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='1'
                          max='5'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-gray-400'>Aisles</label>
                        <input
                          type='number'
                          value={layoutParams.aisles}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              aisles: parseInt(e.target.value) || 2
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='0'
                          max='5'
                        />
                      </div>
                    </div>

                    <div className='flex items-center gap-4'>
                      <label className='text-xs text-gray-400 flex items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={layoutParams.symmetry}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              symmetry: e.target.checked
                            })
                          }
                          className='rounded'
                        />
                        Symmetry
                      </label>
                      <select
                        value={layoutParams.density}
                        onChange={(e) =>
                          setLayoutParams({
                            ...layoutParams,
                            density: e.target.value as any
                          })
                        }
                        className='px-2 py-1 bg-slate-700 rounded text-sm'
                      >
                        <option value='sparse'>Sparse</option>
                        <option value='normal'>Normal</option>
                        <option value='dense'>Dense</option>
                      </select>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        onClick={() => generateAutoLayout('theater')}
                        className='bg-gradient-to-r from-violet-600 to-purple-600'
                        size='sm'
                      >
                        <Grid className='w-3 h-3 mr-1' />
                        Theater
                      </Button>
                      <Button
                        onClick={() => generateAutoLayout('smart-random')}
                        className='bg-gradient-to-r from-orange-600 to-yellow-600'
                        size='sm'
                      >
                        <Shuffle className='w-3 h-3 mr-1' />
                        Smart Mix
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-sm font-semibold text-purple-300'>Sections</h3>
                    <div className='space-y-1 max-h-60 overflow-y-auto'>
                      {mapData.sections.map((section) => (
                        <div
                          key={section.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            selectedSection?.id === section.id
                              ? 'bg-purple-700/50 border border-purple-500'
                              : 'bg-slate-700/50 hover:bg-slate-700/70'
                          }`}
                          onClick={() => setSelectedSection(section)}
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-3 h-3 rounded'
                              style={{
                                background: section.gradient
                                  ? `linear-gradient(90deg, ${section.gradient.from}, ${section.gradient.to})`
                                  : section.color
                              }}
                            />
                            <span className='text-sm'>{section.name}</span>
                            <span className='text-xs text-gray-400'>
                              ({section.rows}x{section.seatsPerRow})
                            </span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSection(section.id)
                            }}
                            size='sm'
                            variant='ghost'
                            className='hover:bg-red-600/20'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'quick-booking' && (
                <Alert className='bg-blue-600/20 border-blue-600/50'>
                  <AlertDescription className='text-sm'>
                    💡 <strong>Quick Booking Mode</strong>
                    <br />
                    <br />
                    • Click any seat to book/unbook
                    <br />
                    • Green = Available
                    <br />
                    • Red = Occupied
                    <br />
                    • Gray 🔒 = Locked
                    <br />
                    <br />
                    Use scroll to zoom
                  </AlertDescription>
                </Alert>
              )}

              {mode === 'preview' && (
                <Alert className='bg-purple-600/20 border-purple-600/50'>
                  <AlertDescription className='text-sm'>
                    🎬 <strong>3D Cinema View</strong>
                    <br />
                    <br />
                    Click any section to enter 3D view
                    <br />
                    <br />
                    • Click seat → Character walks in
                    <br />
                    • Click again → Character leaves
                    <br />• Gray seats are locked
                  </AlertDescription>
                </Alert>
              )}

              <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300'>Statistics</h3>
                <div className='text-xs space-y-1 text-gray-400'>
                  <div>Sections: {mapData.sections.length}</div>
                  <div>
                    Total Seats:{' '}
                    {mapData.sections.reduce((acc, s) => acc + (s.seats?.length || s.rows * s.seatsPerRow), 0)}
                  </div>
                  <div>Occupied: {Array.from(seatStatuses.values()).filter((s) => s === 'occupied').length}</div>
                  <div>Locked: {Array.from(seatStatuses.values()).filter((s) => s === 'locked').length}</div>
                  <div className='flex items-center gap-3 mt-2'>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-green-500 rounded'></div>
                      Available
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-red-500 rounded'></div>
                      Occupied
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-gray-500 rounded'></div>
                      Locked
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <Button
                  onClick={exportToJSON}
                  className='w-full bg-gradient-to-r from-green-600 to-emerald-600'
                  size='sm'
                >
                  <Download className='w-4 h-4 mr-1' />
                  Export Layout
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='flex-1 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 relative overflow-hidden shadow-2xl'>
            <CardContent className='p-0 h-full'>
              {!is3DView ? (
                <svg
                  ref={svgRef}
                  className='w-full h-full'
                  viewBox='0 0 1000 600'
                  style={{
                    cursor:
                      editTool === 'shape' ? 'crosshair' : editTool === 'move' && selectedSection ? 'move' : 'default'
                  }}
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-b from-slate-900 to-purple-900/50 relative'>
                  <Button
                    onClick={close3DView}
                    className='absolute top-4 left-4 z-50 bg-slate-700/90 backdrop-blur hover:bg-slate-600'
                  >
                    <X className='w-4 h-4 mr-2' />
                    Back to Map
                  </Button>
                  <div
                    ref={seat3DRef}
                    className='w-full h-full overflow-auto'
                    style={{
                      perspective: '1500px',
                      transformStyle: 'preserve-3d'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
