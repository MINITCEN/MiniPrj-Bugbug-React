/**
 * "더보기" 기타 서비스 바로가기 섹션 (공용).
 *
 * ADMIN role인 경우 관리자 대시보드 링크 추가 노출.
 */
import useAuthStore from '../../../auth/store/useAuthStore'
import SectionShell from '../SectionShell'
import Button from '../Button'

export default function MoreServicesSection() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <SectionShell>
      <h2 className="text-lg font-bold text-ink mb-1">더보기</h2>
      <p className="text-xs text-ink-2 mb-4">기타 서비스</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ServiceLink href="/service-intro" label="서비스 소개" />
        <ServiceLink href="/mosquito-map" label="모기지수 지도" />
        {isAdmin && (
          <ServiceLink href="/admin/users" label="관리자 대시보드" primary />
        )}
      </div>
    </SectionShell>
  )
}

function ServiceLink({ href, label, primary = false }) {
  return (
    <Button
      as="a"
      href={href}
      variant={primary ? 'primary' : 'secondary'}
      size="md"
      className="w-full justify-center min-h-[48px]"
    >
      {label}
    </Button>
  )
}
