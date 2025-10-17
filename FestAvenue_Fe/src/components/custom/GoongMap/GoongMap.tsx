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
  const [mapReady, setMapReady] = useState(false)

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

    // Store map reference immediately
    mapRef.current = map

    // Wait for map to load before allowing updates
    map.on('load', () => {
      setMapReady(true)
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
      setMapReady(false)
    }
  }, [])

  // Update center and zoom - prioritize markerPosition over center prop
  useEffect(() => {
    // Wait for map to be ready
    if (!mapReady || !mapRef.current) {
      return
    }

    // If markerPosition exists, prioritize it and zoom to 15
    if (markerPosition) {
      mapRef.current.flyTo({
        center: [markerPosition.lng, markerPosition.lat],
        zoom: 15,
        essential: true,
        duration: 1000
      })
    } else {
      // Otherwise use center prop
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        zoom: zoom,
        essential: true,
        duration: 1000
      })
    }
  }, [mapReady, center.lat, center.lng, zoom, markerPosition?.lat, markerPosition?.lng])

  // Debug log for markerPosition changes
  useEffect(() => {}, [markerPosition?.lat, markerPosition?.lng])

  // Update markers (wait for map to load)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.goongjs) {
      return
    }

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

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
      markersRef.current.forEach((marker) => marker.remove())
    }
  }, [mapReady, markerPosition, userPosition])

  return (
    <div className='relative h-[400px] w-full rounded-lg overflow-hidden border border-slate-200'>
      <div ref={mapContainerRef} className='w-full h-full' />
    </div>
  )
}

export default GoongMap
