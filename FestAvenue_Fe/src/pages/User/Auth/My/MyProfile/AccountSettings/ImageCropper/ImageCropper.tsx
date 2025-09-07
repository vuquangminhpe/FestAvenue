/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, onClose, imageUrl, onCropComplete }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [, setImageDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset position when new image is loaded
  useEffect(() => {
    if (imageUrl) {
      setImageLoaded(false)
      setScale(1)
    }
  }, [imageUrl])

  // Load image dimensions and center it
  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current

      // Store original image dimensions
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      })

      setImageLoaded(true)
      centerImage()
    }
  }

  // Center the image in the container and set an appropriate initial scale
  const centerImage = () => {
    if (!imageRef.current || !containerRef.current) return

    const img = imageRef.current
    const container = containerRef.current
    const containerSize = container.offsetWidth

    // Determine which dimension needs to be scaled to fit
    const scaleX = containerSize / img.naturalWidth
    const scaleY = containerSize / img.naturalHeight

    // Use the larger scale to ensure the image fills the circle
    const initialScale = Math.max(scaleX, scaleY)

    // Set initial scale (usually > 1 to fill the container)
    setScale(initialScale)

    // Center the image
    const scaledWidth = img.naturalWidth * initialScale
    const scaledHeight = img.naturalHeight * initialScale

    setPosition({
      x: (containerSize - scaledWidth) / 2,
      y: (containerSize - scaledHeight) / 2
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    setPosition({ x: newX, y: newY })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return

    const newX = e.touches[0].clientX - dragStart.x
    const newY = e.touches[0].clientY - dragStart.y

    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  const handleSave = () => {
    if (!containerRef.current || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const containerSize = containerRef.current.offsetWidth
    canvas.width = containerSize
    canvas.height = containerSize

    ctx.beginPath()
    ctx.arc(containerSize / 2, containerSize / 2, containerSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    const img = imageRef.current

    const sourceX = -position.x / scale
    const sourceY = -position.y / scale
    const sourceWidth = containerSize / scale
    const sourceHeight = containerSize / scale

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0, // Place at the top-left of the canvas
      containerSize,
      containerSize // Scale to fill the canvas
    )

    // Convert canvas to blob and pass to parent component
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob)
        }
      },
      'image/jpeg',
      0.95
    )

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>Cài đặt hình ảnh</h3>
        </div>

        <div className='flex flex-col items-center'>
          <div
            ref={containerRef}
            className='w-[280px] h-[280px] rounded-full overflow-hidden border-2 border-gray-200 relative cursor-move'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt='Profile preview'
                onLoad={handleImageLoad}
                style={{
                  position: 'absolute',
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: '0 0',
                  visibility: imageLoaded ? 'visible' : 'hidden',
                  maxWidth: 'none'
                }}
                draggable={false}
              />
            )}
            {!imageLoaded && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full'></div>
              </div>
            )}
          </div>

          <div className='flex items-center mt-4 mb-2'>
            <Button variant='outline' size='icon' onClick={handleZoomOut} disabled={scale <= 0.5}>
              <Minus className='h-4 w-4' />
            </Button>
            <div className='w-32 mx-2 text-center text-sm'>Phóng to: {Math.round(scale * 100)}%</div>
            <Button variant='outline' size='icon' onClick={handleZoomIn} disabled={scale >= 3}>
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          <p className='text-xs text-gray-500 mb-4'>
            Kéo thả để thay đổi vị trí hoặc sử dụng điều khiển phóng to/thu nhỏ để điều chỉnh.
          </p>

          <div className='flex justify-end w-full gap-2'>
            <Button variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Áp dụng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageCropper
