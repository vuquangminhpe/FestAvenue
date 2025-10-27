import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useGoongGeocoding } from '@/pages/User/Auth/Event/CreateEvent/hooks/useGoongGeocoding'

interface GoongAutocompleteProps {
  onPlaceSelect: (place: {
    lat: number
    lng: number
    formatted_address: string
    compound?: {
      province?: string
      district?: string
      commune?: string
    }
  }) => void
  onLocationOutsideVietnam?: () => void
  placeholder?: string
  className?: string
}

const GoongAutocomplete: React.FC<GoongAutocompleteProps> = ({
  onPlaceSelect,
  onLocationOutsideVietnam,
  placeholder = 'Tìm kiếm địa điểm...',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { autocomplete, getPlaceDetail, isLoading } = useGoongGeocoding()

  // Debounce search (increased to 500ms to reduce API calls)
  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      const results = await autocomplete(inputValue)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setSelectedIndex(-1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [inputValue, autocomplete])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectPlace = async (placeId: string, description: string) => {
    setInputValue(description)
    setShowDropdown(false)

    // Get place details with coordinates
    const placeDetail = await getPlaceDetail(placeId)
    if (placeDetail) {
      onPlaceSelect(placeDetail)
    } else {
      // Location is outside Vietnam or invalid
      onLocationOutsideVietnam?.()
      // Clear input
      setInputValue('')
    }
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex]
          handleSelectPlace(selected.place_id, selected.description)
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
        <Input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className='pl-10 pr-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
        />
        {isLoading && (
          <Loader2 className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5 animate-spin' />
        )}
        {!isLoading && inputValue && (
          <button
            onClick={handleClear}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
            type='button'
          >
            <X className='w-5 h-5' />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto'>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type='button'
              onClick={() => handleSelectPlace(suggestion.place_id, suggestion.description)}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 text-left ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <MapPin className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-slate-900 truncate'>
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                {suggestion.structured_formatting?.secondary_text && (
                  <div className='text-sm text-slate-500 truncate'>
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && inputValue.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className='absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-slate-500'>
          Không tìm thấy kết quả cho "{inputValue}"
        </div>
      )}
    </div>
  )
}

export default GoongAutocomplete
