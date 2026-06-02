/**
 * 공용 Modal 베이스 컴포넌트.
 *
 * 다른 모달들(ProfileModal, HunterApplyModal 등)은 모두 이 컴포넌트를
 * 깔고 그 안에 자기 내용을 children으로 채웁니다.
 *
 * 책임:
 *  - 백드롭 표시 + 클릭 시 닫기
 *  - ESC 키로 닫기
 *  - 모달 열려있는 동안 body 스크롤 잠금
 *  - createPortal로 #root 바깥에 렌더링 (z-index 충돌 방지)
 *
 * Props:
 *  - open: boolean (모달 열림 여부)
 *  - onClose: () => void (닫기 콜백)
 *  - title: string (모달 제목, 접근성용 aria-labelledby와 연결)
 *  - size?: 'sm' | 'md' | 'lg' (max-width 분기, 기본 md)
 *  - closeOnBackdrop?: boolean (백드롭 클릭으로 닫을지, 기본 true)
 *
 * Modal.Body, Modal.Footer를 같이 export해서 일관된 레이아웃 강제.
 */
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  children,
}) {
  // useId는 SSR/CSR 모두에서 안정적인 고유 ID. Math.random 호출(impure) 제거.
  const titleId = useId()

  // ESC 키로 닫기 + body 스크롤 잠금
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    // body 스크롤 잠금 (모달 뒤 페이지가 스크롤되는 걸 방지)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  }[size]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* 모달 본체 — 백드롭 클릭이 본체로 전파되지 않도록 stopPropagation */}
      <div
        className={`relative w-full ${sizeClass} bg-surface rounded-[18px] shadow-xl max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 제목 + 닫기 버튼 */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <h2 id={titleId} className="text-lg font-bold text-ink flex-1">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-2 hover:text-ink hover:bg-hair/40 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  )
}

/**
 * 모달 본문 영역. 스크롤 가능한 컨텐츠 박스.
 * children 안에 폼이나 텍스트가 들어감.
 */
Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-2 overflow-y-auto ${className}`}>
      {children}
    </div>
  )
}

/**
 * 모달 하단 버튼 영역. 우측 정렬.
 * 보통 [취소] [확인] 두 개가 들어감.
 */
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-2 p-6 pt-4 ${className}`}>
      {children}
    </div>
  )
}