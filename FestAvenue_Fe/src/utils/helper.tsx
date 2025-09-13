import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export const EmojiPicker = ({
  onEmojiSelect,
  isVisible,
  onClose
}: {
  onEmojiSelect: (emoji: string) => void
  isVisible: boolean
  onClose: () => void
}) => {
  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '👋', '🔥', '💯']
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pickerRef.current) {
      if (isVisible) {
        gsap.fromTo(
          pickerRef.current,
          { opacity: 0, scale: 0.9, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'back.out(1.7)' }
        )
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      ref={pickerRef}
      className='absolute w-52 h-28 bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50'
    >
      <div className='grid grid-cols-6 gap-2'>
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji)
              onClose()
            }}
            className='size-8 rounded hover:bg-gray-100 flex items-center justify-center transition-colors'
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
