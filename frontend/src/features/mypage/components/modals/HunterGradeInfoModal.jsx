/**
 * 헌터 등급 안내 모달 (정보성).
 *
 * 5개 등급의 이미지 / 설명 / 달성 조건을 표 형태로 나열.
 * 데이터는 6단계의 constants.js에서 가져옴.
 *
 * mutation 없음, API 호출 없음 — 순수 정적 컨텐츠.
 */
import Modal from '../Modal'
import ItemCard from '../ItemCard'
import { HUNTER_GRADES } from '../dashboard/constants'

export default function HunterGradeInfoModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="헌터 등급제" size="lg">
      <Modal.Body className="space-y-4">
        <p className="text-sm text-ink-2">
          활동 실적에 따라 성장하는 버그버그 헌터 등급 체계입니다.
        </p>

        <div className="space-y-3">
          {HUNTER_GRADES.map((grade) => (
            <GradeCard key={grade.name} grade={grade} />
          ))}
        </div>

        <p className="text-xs text-muted text-center pt-2">
          더 많이 활동할수록 더 높은 등급과 특별한 보상이 기다리고 있어요.
        </p>
      </Modal.Body>
    </Modal>
  )
}

function GradeCard({ grade }) {
  return (
    <ItemCard className="flex items-center gap-4 p-4">
      {/* 등급 이미지 */}
      <div className="shrink-0 w-16 h-16">
        <img
          src={grade.image}
          alt={`${grade.name} 등급 훈장`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* 설명 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-ink">
          {grade.name}{' '}
          <small className="text-xs font-normal text-ink-2">
            {grade.en} · LV.{grade.level}
          </small>
        </h3>
        <p className="text-xs text-ink-2 mt-1 leading-relaxed">{grade.description}</p>
      </div>

      {/* 달성 조건 */}
      <div className="shrink-0 text-right">
        <p className="text-[10px] text-muted mb-1">달성 조건</p>
        <p className="text-xs font-semibold text-brand">✓ {grade.condition}</p>
      </div>
    </ItemCard>
  )
}
