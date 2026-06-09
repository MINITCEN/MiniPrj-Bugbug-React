/**
 * 내 정보 카드 (USER + HUNTER 공용).
 *
 * 데이터: useMyInfo (GET /api/mypage/info)
 *  → email, nickname, phoneNumber, address, role
 *
 * "개인정보 변경" 버튼은 ProfileModal과 연결.
 */
import { useMyInfo } from '../../hooks/queries'
import SectionShell from '../SectionShell'
import Button from '../Button'

export default function MyInfoSection({ onOpenProfileModal }) {
  const { data: myInfo, isLoading } = useMyInfo()

  if (isLoading || !myInfo) {
    return (
      <SectionShell>
        <p className="text-sm text-muted">불러오는 중...</p>
      </SectionShell>
    )
  }

  const isHunter = myInfo.role === 'HUNTER'
  const initial = myInfo.nickname?.charAt(0) ?? '?'

  return (
    <SectionShell>
      {/* 섹션 헤더: 제목 + 개인정보 변경 버튼 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">내 정보</h1>
          <p className="mt-1 text-xs text-ink-2">
            회원님의 정보는 본인에게만 공개됩니다.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onOpenProfileModal}>
          개인정보 변경
        </Button>
      </div>

      {/* 본문: 아바타 + 정보 그리드 */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* 아바타 (닉네임 첫 글자) */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full bg-brand/10 text-brand flex items-center justify-center text-3xl font-bold">
            {initial}
          </div>
        </div>

        {/* 정보 그리드 */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
          <InfoItem label="이름" value={myInfo.nickname} />
          <InfoItem label="권한" value={isHunter ? '헌터' : '일반 회원'} />
          <InfoItem label="연락처" value={myInfo.phoneNumber || '-'} />
          <InfoItem label="주소" value={myInfo.address || '등록된 주소가 없습니다.'} full />
          <InfoItem label="이메일" value={myInfo.email} full />
        </dl>
      </div>
    </SectionShell>
  )
}

/* ───────────── 보조 컴포넌트 ───────────── */

function InfoItem({ label, value, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs text-ink-2 mb-1">{label}</dt>
      <dd className="text-sm text-ink break-words">{value}</dd>
    </div>
  )
}
