# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bugbug(버그버그)** — 해충 방제 서비스 플랫폼. 일반 사용자(User)가 해충 의뢰(Request)를 등록하면, 헌터(Hunter)가 수락하여 완료하는 매칭 서비스.

모노레포 구조:
- `backend/` — Spring Boot REST API + Thymeleaf (기존 서버사이드 렌더링)
- `frontend/` — React + Vite (백엔드에서 React로 마이그레이션 진행 중)

## Commands

### Frontend (`frontend/` 디렉토리에서 실행)
```bash
npm run dev       # 개발 서버 시작 (기본 포트 5173)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run preview   # 빌드 결과 미리보기
```

### Backend (`backend/` 디렉토리에서 실행)
```bash
./gradlew bootRun          # 서버 시작 (포트 8080)
./gradlew test             # 전체 테스트 실행
./gradlew test --tests "com.bug.catcher.SomeTest"  # 단일 테스트 실행
./gradlew build            # 빌드 (JAR 생성)
```

## Architecture

### Backend 구조

**패키지 구조 원칙**: 도메인 중심 분리
```
global/         # 횡단 관심사
  config/       # Security, WebSocket, CORS, Swagger 설정
  auth/         # CustomUserDetailsService, CustomUserPrincipal
  exception/    # GlobalExceptionHandler
  infra/        # 외부 API 연동 (모기지수, 기상예보)
  scheduler/    # 배치 스케줄러
  file/         # 파일 저장 유틸

domain/
  entity/       # 모든 JPA 엔티티 (도메인별 분리 없이 한 곳에 집중)
  {feature}/
    controller/ # REST API + (일부) Thymeleaf 페이지 컨트롤러 병존
    service/
    repository/
    dto/
    security/   # @PreAuthorize용 권한 체크 빈 (일부 도메인)
```

**인증**: Spring Security 세션 기반 (`HttpSessionSecurityContextRepository`). JWT 없음. `/api/**` 경로는 미인증 시 401 반환, 그 외는 `/login` 리다이렉트.

**역할**: `ROLE_USER`, `ROLE_HUNTER`, `ROLE_ADMIN`

**파일 업로드**: 로컬 `uploads/` 디렉토리에 저장, `/uploads/**`로 정적 서빙.

**외부 API**: 모기지수(`MosquitoApiService`), 기상예보(`WeatherForecastApiService`) — 스케줄러로 주기적 수집.

**WebSocket**: STOMP 기반 채팅 (`ChatMessage`, `ChatRoom`).

### Frontend 구조

**아키텍처**: Feature-Sliced Design(FSD) 적용 중
```
src/
  app/          # 앱 진입점, 라우터, 전역 프로바이더
  features/     # 도메인별 기능 (auth, chat, hunter, map, request, review, ...)
  shared/
    api/        # Axios 인스턴스, API 호출 함수
    components/ # 공통 UI 컴포넌트
    hooks/      # 공통 커스텀 훅
    layouts/    # 레이아웃 컴포넌트
    lib/        # 유틸리티
    styles/     # 전역 스타일
    constants/  # 상수
```

**상태 관리**:
- 서버 상태: TanStack Query (React Query v5)
- 클라이언트 상태: Zustand

**API 통신**: Axios. 개발 환경에서 백엔드 `http://localhost:8080`으로 연결 (`.env.development`의 `VITE_API_BASE_URL`).

**언어**: JavaScript (TypeScript 미사용). JSX 파일은 `.jsx` 확장자.

### 핵심 도메인 개념

| 엔티티 | 설명 |
|--------|------|
| `User` | 일반 사용자. 의뢰 등록, 헌터 즐겨찾기 가능 |
| `Hunter` | 헌터 자격을 취득한 사용자. `User`와 별도 엔티티로 분리 |
| `Request` | 해충 의뢰. `status` 필드로 상태 관리 (접수/진행/완료 등) |
| `Application` | 헌터가 의뢰에 지원하는 신청서 |
| `HunterApplication` | 헌터 자격 신청 (관리자 승인 필요) |
| `Review` | 의뢰 완료 후 사용자가 헌터에게 남기는 리뷰 |
| `ChatRoom` / `ChatMessage` | 의뢰 기반 1:1 채팅 |
| `DailyRegionMosquitoIndex` | 지역별 일일 모기지수 (외부 API 수집) |

### 마이그레이션 현황

백엔드에 Thymeleaf 기반 페이지 컨트롤러(`*PageController`, `*ViewController`)와 REST API 컨트롤러가 병존함. React 마이그레이션 완료된 페이지는 프론트엔드에서 API만 사용하고 Thymeleaf 뷰는 제거 예정.
