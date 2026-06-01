import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { STATUS_COLORS } from '../../features/mosquito-map/constants'

const SEOUL_CENTER = [37.5665, 126.9780]
const DEFAULT_ZOOM = 11

export default function MapPanel({ regions, selectedRegionId, onSelect }) {
  const [geoJson, setGeoJson] = useState(null)

  useEffect(() => {
    fetch('/map/seoul-districts.geojson')
      .then((res) => res.json())
      .then(setGeoJson)
      .catch(() => setGeoJson(null))
  }, [])

  const regionByName = new Map(regions.map((r) => [r.location, r]))

  const styleFeature = (feature) => {
    const name = feature.properties?.SIG_KOR_NM ?? feature.properties?.name
    const region = regionByName.get(name)
    const selected = region?.regionId === selectedRegionId
    const color = region ? STATUS_COLORS[region.status] : '#cccccc'
    return {
      color: selected ? '#1d3a2e' : '#fff',
      weight: selected ? 3 : 1,
      fillColor: color,
      fillOpacity: selected ? 0.85 : 0.65,
    }
  }

  const onEachFeature = (feature, layer) => {
    const name = feature.properties?.SIG_KOR_NM ?? feature.properties?.name
    const region = regionByName.get(name)
    if (region) {
      layer.bindTooltip(`${name} (${Math.round(region.index)} · ${region.status})`, { sticky: true })
      layer.on('click', () => onSelect(region.regionId))
    }
  }

  return (
    <div
      className="overflow-hidden relative"
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1px solid var(--hair-2)',
        height: 540,
      }}
    >
      <MapContainer center={SEOUL_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJson && (
          <GeoJSON
            key={selectedRegionId}
            data={geoJson}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  )
}
