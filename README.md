# 버그버그 (Bugbug)

해충 방제 의뢰와 헌터를 연결하는 매칭 플랫폼입니다.  
사용자는 해충 피해 의뢰를 등록하고, 헌터(방역 전문가)가 수락하여 완료하는 구조로 운영됩니다.

---

## 기술 스택

### Backend
- Java 21, Spring Boot 4.0.6
- Spring Security (현재 세션 기반 인증 → JWT 인증으로 전환 예정), Spring Data JPA
- WebSocket / STOMP (실시간 채팅)
- MySQL, Lombok, SpringDoc OpenAPI (Swagger)

### Frontend
- React 19, Vite 8
- TanStack Query (서버 상태), Zustand (클라이언트 상태)
- React Router DOM v7, Axios

---

## 프로젝트 구조

```
bugbug/
├── backend/     # Spring Boot API 서버
└── frontend/    # React 클라이언트 (Thymeleaf에서 마이그레이션 진행 중)
```

---

## 시작하기

### 사전 요구사항
- Java 21+
- Node.js 18+
- MySQL

### Backend

`backend/` 디렉토리에서 실행합니다.

```bash
# 환경변수 설정 (.env 파일 또는 application.properties)
# DB_URL, DB_USERNAME, DB_PASSWORD 등 설정 필요

./gradlew bootRun
```

서버가 `http://localhost:8080`에서 실행됩니다.  
API 문서: `http://localhost:8080/swagger-ui/index.html`

### Frontend

`frontend/` 디렉토리에서 실행합니다.

```bash
npm install
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.  
백엔드 API는 `.env.development`의 `VITE_API_BASE_URL`(기본값: `http://localhost:8080`)로 연결됩니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 회원가입 / 로그인 | 세션 기반 인증 (JWT로 전환 예정) |
| 의뢰 등록 / 조회 | 해충 피해 의뢰글 작성 및 목록/상세 조회 |
| 헌터 매칭 | 헌터 목록 조회, 의뢰 지원 및 수락 |
| 실시간 채팅 | STOMP WebSocket 기반 의뢰자-헌터 1:1 채팅 |
| 리뷰 | 완료된 의뢰에 대한 헌터 리뷰 작성 |
| 모기지수 지도 | 지역별 모기지수 시각화 (외부 API 연동) |
| 관리자 | 헌터 신청 승인, 사용자 계정 관리 |

---

## 역할 구조

```
ROLE_USER   → 의뢰 등록, 헌터 검색, 채팅, 리뷰 작성
ROLE_HUNTER → USER 권한 + 의뢰 수락 및 완료 처리
ROLE_ADMIN  → 전체 관리 (헌터 승인, 계정 정지 등)
```

헌터 자격은 관리자 승인 후 `ROLE_USER` → `ROLE_HUNTER`로 전환됩니다.
