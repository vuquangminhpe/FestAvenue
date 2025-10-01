import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Pipette } from 'lucide-react'
import { Label } from '../../../../../components/ui/label'
import { Input } from '../../../../../components/ui/input'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [hexInput, setHexInput] = useState(color)

  const pickerRef = useRef<HTMLDivElement>(null)
  const saturationCanvasRef = useRef<HTMLCanvasElement>(null)
  const lastColorRef = useRef(color)

  // Initialize HSL from color prop only once or when color changes externally
  useEffect(() => {
    // Only update if color changed from outside (not from our own updates)
    if (color !== lastColorRef.current && color !== hslToHex(hue, saturation, lightness)) {
      const hsl = hexToHSL(color)
      if (hsl) {
        setHue(hsl.h)
        setSaturation(hsl.s)
        setLightness(hsl.l)
        setHexInput(color)
        lastColorRef.current = color
      }
    }
  }, [color])

  // Draw saturation/lightness canvas
  useEffect(() => {
    const canvas = saturationCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Draw saturation gradient (left to right)
    for (let x = 0; x < width; x++) {
      const s = (x / width) * 100
      for (let y = 0; y < height; y++) {
        const l = 100 - (y / height) * 100
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }, [hue])

  // Animate picker open/close
  useEffect(() => {
    if (pickerRef.current) {
      if (showPicker) {
        gsap.fromTo(
          pickerRef.current,
          { opacity: 0, scale: 0.95, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }
        )
      }
    }
  }, [showPicker])

  const handleHueChange = (newHue: number) => {
    setHue(newHue)
    const newColor = hslToHex(newHue, saturation, lightness)
    setHexInput(newColor)
    lastColorRef.current = newColor
    onChange(newColor)
  }

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = saturationCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newS = Math.max(0, Math.min(100, (x / canvas.width) * 100))
    const newL = Math.max(0, Math.min(100, 100 - (y / canvas.height) * 100))

    setSaturation(newS)
    setLightness(newL)
    const newColor = hslToHex(hue, newS, newL)
    setHexInput(newColor)
    lastColorRef.current = newColor
    onChange(newColor)
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only update on mouse move if mouse is pressed
    if (e.buttons === 1) {
      handleCanvasInteraction(e)
    }
  }

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const hsl = hexToHSL(value)
      if (hsl) {
        setHue(hsl.h)
        setSaturation(hsl.s)
        setLightness(hsl.l)
        lastColorRef.current = value
        onChange(value)
      }
    }
  }

  const currentColor = hslToHex(hue, saturation, lightness)

  return (
    <div className='space-y-2'>
      <Label className='flex items-center gap-2'>
        <Pipette className='w-4 h-4' />
        Màu sắc
      </Label>

      {/* Color Preview & Hex Input */}
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => setShowPicker(!showPicker)}
          className='w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:scale-105 transition-transform relative'
          style={{ backgroundColor: currentColor }}
          title='Click để chọn màu'
        >
          <div className='absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all' />
        </button>
        <Input
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
          placeholder='#3B82F6'
          className='flex-1 font-mono uppercase'
          maxLength={7}
        />
      </div>

      {/* Color Picker Dropdown */}
      {showPicker && (
        <div ref={pickerRef} className='bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64'>
          {/* Color Canvas with Hue strip on top */}
          <div className='relative w-full'>
            {/* Hue Strip */}
            <div className='relative h-6 rounded-t-lg overflow-hidden mb-0.5'>
              <div
                className='absolute inset-0'
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
              <input
                type='range'
                min='0'
                max='360'
                value={hue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              />
              <div
                className='absolute top-1/2 w-0.5 h-8 bg-white border border-gray-900 rounded-full shadow-lg pointer-events-none'
                style={{
                  left: `${(hue / 360) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            {/* Saturation & Lightness Canvas */}
            <canvas
              ref={saturationCanvasRef}
              width={240}
              height={180}
              onClick={handleCanvasInteraction}
              onMouseMove={handleCanvasMove}
              className='w-full h-[180px] rounded-b-lg cursor-crosshair'
            />
            {/* Color Indicator */}
            <div
              className='absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none'
              style={{
                left: `${saturation}%`,
                top: `calc(24px + ${(100 - lightness) * 1.8}px)`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: currentColor,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}
