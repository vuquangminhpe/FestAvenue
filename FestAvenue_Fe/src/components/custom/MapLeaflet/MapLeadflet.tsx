import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const eventIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to fit bounds when route changes
const FitBounds = ({ routeCoordinates }: { routeCoordinates?: [number, number][] }) => {
  const map = useMap()

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [routeCoordinates, map])

  return null
}

const MapEventHandler = ({ onMapClick }: { onMapClick?: (e: { lat: number; lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        const { lat, lng } = e.latlng
        onMapClick({ lat, lng })
      }
    }
  })
  return null
}

interface LeafletMapProps {
  center: { lat: number; lng: number }
  zoom: number
  onMapClick?: (e: { lat: number; lng: number }) => void
  markerPosition?: { lat: number; lng: number }
  userPosition?: { lat: number; lng: number }
  routeCoordinates?: [number, number][]
  routeDistance?: number
  routeDuration?: number
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom,
  onMapClick,
  markerPosition,
  userPosition,
  routeCoordinates,
  routeDistance,
  routeDuration
}) => {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className='h-[300px] w-full rounded-lg'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <MapEventHandler onMapClick={onMapClick} />
      <FitBounds routeCoordinates={routeCoordinates} />

      {/* User's current location */}
      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
          <Popup>
            <div className='text-sm'>
              <strong>Vị trí của bạn</strong>
              <br />
              {userPosition.lat.toFixed(4)}, {userPosition.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Event location */}
      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]} icon={eventIcon}>
          <Popup>
            <div className='text-sm'>
              <strong>Địa điểm sự kiện</strong>
              <br />
              {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
              {routeDistance && routeDuration && (
                <>
                  <br />
                  <br />
                  <strong>Khoảng cách:</strong> {(routeDistance / 1000).toFixed(2)} km
                  <br />
                  <strong>Thời gian:</strong> {Math.round(routeDuration / 60)} phút
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route line */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates} color='#3b82f6' weight={4} opacity={0.7} />
      )}
    </MapContainer>
  )
}

export default LeafletMap
