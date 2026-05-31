/**
 * 모달용 공통 버튼들.
 *
 * 모달마다 [취소] [확인] [위험 액션] 버튼이 반복되어 스타일 일관성을 위해 추출.
 * 사용처가 모달로 한정되어 있어 modals/ 와 같은 폴더에 둠.
 */

/** 기본(primary) 액션 버튼 — [저장], [신청] 등 */
export function PrimaryButton({ children, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg
                 hover:bg-green-700 active:bg-green-800 transition-colors
                 disabled:bg-gray-300 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  )
}

/** 위험 액션 버튼 — [헌터 자격 해제] 등 */
export function DangerButton({ children, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg
                 hover:bg-red-700 active:bg-red-800 transition-colors
                 disabled:bg-gray-300 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  )
}

/** 보조(secondary) 버튼 — [취소] 등 */
export function GhostButton({ children, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg
                 hover:bg-gray-50 active:bg-gray-100 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  )
}