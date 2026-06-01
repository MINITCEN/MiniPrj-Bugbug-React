import { useCallback, useEffect, useRef, useState } from 'react'
import useRegions from '../../features/mosquito-map/hooks/useRegions'
import useRegionSummary from '../../features/mosquito-map/hooks/useRegionSummary'
import useUserCoords from '../../features/mosquito-map/hooks/useUserCoords'
import findRegionByCoords from '../../features/mosquito-map/utils/findRegionByCoords'
import { DEFAULT_REGION_ID } from '../../features/mosquito-map/constants'
import MapPanel from './MapPanel'
import RegionListPanel from './RegionListPanel'
import RegionDetailPanel from './RegionDetailPanel'
import LegendPanel from './LegendPanel'

function fmtUpdated(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function MosquitoMapPage() {
  const [selectedRegionId, setSelectedRegionId] = useState(DEFAULT_REGION_ID)
  const userSelectedRef = useRef(false)
  const geoJsonRef = useRef(null)

  const regionsQuery = useRegions()
  const summaryQuery = useRegionSummary(selectedRegionId)
  const userCoords = useUserCoords()

  const regions = regionsQuery.data ?? []

  // 사용자가 직접 선택한 후엔 더 이상 자동 위치 매칭으로 덮어쓰지 않는다.
  const handleSelect = (id) => {
    userSelectedRef.current = true
    setSelectedRegionId(id)
  }

  const handleGeoJsonLoaded = useCallback((data) => {
    geoJsonRef.current = data
  }, [])

  // 좌표 + GeoJSON + regions 모두 갖춰지면 자동으로 자치구 선택
  useEffect(() => {
    if (userSelectedRef.current) return
    if (!userCoords || !geoJsonRef.current || regions.length === 0) return
    const regionByName = new Map(regions.map((r) => [r.location, r]))
    const matched = findRegionByCoords(geoJsonRef.current, regionByName, userCoords.lat, userCoords.lon)
    if (matched) setSelectedRegionId(matched)
  }, [userCoords, regions])

  const handleRefresh = () => {
    regionsQuery.refetch()
    summaryQuery.refetch()
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 960px 720px at 78% 38%, rgba(46,140,104,.10), transparent 62%),
          radial-gradient(ellipse 760px 620px at 8% 78%, rgba(229,87,58,.06), transparent 62%),
          #fbfaf6
        `,
      }}
    >
      <div className="relative max-w-screen-xl mx-auto px-12 pt-10 pb-16 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
            서울시 모기지수 지도
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-2)' }}>
            서울 25개 자치구의 현재 모기 활동 지수와 단계, 상세 기상 정보를 한 화면에서 확인합니다.
          </p>
        </header>

        <div className="grid gap-5 items-stretch" style={{ gridTemplateColumns: '280px 1fr 340px' }}>
          {/* 사이드바 */}
          <div className="flex flex-col gap-5 h-full">
            <RegionListPanel
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelect={handleSelect}
            />
            <div className="flex-1 flex flex-col">
              <LegendPanel />
            </div>
          </div>

          {/* 지도 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                서울 모기 활동 현황
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  최종 업데이트 {fmtUpdated(regionsQuery.dataUpdatedAt)}
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'var(--ink)', color: '#fff', borderRadius: 999 }}
                >
                  새로고침
                </button>
              </div>
            </div>
            <MapPanel
              regions={regions}
              selectedRegionId={selectedRegionId}
              onSelect={handleSelect}
              onGeoJsonLoaded={handleGeoJsonLoaded}
            />
          </div>

          {/* 상세 */}
          <RegionDetailPanel
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
          />
        </div>
      </div>
    </div>
  )
}
