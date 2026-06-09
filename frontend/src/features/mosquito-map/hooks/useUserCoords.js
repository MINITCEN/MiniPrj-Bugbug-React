import { useEffect, useState } from 'react'

// 진입 시 브라우저 Geolocation으로 사용자 좌표를 한 번 가져온다.
// 권한 거부, 미지원, 실패 시 null 유지.
export default function useUserCoords() {
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords(null),
      { timeout: 5000 },
    )
  }, [])

  return coords
}
