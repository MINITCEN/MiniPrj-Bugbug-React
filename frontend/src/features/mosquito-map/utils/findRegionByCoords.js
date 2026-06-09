// 위/경도 점이 폴리곤 내부에 있는지 판정 (Ray-casting 알고리즘)
function pointInRing(lon, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = ((yi > lat) !== (yj > lat))
      && (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

// GeoJSON 자치구 데이터에서 해당 좌표가 속하는 regionId를 찾는다.
export default function findRegionByCoords(geoJson, regionByName, lat, lon) {
  if (!geoJson || lat == null || lon == null) return null

  for (const feature of geoJson.features) {
    const name = feature.properties?.SIG_KOR_NM ?? feature.properties?.name
    const region = regionByName.get(name)
    if (!region) continue

    const geometry = feature.geometry
    const polygons = geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.coordinates // MultiPolygon

    for (const polygon of polygons) {
      const outerRing = polygon[0]
      if (pointInRing(lon, lat, outerRing)) {
        return region.regionId
      }
    }
  }
  return null
}
