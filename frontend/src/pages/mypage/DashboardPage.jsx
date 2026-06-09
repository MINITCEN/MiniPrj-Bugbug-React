import { useState } from 'react'
import useAuthStore from '../../features/auth/store/useAuthStore'

import MyInfoSection from '../../features/mypage/components/dashboard/MyInfoSection'
import HunterPublicSection from '../../features/mypage/components/dashboard/HunterPublicSection'
import UserActivitySection from '../../features/mypage/components/dashboard/UserActivitySection'
import HunterActivitySection from '../../features/mypage/components/dashboard/HunterActivitySection'
import HunterSavedRequestsSection from '../../features/mypage/components/dashboard/HunterSavedRequestsSection'
import MoreServicesSection from '../../features/mypage/components/dashboard/MoreServicesSection'
import SectionShell from '../../features/mypage/components/SectionShell'
import Button from '../../features/mypage/components/Button'

import ProfileModal from '../../features/mypage/components/modals/ProfileModal'
import HunterResignConfirmModal from '../../features/mypage/components/modals/HunterResignConfirmModal'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isHunter = user?.role === 'HUNTER'

  const [profileOpen, setProfileOpen] = useState(false)
  const [resignOpen, setResignOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <MyInfoSection onOpenProfileModal={() => setProfileOpen(true)} />

      {isHunter && (
        <HunterPublicSection onResignHunter={() => setResignOpen(true)} />
      )}

      {!isHunter ? (
        <UserActivitySection />
      ) : (
        <div className="flex flex-col gap-4">
          <HunterActivitySection />
          <HunterSavedRequestsSection />
        </div>
      )}

      <MoreServicesSection />

      <SectionShell className="bg-brand/5 border-brand/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-ink leading-relaxed">
          <strong className="text-brand">버그버그는 안전하고 신뢰할 수 있는 서비스를 제공합니다.</strong>
          <br className="sm:hidden" /> 개인정보는 설정된 보호 범위 안에서만 사용됩니다.
        </p>
        <Button variant="secondary" size="sm" className="shrink-0">
          개인정보 처리방침 보기
        </Button>
      </SectionShell>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      {isHunter && (
        <HunterResignConfirmModal
          open={resignOpen}
          onClose={() => setResignOpen(false)}
        />
      )}
    </div>
  )
}