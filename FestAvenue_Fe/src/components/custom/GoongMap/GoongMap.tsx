import React, { useEffect, useRef, useState } from 'react'

// Declare goongjs from CDN
declare global {
  interface Window {
    goongjs: any
  }
}

interface GoongMapProps {
  center: { lat: number; lng: number }
  zoom: number
  onMapClick?: (e: { lat: number; lng: number }) => void
  markerPosition?: { lat: number; lng: number }
  userPosition?: { lat: number; lng: number }
  goongApiKey?: string
}

const GoongMap: React.FC<GoongMapProps> = ({
  center,
  zoom,
  onMapClick,
  markerPosition,
  userPosition,
  goongApiKey = import.meta.env.VITE_GOONG_MAPTILES_KEY || ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current || !window.goongjs) return

    // Initialize map
    window.goongjs.accessToken = goongApiKey

    const map = new window.goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [center.lng, center.lat],
      zoom: zoom
    })

    // Wait for map to load before making it available
    map.on('load', () => {
      mapRef.current = map
      setMapLoaded(true)
      console.log('Goong Map loaded successfully')
    })

    // Add navigation controls
    map.addControl(new window.goongjs.NavigationControl(), 'top-right')

    // Handle map click
    if (onMapClick) {
      map.on('click', (e: any) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      })
    }

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, [])

  // Update center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        zoom: zoom,
        essential: true
      })
    }
  }, [center.lat, center.lng, zoom])

  // Update markers (wait for map to load)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.goongjs) {
      console.log('Map not ready yet for markers, mapLoaded:', mapLoaded)
      return
    }

    console.log('Updating markers:', { markerPosition, userPosition })

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Fly to marker position if exists
    if (markerPosition) {
      mapRef.current.flyTo({
        center: [markerPosition.lng, markerPosition.lat],
        zoom: 15,
        essential: true
      })
    }

    // Add user position marker (blue)
    if (userPosition) {
      const userMarkerEl = document.createElement('div')
      userMarkerEl.className = 'custom-marker'
      userMarkerEl.innerHTML = `
        <div style="position: relative; cursor: pointer;">
          <svg width="32" height="41" viewBox="0 0 24 24">
            <path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z" fill="#3B82F6"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      `

      const userMarker = new window.goongjs.Marker(userMarkerEl)
        .setLngLat([userPosition.lng, userPosition.lat])
        .setPopup(
          new window.goongjs.Popup({ offset: 25 }).setHTML(
            `<strong>Vị trí của bạn</strong><br/>${userPosition.lat.toFixed(6)}, ${userPosition.lng.toFixed(6)}`
          )
        )
        .addTo(mapRef.current)

      markersRef.current.push(userMarker)
    }

    // Add event location marker (red)
    if (markerPosition) {
      const markerEl = document.createElement('div')
      markerEl.className = 'custom-marker'
      markerEl.innerHTML = `
        <div style="position: relative; cursor: pointer;">
          <svg width="32" height="41" viewBox="0 0 24 24">
            <path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z" fill="#EF4444"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      `

      const marker = new window.goongjs.Marker(markerEl)
        .setLngLat([markerPosition.lng, markerPosition.lat])
        .setPopup(
          new window.goongjs.Popup({ offset: 25 }).setHTML(
            `<strong>Địa điểm sự kiện</strong><br/>${markerPosition.lat.toFixed(6)}, ${markerPosition.lng.toFixed(6)}`
          )
        )
        .addTo(mapRef.current)

      markersRef.current.push(marker)
    }

    // Cleanup markers
    return () => {
      markersRef.current.forEach(marker => marker.remove())
    }
  }, [mapLoaded, markerPosition, userPosition])

  return (
    <div className='relative h-[400px] w-full rounded-lg overflow-hidden border border-slate-200'>
      <div ref={mapContainerRef} className='w-full h-full' />

      {/* Attribution */}
      <div className='absolute bottom-0 right-0 bg-white bg-opacity-75 px-2 py-1 text-xs text-slate-600'>
        © <a href='https://goong.io' target='_blank' rel='noopener noreferrer' className='hover:underline'>Goong</a>
      </div>
    </div>
  )
}

export default GoongMap
