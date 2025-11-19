import type { Section } from '@/types/seat.types'

export interface SeatMapSkin {
  id: string
  name: string
  description?: string
  category?: 'theater' | 'stadium' | 'concert' | 'lounge' | 'premium'

  zone: {
    fillType: 'solid' | 'linear-gradient' | 'radial-gradient' | 'pattern'
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
    // Advanced: Multiple shadow layers for depth
    shadows?: Array<{
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }>
    opacity?: number
    borderRadius?: number
    // Glassmorphism
    backdropBlur?: number
    // Pattern fill
    patternId?: string
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
    // Advanced: Multiple shadows for depth
    shadows?: Array<{
      color: string
      blur: number
    }>
    // Pulse/glow effect
    glowColor?: string
    glowIntensity?: number
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
      // Glassmorphism for labels
      backdropBlur?: number
    }
  }
}

export const SKIN_REGISTRY: Record<string, SeatMapSkin> = {
  default: {
    id: 'default',
    name: 'Modern Clean',
    description: 'Sleek minimalist design with subtle depth',
    category: 'theater',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(99, 102, 241, 0.12)' },
        { offset: '100%', color: 'rgba(139, 92, 246, 0.2)' }
      ],
      gradientRotation: 135,
      strokeColor: '#818cf8',
      strokeWidth: 2.5,
      borderRadius: 18,
      shadows: [
        { color: 'rgba(99, 102, 241, 0.15)', blur: 8, offsetX: 0, offsetY: 2 },
        { color: 'rgba(99, 102, 241, 0.1)', blur: 16, offsetX: 0, offsetY: 4 }
      ],
      opacity: 0.96
    },
    seat: {
      shape: 'rect',
      size: 1.15,
      fillColor: '#e0e7ff',
      strokeColor: '#6366f1',
      strokeWidth: 1.8,
      borderRadius: 7,
      hoverScale: 1.25,
      shadows: [
        { color: 'rgba(99, 102, 241, 0.25)', blur: 3 },
        { color: 'rgba(99, 102, 241, 0.15)', blur: 8 }
      ]
    },
    label: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSize: 15,
      fontWeight: 600,
      color: '#1e1b4b',
      textTransform: 'capitalize',
      background: {
        color: 'rgba(255, 255, 255, 0.98)',
        padding: 9,
        borderRadius: 11,
        backdropBlur: 8
      },
      shadow: {
        color: 'rgba(0,0,0,0.08)',
        blur: 3
      }
    }
  },

  glass_premium: {
    id: 'glass_premium',
    name: '✨ Glass Premium',
    description: 'Cutting-edge glassmorphism with multi-layer depth',
    category: 'premium',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(255, 255, 255, 0.25)' },
        { offset: '100%', color: 'rgba(255, 255, 255, 0.1)' }
      ],
      gradientRotation: 120,
      strokeColor: 'rgba(255, 255, 255, 0.5)',
      strokeWidth: 1.5,
      borderRadius: 24,
      backdropBlur: 20,
      shadows: [
        { color: 'rgba(31, 38, 135, 0.15)', blur: 10, offsetX: 0, offsetY: 4 },
        { color: 'rgba(0, 0, 0, 0.1)', blur: 30, offsetX: 0, offsetY: 15 }
      ],
      opacity: 0.85
    },
    seat: {
      shape: 'pill',
      size: 1.3,
      fillColor: 'rgba(255, 255, 255, 0.8)',
      strokeColor: 'rgba(139, 92, 246, 0.6)',
      strokeWidth: 2,
      borderRadius: 999,
      hoverScale: 1.35,
      shadows: [
        { color: 'rgba(139, 92, 246, 0.3)', blur: 5 },
        { color: 'rgba(0, 0, 0, 0.1)', blur: 15 }
      ],
      glowColor: 'rgba(139, 92, 246, 0.5)',
      glowIntensity: 12
    },
    label: {
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      fontSize: 16,
      fontWeight: 600,
      color: 'rgba(17, 24, 39, 0.9)',
      letterSpacing: 0.5,
      textTransform: 'capitalize',
      background: {
        color: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderRadius: 14,
        backdropBlur: 12
      },
      shadow: {
        color: 'rgba(0,0,0,0.05)',
        blur: 4
      }
    }
  },

  neon_concert: {
    id: 'neon_concert',
    name: '🎵 Neon Concert',
    description: 'Electric cyberpunk vibes with pulsing glow effects',
    category: 'concert',
    zone: {
      fillType: 'radial-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(236, 72, 153, 0.2)' },
        { offset: '50%', color: 'rgba(168, 85, 247, 0.3)' },
        { offset: '100%', color: 'rgba(59, 130, 246, 0.25)' }
      ],
      strokeColor: '#ec4899',
      strokeWidth: 3,
      strokeDasharray: '1 12',
      borderRadius: 20,
      shadows: [
        { color: '#ec4899', blur: 20, offsetX: 0, offsetY: 0 },
        { color: 'rgba(236, 72, 153, 0.4)', blur: 40, offsetX: 0, offsetY: 0 }
      ],
      opacity: 0.85
    },
    seat: {
      shape: 'hex',
      size: 1.25,
      fillColor: '#fdf2f8',
      strokeColor: '#f9a8d4',
      strokeWidth: 3,
      hoverScale: 1.5,
      shadows: [
        { color: 'rgba(236, 72, 153, 0.6)', blur: 8 },
        { color: 'rgba(236, 72, 153, 0.3)', blur: 20 }
      ],
      glowColor: '#ec4899',
      glowIntensity: 15
    },
    label: {
      fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
      fontSize: 20,
      fontWeight: 800,
      color: '#fdf2f8',
      letterSpacing: 3,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(131, 24, 67, 0.95)',
        padding: 9,
        borderRadius: 5
      },
      shadow: {
        color: '#ec4899',
        blur: 15
      }
    }
  },

  platinum_vip: {
    id: 'platinum_vip',
    name: '💎 Platinum VIP',
    description: 'Ultra-luxury with metallic shimmer and depth',
    category: 'premium',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(241, 245, 249, 0.6)' },
        { offset: '50%', color: 'rgba(203, 213, 225, 0.75)' },
        { offset: '100%', color: 'rgba(148, 163, 184, 0.85)' }
      ],
      gradientRotation: 45,
      strokeColor: '#cbd5e1',
      strokeWidth: 4,
      strokeDasharray: '10 5',
      borderRadius: 28,
      shadows: [
        { color: 'rgba(148, 163, 184, 0.4)', blur: 12, offsetX: 0, offsetY: 6 },
        { color: 'rgba(148, 163, 184, 0.25)', blur: 25, offsetX: 0, offsetY: 12 },
        { color: 'rgba(0, 0, 0, 0.1)', blur: 40, offsetX: 0, offsetY: 20 }
      ],
      opacity: 0.99
    },
    seat: {
      shape: 'star',
      size: 1.45,
      fillColor: '#f1f5f9',
      strokeColor: '#64748b',
      strokeWidth: 2.5,
      hoverScale: 1.4,
      shadows: [
        { color: 'rgba(148, 163, 184, 0.5)', blur: 6 },
        { color: 'rgba(148, 163, 184, 0.3)', blur: 12 }
      ],
      glowColor: 'rgba(203, 213, 225, 0.8)',
      glowIntensity: 10
    },
    label: {
      fontFamily: "'Cinzel', 'Playfair Display', serif",
      fontSize: 22,
      fontWeight: 900,
      color: '#1e293b',
      letterSpacing: 4,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(241, 245, 249, 0.98)',
        padding: 14,
        borderRadius: 8,
        backdropBlur: 6
      },
      shadow: {
        color: 'rgba(0,0,0,0.25)',
        blur: 8
      }
    }
  },

  royal_theater: {
    id: 'royal_theater',
    name: '👑 Royal Theater',
    description: 'Opulent gold theme with baroque elegance',
    category: 'theater',
    zone: {
      fillType: 'radial-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(251, 191, 36, 0.35)' },
        { offset: '50%', color: 'rgba(217, 119, 6, 0.45)' },
        { offset: '100%', color: 'rgba(146, 64, 14, 0.55)' }
      ],
      strokeColor: '#f59e0b',
      strokeWidth: 3.5,
      borderRadius: 26,
      shadows: [
        { color: 'rgba(251, 191, 36, 0.3)', blur: 10, offsetX: 0, offsetY: 4 },
        { color: 'rgba(217, 119, 6, 0.2)', blur: 20, offsetX: 0, offsetY: 8 }
      ],
      opacity: 0.95
    },
    seat: {
      shape: 'circle',
      size: 1.2,
      fillColor: '#fef3c7',
      strokeColor: '#d97706',
      strokeWidth: 2.2,
      hoverScale: 1.32,
      shadows: [
        { color: 'rgba(251, 191, 36, 0.4)', blur: 4 },
        { color: 'rgba(217, 119, 6, 0.25)', blur: 10 }
      ]
    },
    label: {
      fontFamily: "'Cormorant Garamond', 'EB Garamond', serif",
      fontSize: 19,
      fontWeight: 700,
      color: '#78350f',
      letterSpacing: 2,
      textTransform: 'capitalize',
      background: {
        color: 'rgba(254, 243, 199, 0.98)',
        padding: 11,
        borderRadius: 14
      },
      shadow: {
        color: 'rgba(0,0,0,0.15)',
        blur: 4
      }
    }
  },

  cinema_imax: {
    id: 'cinema_imax',
    name: '� Cinema IMAX',
    description: 'Premium cinema experience with deep burgundy tones',
    category: 'theater',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(220, 38, 38, 0.3)' },
        { offset: '50%', color: 'rgba(127, 29, 29, 0.5)' },
        { offset: '100%', color: 'rgba(69, 10, 10, 0.6)' }
      ],
      gradientRotation: 135,
      strokeColor: '#dc2626',
      strokeWidth: 3.5,
      borderRadius: 22,
      shadows: [
        { color: 'rgba(220, 38, 38, 0.35)', blur: 12, offsetX: 0, offsetY: 6 },
        { color: 'rgba(127, 29, 29, 0.25)', blur: 24, offsetX: 0, offsetY: 12 }
      ],
      opacity: 0.94
    },
    seat: {
      shape: 'pill',
      size: 1.35,
      fillColor: '#7f1d1d',
      strokeColor: '#fca5a5',
      strokeWidth: 2.5,
      borderRadius: 999,
      hoverScale: 1.3,
      shadows: [
        { color: 'rgba(220, 38, 38, 0.5)', blur: 5 },
        { color: 'rgba(220, 38, 38, 0.3)', blur: 12 }
      ]
    },
    label: {
      fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
      fontSize: 20,
      fontWeight: 700,
      color: '#fef2f2',
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(69, 10, 10, 0.98)',
        padding: 11,
        borderRadius: 9
      },
      shadow: {
        color: 'rgba(0,0,0,0.6)',
        blur: 6
      }
    }
  },

  stadium_arena: {
    id: 'stadium_arena',
    name: '🏟️ Stadium Arena',
    description: 'High-energy sports venue with bold orange accents',
    category: 'stadium',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(249, 115, 22, 0.35)' },
        { offset: '100%', color: 'rgba(194, 65, 12, 0.55)' }
      ],
      gradientRotation: 90,
      strokeColor: '#ea580c',
      strokeWidth: 3.5,
      borderRadius: 16,
      shadows: [
        { color: 'rgba(249, 115, 22, 0.3)', blur: 10, offsetX: 0, offsetY: 4 },
        { color: 'rgba(194, 65, 12, 0.2)', blur: 20, offsetX: 0, offsetY: 8 }
      ],
      opacity: 0.92
    },
    seat: {
      shape: 'rect',
      size: 1.1,
      fillColor: '#ffedd5',
      strokeColor: '#f97316',
      strokeWidth: 2.5,
      borderRadius: 6,
      hoverScale: 1.28,
      shadows: [
        { color: 'rgba(249, 115, 22, 0.35)', blur: 4 },
        { color: 'rgba(194, 65, 12, 0.2)', blur: 10 }
      ]
    },
    label: {
      fontFamily: "'Rajdhani', 'Barlow', sans-serif",
      fontSize: 18,
      fontWeight: 800,
      color: '#7c2d12',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(255, 247, 237, 0.98)',
        padding: 9,
        borderRadius: 10
      },
      shadow: {
        color: 'rgba(0,0,0,0.12)',
        blur: 3
      }
    }
  },

  zen_garden: {
    id: 'zen_garden',
    name: '🌿 Zen Garden',
    description: 'Calming botanical aesthetic with organic shapes',
    category: 'lounge',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(74, 222, 128, 0.28)' },
        { offset: '100%', color: 'rgba(21, 128, 61, 0.48)' }
      ],
      gradientRotation: 135,
      strokeColor: '#22c55e',
      strokeWidth: 2.8,
      borderRadius: 32,
      shadows: [
        { color: 'rgba(34, 197, 94, 0.25)', blur: 10, offsetX: 0, offsetY: 3 },
        { color: 'rgba(21, 128, 61, 0.15)', blur: 20, offsetX: 0, offsetY: 6 }
      ],
      opacity: 0.96
    },
    seat: {
      shape: 'pill',
      size: 1.15,
      fillColor: '#dcfce7',
      strokeColor: '#16a34a',
      strokeWidth: 2,
      borderRadius: 999,
      hoverScale: 1.3,
      shadows: [
        { color: 'rgba(34, 197, 94, 0.3)', blur: 4 },
        { color: 'rgba(21, 128, 61, 0.2)', blur: 10 }
      ]
    },
    label: {
      fontFamily: "'Quicksand', 'Nunito', sans-serif",
      fontSize: 17,
      fontWeight: 600,
      color: '#14532d',
      letterSpacing: 1,
      textTransform: 'capitalize',
      background: {
        color: 'rgba(220, 252, 231, 0.98)',
        padding: 10,
        borderRadius: 16
      },
      shadow: {
        color: 'rgba(0,0,0,0.08)',
        blur: 3
      }
    }
  },

  midnight_luxe: {
    id: 'midnight_luxe',
    name: '🌙 Midnight Luxe',
    description: 'Sophisticated dark mode with amethyst accents',
    category: 'lounge',
    zone: {
      fillType: 'solid',
      fillColor: 'rgba(17, 24, 39, 0.88)',
      strokeColor: '#a78bfa',
      strokeWidth: 3,
      strokeDasharray: '12 6',
      borderRadius: 20,
      shadows: [
        { color: 'rgba(167, 139, 250, 0.35)', blur: 15, offsetX: 0, offsetY: 5 },
        { color: 'rgba(167, 139, 250, 0.2)', blur: 30, offsetX: 0, offsetY: 10 }
      ],
      opacity: 0.98
    },
    seat: {
      shape: 'diamond',
      size: 1.2,
      fillColor: '#312e81',
      strokeColor: '#c4b5fd',
      strokeWidth: 2.5,
      hoverScale: 1.4,
      shadows: [
        { color: 'rgba(196, 181, 253, 0.5)', blur: 6 },
        { color: 'rgba(167, 139, 250, 0.3)', blur: 14 }
      ],
      glowColor: '#a78bfa',
      glowIntensity: 12
    },
    label: {
      fontFamily: "'Space Grotesk', 'Exo 2', sans-serif",
      fontSize: 16,
      fontWeight: 700,
      color: '#e9d5ff',
      letterSpacing: 2,
      textTransform: 'uppercase',
      background: {
        color: 'rgba(17, 24, 39, 0.98)',
        padding: 8,
        borderRadius: 8,
        backdropBlur: 10
      },
      shadow: {
        color: '#a78bfa',
        blur: 10
      }
    }
  },

  ocean_wave: {
    id: 'ocean_wave',
    name: '🌊 Ocean Wave',
    description: 'Fluid aquamarine design with flowing gradients',
    category: 'lounge',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(14, 165, 233, 0.32)' },
        { offset: '50%', color: 'rgba(6, 182, 212, 0.42)' },
        { offset: '100%', color: 'rgba(20, 184, 166, 0.48)' }
      ],
      gradientRotation: 120,
      strokeColor: '#06b6d4',
      strokeWidth: 3,
      borderRadius: 24,
      shadows: [
        { color: 'rgba(6, 182, 212, 0.3)', blur: 10, offsetX: 0, offsetY: 4 },
        { color: 'rgba(20, 184, 166, 0.2)', blur: 18, offsetX: 0, offsetY: 8 }
      ],
      opacity: 0.94
    },
    seat: {
      shape: 'circle',
      size: 1.2,
      fillColor: '#cffafe',
      strokeColor: '#0891b2',
      strokeWidth: 2,
      hoverScale: 1.3,
      shadows: [
        { color: 'rgba(6, 182, 212, 0.35)', blur: 4 },
        { color: 'rgba(20, 184, 166, 0.25)', blur: 10 }
      ]
    },
    label: {
      fontFamily: "'Nunito', 'Karla', sans-serif",
      fontSize: 17,
      fontWeight: 700,
      color: '#164e63',
      letterSpacing: 1.2,
      textTransform: 'capitalize',
      background: {
        color: 'rgba(207, 250, 254, 0.98)',
        padding: 10,
        borderRadius: 14
      },
      shadow: {
        color: 'rgba(0,0,0,0.1)',
        blur: 3
      }
    }
  },

  sunset_festival: {
    id: 'sunset_festival',
    name: '� Sunset Festival',
    description: 'Warm gradient palette perfect for outdoor events',
    category: 'concert',
    zone: {
      fillType: 'linear-gradient',
      gradientStops: [
        { offset: '0%', color: 'rgba(251, 146, 60, 0.35)' },
        { offset: '50%', color: 'rgba(251, 113, 133, 0.4)' },
        { offset: '100%', color: 'rgba(192, 132, 252, 0.45)' }
      ],
      gradientRotation: 45,
      strokeColor: '#fb923c',
      strokeWidth: 3,
      borderRadius: 20,
      shadows: [
        { color: 'rgba(251, 146, 60, 0.3)', blur: 12, offsetX: 0, offsetY: 4 },
        { color: 'rgba(251, 113, 133, 0.25)', blur: 22, offsetX: 0, offsetY: 8 }
      ],
      opacity: 0.93
    },
    seat: {
      shape: 'hex',
      size: 1.15,
      fillColor: '#ffedd5',
      strokeColor: '#f97316',
      strokeWidth: 2,
      hoverScale: 1.35,
      shadows: [
        { color: 'rgba(251, 146, 60, 0.4)', blur: 5 },
        { color: 'rgba(251, 113, 133, 0.3)', blur: 12 }
      ]
    },
    label: {
      fontFamily: "'Poppins', 'Montserrat', sans-serif",
      fontSize: 17,
      fontWeight: 700,
      color: '#7c2d12',
      letterSpacing: 1.3,
      textTransform: 'capitalize',
      background: {
        color: 'rgba(255, 247, 237, 0.98)',
        padding: 10,
        borderRadius: 12
      },
      shadow: {
        color: 'rgba(0,0,0,0.12)',
        blur: 3
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
