/**
 * 헌터 등급 관련 상수.
 *
 * 백엔드 HunterProfileResponseDto.getGradeStory()와 dashboard.html 에 박혀있던
 * 등급 정보를 한 곳에 모았습니다. 등급 추가/변경 시 이 파일만 수정하면 됩니다.
 *
 * 이미지는 백엔드의 /image/ 정적 리소스를 사용 (vite proxy 설정에 의해 dev에서도 작동).
 */

/** 등급명 → 훈장 이미지 경로 */
export const GRADE_IMAGE = {
  루키: '/image/bugbug_rookie.png',
  브론즈: '/image/bugbug_bronze.png',
  실버: '/image/bugbug_silver.png',
  골드: '/image/bugbug_gold.png',
  레전드: '/image/bugbug_legend.png',
}

/** 헌터 등급 카드 데이터 (헌터 등급 안내 모달용 — 7단계 모달에서도 재사용) */
export const HUNTER_GRADES = [
  {
    name: '루키',
    en: 'Rookie',
    level: 1,
    image: GRADE_IMAGE['루키'],
    description: '버그버그에 첫발을 내디딘 신참 헌터. 가볍게 시작해 현장 경험을 쌓습니다.',
    condition: '가입 완료',
  },
  {
    name: '브론즈',
    en: 'Bronze',
    level: 2,
    image: GRADE_IMAGE['브론즈'],
    description: '기본 장비와 본사 도구를 마스터하고, 다소 안전거리를 확보하는 스마트한 헌터입니다.',
    condition: '퇴치 완료 3회',
  },
  {
    name: '실버',
    en: 'Silver',
    level: 3,
    image: GRADE_IMAGE['실버'],
    description: '고전압 전기 제압 장비를 자유자재로 다루며, 찰나의 순간에 상황을 종결짓는 숙련된 요원.',
    condition: '퇴치 완료 10회',
  },
  {
    name: '골드',
    en: 'Gold',
    level: 4,
    image: GRADE_IMAGE['골드'],
    description: '완벽한 차단과 복합 흡입 장비를 무장한 마스터. 해충뿐 아니라 환경과 유해 물질까지 지워버리는 전문가.',
    condition: '퇴치 완료 20회',
  },
  {
    name: '레전드',
    en: 'Legend',
    level: 5,
    image: GRADE_IMAGE['레전드'],
    description: '수많은 현장을 평정한 최고의 해결사. 등장만으로 공간의 쾌적함을 보장하는 전설적인 존재.',
    condition: '퇴치 완료 40회 · ★ 4.8 이상',
  },
]

/** 등급별 이미지 경로 안전하게 가져오기 */
export const getGradeImage = (grade) => GRADE_IMAGE[grade] ?? GRADE_IMAGE['루키']