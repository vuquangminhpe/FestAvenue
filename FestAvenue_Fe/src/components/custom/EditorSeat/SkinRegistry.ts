import type { Section } from '@/types/seat.types'

export interface SeatMapSkin {
  id: string
  name: string
  description?: string

  zone: {
    fillType: 'solid' | 'linear-gradient' | 'radial-gradient'
    fillColor?: string
    gradientStops?: { offset: string; color: string }[]
    gradientRotation?: number
    strokeColor: string
    strokeWidth: number
    strokeDasharray?: string
    shadow?: {
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
    opacity?: number
    borderRadius?: number
  }

  seat: {
    shape: 'circle' | 'rect' | 'star' | 'diamond' | 'custom' | 'pill' | 'hex'
    path?: string
    size: number
    fillColor: string
    strokeColor?: string
    strokeWidth?: number
    borderRadius?: number
    hoverScale?: number
    shadow?: {
      color: string
      blur: number
    }
  }

  label: {
    fontFamily: string
    fontSize: number
    fontWeight: string | number
    color: string
    letterSpacing?: number
    textTransform?: 'uppercase' | 'capitalize' | 'none'
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
      fontFamily: "'Inter', sans-serif",
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
      gradientRotation: 35,
      strokeColor: '#DAA520',
      strokeWidth: 3,
      shadow: {
        color: 'rgba(218, 165, 32, 0.6)',
        blur: 15,
        offsetX: 0,
        offsetY: 4
      },
      opacity: 0.9,
      borderRadius: 18,
      strokeDasharray: '6 2'
    },
    seat: {
      shape: 'star',
      size: 1.2,
      fillColor: '#FFD700',
      strokeColor: '#B8860B',
      strokeWidth: 1,
      hoverScale: 1.25,
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
      letterSpacing: 1.5,
      textTransform: 'uppercase',
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
        { offset: '0%', color: 'rgba(6, 182, 212, 0.8)' },
        { offset: '100%', color: 'rgba(59, 130, 246, 0.8)' }
      ],
      gradientRotation: 120,
      strokeColor: '#60a5fa',
      strokeWidth: 2,
      shadow: {
        color: 'rgba(59, 130, 246, 0.4)',
        blur: 10,
        offsetX: 0,
        offsetY: 2
      },
      borderRadius: 12
    },
    seat: {
      shape: 'rect',
      size: 0.9,
      fillColor: '#e0f2fe',
      strokeColor: '#0ea5e9',
      strokeWidth: 1,
      borderRadius: 4,
      hoverScale: 1.15
    },
    label: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: '#ffffff',
      textTransform: 'uppercase',
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
        { offset: '0%', color: 'rgba(236, 72, 153, 0.4)' },
        { offset: '100%', color: 'rgba(168, 85, 247, 0.6)' }
      ],
      strokeColor: '#d946ef',
      strokeWidth: 2,
      shadow: {
        color: '#d946ef',
        blur: 20,
        offsetX: 0,
        offsetY: 0
      },
      strokeDasharray: '3 6'
    },
    seat: {
      shape: 'circle',
      size: 0.8,
      fillColor: '#f0abfc',
      strokeColor: '#fff',
      strokeWidth: 2,
      hoverScale: 1.3,
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
      textTransform: 'uppercase',
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
  },
  emerald_garden: {
    id: 'emerald_garden',
    name: 'Emerald Garden',
    description: 'Fresh botanical palette with pill seats',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: '#2dd4bf' },
        { offset: '100%', color: '#15803d' }
      ],
      gradientRotation: 160,
      strokeColor: '#065f46',
      strokeWidth: 3,
      borderRadius: 24,
      shadow: {
        color: 'rgba(6,95,70,0.35)',
        blur: 18,
        offsetX: 0,
        offsetY: 6
      },
      opacity: 0.95
    },
    seat: {
      shape: 'pill',
      size: 1,
      fillColor: '#d1fae5',
      strokeColor: '#10b981',
      strokeWidth: 1,
      borderRadius: 999,
      hoverScale: 1.2,
      shadow: {
        color: 'rgba(16,185,129,0.4)',
        blur: 4
      }
    },
    label: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: 15,
      fontWeight: 600,
      color: '#064e3b',
      textTransform: 'capitalize',
      background: {
        color: 'rgba(209, 250, 229, 0.9)',
        padding: 6,
        borderRadius: 10
      }
    }
  },
  sapphire_haze: {
    id: 'sapphire_haze',
    name: 'Sapphire Haze',
    description: 'Cold blue glassmorphism with diamond seats',
    zone: {
      fillType: 'radial-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(14, 165, 233, 0.5)' },
        { offset: '100%', color: 'rgba(59, 7, 100, 0.85)' }
      ],
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      strokeDasharray: '1 8',
      shadow: {
        color: 'rgba(59,7,100,0.6)',
        blur: 25,
        offsetX: 0,
        offsetY: 8
      },
      opacity: 0.85
    },
    seat: {
      shape: 'diamond',
      size: 1,
      fillColor: 'rgba(191,219,254,0.9)',
      strokeColor: '#0ea5e9',
      strokeWidth: 1.5,
      hoverScale: 1.25,
      shadow: {
        color: 'rgba(14,165,233,0.5)',
        blur: 6
      }
    },
    label: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: '#e0e7ff',
      letterSpacing: 2,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(15,23,42,0.8)',
        padding: 4,
        borderRadius: 4
      }
    }
  },
  noir_luxe: {
    id: 'noir_luxe',
    name: 'Noir Luxe',
    description: 'Dark mode with neon outlines and hex seats',
    zone: {
      fillType: 'solid',
      fillColor: '#111827',
      strokeColor: '#f472b6',
      strokeWidth: 3,
      strokeDasharray: '12 4',
      shadow: {
        color: 'rgba(244,114,182,0.35)',
        blur: 30,
        offsetX: 0,
        offsetY: 10
      },
      opacity: 0.92
    },
    seat: {
      shape: 'hex',
      size: 0.9,
      fillColor: '#1f2937',
      strokeColor: '#f472b6',
      strokeWidth: 2,
      hoverScale: 1.3,
      shadow: {
        color: 'rgba(244,114,182,0.4)',
        blur: 8
      }
    },
    label: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 13,
      fontWeight: 700,
      color: '#f472b6',
      letterSpacing: 1,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(17,24,39,0.9)',
        padding: 5,
        borderRadius: 2
      }
    }
  }
}

export const getSkin = (templateId?: string): SeatMapSkin => {
  return SKIN_REGISTRY[templateId || 'default'] || SKIN_REGISTRY['default']
}

export interface SectionWithAppearance extends Section {
  appearance?: {
    templateId: string
    customOverride?: any
  }
}
