import type { Section } from '@/types/seat.types'

export interface SeatMapSkin {
  id: string
  name: string
  description?: string
  
  // Zone/Section Styling
  zone: {
    fillType: 'solid' | 'linear-gradient' | 'radial-gradient'
    fillColor?: string // Fallback or solid color
    gradientStops?: { offset: string; color: string }[] // For gradients
    strokeColor: string
    strokeWidth: number
    shadow?: {
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
    opacity?: number
  }

  // Seat Styling
  seat: {
    shape: 'circle' | 'rect' | 'star' | 'diamond' | 'custom'
    path?: string // SVG path for custom shape
    size: number // Base size multiplier
    fillColor: string // Default seat color (can be overridden by status)
    strokeColor?: string
    strokeWidth?: number
    shadow?: {
      color: string
      blur: number
    }
  }

  // Label Styling
  label: {
    fontFamily: string
    fontSize: number
    fontWeight: string | number
    color: string
    shadow?: {
      color: string
      blur: number
    }
    background?: {
      color: string
      padding: number
      borderRadius: number
    }
  }
}

export const SKIN_REGISTRY: Record<string, SeatMapSkin> = {
  default: {
    id: 'default',
    name: 'Default Wireframe',
    zone: {
      fillType: 'solid',
      fillColor: 'rgba(52, 152, 219, 0.2)',
      strokeColor: '#2980b9',
      strokeWidth: 2
    },
    seat: {
      shape: 'circle',
      size: 1,
      fillColor: '#2ecc71'
    },
    label: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ffffff',
      background: {
        color: 'rgba(0,0,0,0.7)',
        padding: 4,
        borderRadius: 4
      }
    }
  },
  vip_gold: {
    id: 'vip_gold',
    name: 'VIP Gold',
    description: 'Luxurious gold theme with gradients and shadows',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: '#FDB931' },
        { offset: '50%', color: '#9f7928' },
        { offset: '100%', color: '#8A6E2F' }
      ],
      strokeColor: '#DAA520',
      strokeWidth: 3,
      shadow: {
        color: 'rgba(218, 165, 32, 0.6)',
        blur: 15,
        offsetX: 0,
        offsetY: 4
      },
      opacity: 0.9
    },
    seat: {
      shape: 'star',
      size: 1.2,
      fillColor: '#FFD700',
      strokeColor: '#B8860B',
      strokeWidth: 1,
      shadow: {
        color: 'rgba(0,0,0,0.3)',
        blur: 2
      }
    },
    label: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 16,
      fontWeight: 700,
      color: '#FFD700',
      shadow: {
        color: 'rgba(0,0,0,0.8)',
        blur: 4
      },
      background: {
        color: '#000000',
        padding: 6,
        borderRadius: 2
      }
    }
  },
  modern_blue: {
    id: 'modern_blue',
    name: 'Modern Blue',
    description: 'Sleek tech-inspired blue theme',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(6, 182, 212, 0.8)' }, // cyan-500
        { offset: '100%', color: 'rgba(59, 130, 246, 0.8)' } // blue-500
      ],
      strokeColor: '#60a5fa',
      strokeWidth: 2,
      shadow: {
        color: 'rgba(59, 130, 246, 0.4)',
        blur: 10,
        offsetX: 0,
        offsetY: 2
      }
    },
    seat: {
      shape: 'rect',
      size: 0.9,
      fillColor: '#e0f2fe',
      strokeColor: '#0ea5e9',
      strokeWidth: 1
    },
    label: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: '#ffffff',
      background: {
        color: '#0f172a',
        padding: 5,
        borderRadius: 6
      }
    }
  },
  neon_night: {
    id: 'neon_night',
    name: 'Neon Night',
    description: 'Cyberpunk aesthetic with glowing effects',
    zone: {
      fillType: 'radial-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(236, 72, 153, 0.4)' }, // pink-500
        { offset: '100%', color: 'rgba(168, 85, 247, 0.6)' } // purple-500
      ],
      strokeColor: '#d946ef',
      strokeWidth: 2,
      shadow: {
        color: '#d946ef',
        blur: 20,
        offsetX: 0,
        offsetY: 0
      }
    },
    seat: {
      shape: 'circle',
      size: 0.8,
      fillColor: '#f0abfc',
      strokeColor: '#fff',
      strokeWidth: 2,
      shadow: {
        color: '#e879f9',
        blur: 5
      }
    },
    label: {
      fontFamily: "'Courier New', monospace",
      fontSize: 15,
      fontWeight: 'bold',
      color: '#f0abfc',
      shadow: {
        color: '#d946ef',
        blur: 8
      },
      background: {
        color: 'rgba(0,0,0,0.8)',
        padding: 4,
        borderRadius: 0
      }
    }
  }
}

// Helper to get skin or fallback
export const getSkin = (templateId?: string): SeatMapSkin => {
  return SKIN_REGISTRY[templateId || 'default'] || SKIN_REGISTRY['default']
}

// Extend the Section interface locally if needed, or assume it's extended in types
export interface SectionWithAppearance extends Section {
  appearance?: {
    templateId: string
    customOverride?: any
  }
}
