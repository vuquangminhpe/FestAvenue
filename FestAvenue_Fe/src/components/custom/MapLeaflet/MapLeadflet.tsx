import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

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
}

const LeafletMap: React.FC<LeafletMapProps> = ({ center, zoom, onMapClick, markerPosition }) => {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} className='h-[300px] w-full rounded-lg'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <MapEventHandler onMapClick={onMapClick} />

      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]}>
          <Popup>
            Vị trí đã chọn: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default LeafletMap
