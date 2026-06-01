/**
 * 내 정보 카드 (USER + HUNTER 공용).
 *
 * 데이터: useMyInfo (GET /api/mypage/info)
 *  → email, nickname, phoneNumber, address, role
 *
 * "개인정보 변경" 버튼은 7단계에서 ProfileModal과 연결 예정.
 * 현재는 onClick에서 부모로부터 받은 콜백을 호출.
 */
import { useMyInfo } from '../../hooks/queries'

export default function MyInfoSection({ onOpenProfileModal }) {
  const { data: myInfo, isLoading } = useMyInfo()

  if (isLoading || !myInfo) {
    return <SectionShell><p className="text-sm text-gray-400">불러오는 중...</p></SectionShell>
  }

  const isHunter = myInfo.role === 'HUNTER'
  const initial = myInfo.nickname?.charAt(0) ?? '?'

  return (
    <SectionShell>
      {/* 섹션 헤더: 제목 + 개인정보 변경 버튼 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
          <p className="mt-1 text-xs text-gray-500">
            회원님의 정보는 본인에게만 공개됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="px-3 py-2 text-xs font-semibold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          개인정보 변경
        </button>
      </div>

      {/* 본문: 아바타 + 정보 그리드 */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* 아바타 (닉네임 첫 글자) */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-bold">
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

function SectionShell({ children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {children}
    </section>
  )
}

function InfoItem({ label, value, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 break-words">{value}</dd>
    </div>
  )
}