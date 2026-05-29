/**
 * "더보기" 기타 서비스 바로가기 섹션 (공용).
 *
 * ADMIN role인 경우 관리자 대시보드 링크 추가 노출.
 */
import useAuthStore from '../../../auth/store/useAuthStore'

export default function MoreServicesSection() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-1">더보기</h2>
      <p className="text-xs text-gray-500 mb-4">기타 서비스</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ServiceLink href="/service-intro" label="서비스 소개" />
        <ServiceLink href="/mosquito-map" label="모기지수 지도" />
        {isAdmin && (
          <ServiceLink href="/admin/users" label="관리자 대시보드" primary />
        )}
      </div>
    </section>
  )
}

function ServiceLink({ href, label, primary = false }) {
  const baseClass =
    'flex items-center justify-center min-h-[48px] px-4 rounded-xl text-sm font-bold transition-colors'
  const styleClass = primary
    ? 'bg-green-600 text-white hover:bg-green-700'
    : 'border border-green-200 text-green-700 hover:bg-green-50'

  return (
    <a href={href} className={`${baseClass} ${styleClass}`}>
      {label}
    </a>
  )
}