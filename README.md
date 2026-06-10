# 🐛 버그버그 (Bugbug)
 
### 해충 방제 의뢰자와 헌터를 연결하는 매칭 플랫폼
<div align="center">

 

https://github.com/user-attachments/assets/d9cb196d-b83e-40a6-a942-bb55aa834015


<img width="945" height="528" alt="버그버그 피피티 메인" src="https://github.com/user-attachments/assets/c0f74aed-d213-489f-9e1f-8c63014179c5" />


 
사용자가 해충 피해 의뢰를 등록하면, 방역 전문가(헌터)가 수락하여 처리하는<br/>
**의뢰–매칭–채팅–리뷰**까지 한 흐름으로 이어지는 O2O 서비스입니다.
 
<br/>
 
</div>
<br/>

## 🧪 테스트 계정

| 구분 | 아이디 | 비밀번호 |
|------|--------|----------|
| 일반 사용자 | user01@bugbug.local | test1234! |
| 헌터 | hunter01@bugbug.local | test1234! |
| 관리자 | admin01@bugbug.local | test1234! |
 
<br/>

## 📑 목차
 
1. [프로젝트 소개](#1-프로젝트-소개)
2. [데모 미리보기](#2-데모-미리보기)
3. [팀원 구성](#3-팀원-구성)
4. [기술 스택](#4-기술-스택)
5. [프로젝트 구조](#5-프로젝트-구조)
6. [실행 방법](#6-실행-방법)
7. [주요 기능](#7-주요-기능)
8. [페이지별 기능](#8-페이지별-기능)
9. [권한(역할) 구조](#9-권한역할-구조)
<br/>

## 1. 프로젝트 소개
 
**버그버그(Bugbug)** 는 해충 피해로 고민하는 사용자와 방역 전문가(헌터)를 연결하는 매칭 플랫폼입니다.
 
- 🐜 사용자는 해충 피해 상황을 **의뢰글로 등록**하고, 헌터의 지원을 받아 매칭합니다.
- 🛡️ 헌터는 의뢰 목록을 둘러보고 **지원 → 수락 → 완료** 흐름으로 작업을 처리합니다.
- 💬 의뢰자와 헌터는 **실시간 1:1 채팅**으로 세부 사항을 조율합니다.
- ⭐ 작업이 끝나면 사용자는 **리뷰**를 남겨 헌터의 신뢰도를 쌓습니다.
- 🦟 부가 기능으로 **지역별 모기지수 지도**를 제공해 위험 지역을 한눈에 확인할 수 있습니다.
<br/>

## 2. 데모 미리보기
 
<!-- 🔲 메인 데모 GIF/영상 캡쳐 자리 (public 폴더에 시연 영상이 있습니다) -->
<div align="center">
 

https://github.com/user-attachments/assets/2821a3ec-86f6-4550-af13-d8af465c1dfb


</div>
<br/>

## 3. 팀원 구성
<div align="center">
  
| <img width="140" height="200" alt="remove_background" src="https://github.com/user-attachments/assets/ff10ea46-f075-41af-943b-9cb1457f1aac" /> |<img width="140" height="200" alt="remove_background (3)" src="https://github.com/user-attachments/assets/99bad4bb-f208-4b9c-835a-5a1a25522a92" /> | <img width="160" height="200" alt="remove_background (1)" src="https://github.com/user-attachments/assets/97dc865d-4c3f-4f89-a077-210303a74172" />| <img width="140" height="200" alt="remove_background (2)" src="https://github.com/user-attachments/assets/52c71e05-3d7a-4888-831d-085efc91b256" />|
| :---: | :---: | :---: | :---: |
| [@정가영](https://github.com/junggayeong) | [@남지호](https://github.com/jiho422) | [@이재혁](https://github.com/ljhwogur) | [@이충헌](https://github.com/leechungheon) |
| 마이페이지<br>헌터찾기<br>세션 인증 + security | 의뢰 게시글<br>헌터 의뢰 팀 | 채팅<br>관리자 대시보드<br>반응형 웹앱 UI/UX 디자인 | 모기지수 지도<br>메인 웹 서비스<br>계층형 대댓글 기능 |

</div>

> **개발 기간** : `2026.05.~2026.06`

## 4. 기술 스택
### 🖥️ Frontend
 
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square)
![React Router](https://img.shields.io/badge/React_Router_v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white)
![STOMP](https://img.shields.io/badge/STOMP.js-010101?style=flat-square)
 
### ⚙️ Backend
 
![Java](https://img.shields.io/badge/Java_21-007396?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=flat-square&logo=spring&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket_/_STOMP-010101?style=flat-square&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black)
 
### 🤝 협업 & 환경
 
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![ERDCloud](https://img.shields.io/badge/ERDCloud-2965F1?style=flat-square&logo=&logoColor=white)
![draw.io](https://img.shields.io/badge/draw.io-F08705?style=flat-square&logo=diagramsdotnet&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?style=flat-square&logo=googledrive&logoColor=white)
 
<details>
<summary><b>📦 주요 라이브러리 한눈에 보기</b></summary>
 
| 구분 | 사용 기술 | 선택 이유 |
| --- | --- | --- |
| 서버 상태 | TanStack Query | 캐싱·리페치·로딩 상태를 선언적으로 관리하여 API 코드 단순화 |
| 클라이언트 상태 | Zustand | 보일러플레이트가 적고 가벼운 전역 상태 관리 |
| 실시간 통신 | STOMP + SockJS | WebSocket 기반 1:1 채팅 구현 |
| 인증 | Spring Security + JWT | 세션 → JWT 토큰 인증으로 전환 (확장성·무상태화) |
| 지도 | Leaflet + React-Leaflet | 모기지수 지역 시각화 |
| API 문서 | SpringDoc OpenAPI (Swagger) | 프론트–백엔드 간 API 명세 공유 |
 
</details>
<br/>

## 5. 프로젝트 구조

```
bugbug/
├── backend/      # Spring Boot API 서버 (도메인형 패키지 구조)
└── frontend/     # React 클라이언트 (Feature-Sliced Design 기반)
```

<details>
<summary><b>🖥️ Frontend 구조 (FSD)</b></summary>

```
frontend/src/
├── app/                # 앱 전역 설정
│   ├── providers/      # QueryProvider 등
│   └── router/         # 라우팅 정의 + 권한 가드
├── features/           # 도메인 단위 기능
│   ├── auth/           # 인증 (상태 스토어)
│   ├── chat/           # 실시간 채팅 (소켓 훅 / 플로팅 위젯)
│   ├── mypage/         # 마이페이지 (대시보드·카드·모달)
│   └── mosquito-map/   # 모기지수 지도
├── pages/              # 라우트 단위 페이지
│   ├── admin/          # 관리자 API
│   ├── auth/  hunter/  user/  request/  review/  comment/
│   ├── hunter/  mypage/  mosquito-map/  service-intro/  main/
├── shared/             # 공용 모듈
│   ├── api/            # axios 인스턴스 + 도메인별 API
│   ├── components/auth/ # RequireAuth / RequireRole 가드
│   └── layouts/        # Header / Footer / Layout
└── styles/             # 전역 스타일
```

</details>

<details>
<summary><b>⚙️ Backend 구조 (Domain-Driven)</b></summary>

```
backend/src/main/java/com/bug/catcher/
├── domain/             # 도메인별 패키지 (controller·service·repository·dto)
│   ├── auth/            # 로그인 / 인증
│   ├── user/            # 회원
│   ├── hunter/          # 헌터
│   ├── request/         # 의뢰 (+ security)
│   ├── chat/            # 실시간 채팅
│   ├── review/          # 리뷰
│   ├── comment/         # 댓글
│   ├── map/             # 모기지수 지도
│   ├── admin/           # 관리자
│   └── entity/          # 공통 엔티티
└── global/             # 전역 설정
    ├── auth/            # 인증·보안 설정
    ├── config/          # 설정
    ├── exception/       # 예외 처리
    ├── scheduler/       # 스케줄러
    ├── file/  infra/  common/
```

</details>

<br/>

## 6. 실행 방법
 
### 사전 요구사항
- Java 21+
- Node.js 18+
- MySQL
### ⚙️ Backend
 
```bash
cd backend
 
# .env 또는 application.properties에 DB 정보 설정
# DB_URL, DB_USERNAME, DB_PASSWORD 등
 
./gradlew bootRun
```
 
- 서버: `http://localhost:8080`
- API 문서: `http://localhost:8080/swagger-ui/index.html`
### 🖥️ Frontend
 
```bash
cd frontend
 
npm install
npm run dev
```
 
- 개발 서버: `http://localhost:5173`
- 백엔드 연결: `.env.development`의 `VITE_API_BASE_URL` (기본값 `http://localhost:8080`)
<br/>

## 7. 주요 기능
 
| 기능 | 설명 |
| --- | --- |
| 🔐 회원가입 / 로그인 | Spring Security 기반 인증 (세션 → JWT 전환) |
| 📝 의뢰 등록 / 조회 | 해충 피해 의뢰글 작성, 목록·상세 조회, 수정·삭제 |
| 🛡️ 헌터 매칭 | 헌터 목록·상세 조회, 의뢰 지원 및 수락 |
| 💬 실시간 채팅 | STOMP WebSocket 기반 의뢰자–헌터 1:1 채팅, 알림 |
| ⭐ 리뷰 | 완료된 의뢰에 대한 헌터 리뷰 작성·관리 |
| 🔖 북마크 | 관심 의뢰·헌터 저장 및 마이페이지에서 관리 |
| 📊 마이페이지 대시보드 | 역할별(USER/HUNTER) 활동 현황 한눈에 보기 |
| 🦟 모기지수 지도 | 지역별 모기지수 시각화 (외부 API 연동, Leaflet) |
| 🧑‍💼 관리자 | 헌터 신청 승인, 사용자 계정 관리 |
 
<br/>

## 8. 페이지별 기능
 
<!--
  🔲 아래 각 표의 이미지 자리에 캡쳐를 넣어주세요.
  - 화면이 1개면 한 칸, 2개를 나란히 보여주고 싶으면 두 칸짜리 표를 쓰세요.
  - 설명 문구는 실제 동작에 맞게 자유롭게 다듬으면 됩니다.
-->
 
### 🔐 회원가입 / 로그인
- 이메일·비밀번호 기반 회원가입과 로그인을 제공합니다.
- 입력값 유효성 검사 후 로그인 성공 시 메인 페이지로 이동합니다.
  
| 회원가입 | 로그인 |
| :---: | :---: |
|<img width="241" height="319" alt="회원가입" src="https://github.com/user-attachments/assets/f5e970e4-8a29-4b94-9a60-90ee299fdd2a" />| <img width="213" height="201" alt="로그인" src="https://github.com/user-attachments/assets/33da43b8-0be4-46af-9597-45995d256ccb" />|
 
### 📝 의뢰 등록 / 조회
- 사용자가 해충 피해 의뢰글을 작성하고, 목록·상세 페이지에서 확인합니다.
- 작성자는 본인 의뢰를 수정·삭제할 수 있습니다.
  
| 의뢰 목록 | 의뢰 상세 |
| :---: | :---: |
| <img width="1401" height="733" alt="image" src="https://github.com/user-attachments/assets/6447eff8-32f9-4078-b6e6-e80f991c12ec" /> | <img width="1091" height="815" alt="image" src="https://github.com/user-attachments/assets/173669e6-c25a-4f14-9c7b-46c7243df245" /> |

 
### 🛡️ 헌터 매칭
- 헌터 목록과 상세 프로필을 조회하고, 의뢰에 지원/수락하는 흐름으로 매칭됩니다.
  
| 헌터 목록 | 헌터 상세 |
| :---: | :---: |
| <img width="469" height="404" alt="헌터목록" src="https://github.com/user-attachments/assets/541d9412-b785-4cc3-b064-31331cc5ca6f" />|<img width="472" height="264" alt="헌터찾기" src="https://github.com/user-attachments/assets/fb08202d-9f5e-4aa6-ab88-ba7437566cae" />|
 
### 💬 실시간 채팅
- STOMP WebSocket으로 의뢰자–헌터 간 1:1 실시간 채팅을 제공합니다.
- 플로팅 위젯과 채팅 알림으로 새 메시지를 확인할 수 있습니다.
  
| 채팅 |
| :---: |
| <img width="561" height="450" alt="image" src="https://github.com/user-attachments/assets/7d2640a3-0ff5-4895-a130-89dc8216e07d" />|
 
### ⭐ 리뷰
- 완료된 의뢰에 대해 사용자가 헌터 리뷰를 작성하고, 마이페이지에서 관리합니다.
  
| 리뷰 작성 |
| :---: |
| <img width="1426" height="898" alt="리뷰작성" src="https://github.com/user-attachments/assets/aa1a5c85-2bcd-4e0f-8ec1-98286fa28cee" />|
 
### 📊 마이페이지 대시보드
- 로그인 사용자의 역할(USER/HUNTER)에 맞춰 활동 현황, 북마크, 작업 내역을 보여줍니다.
  
| 대시보드 |
| :---: |
| <img width="483" height="417" alt="마이페이지 대시보드" src="https://github.com/user-attachments/assets/fcf73e9e-34f0-4741-8bce-5b999ea6b704" />|
 
### 🦟 모기지수 지도
- Leaflet 지도 위에 지역별 모기지수를 시각화하여 위험 지역을 직관적으로 보여줍니다.
  
| 모기지수 지도 |
| :---: |
|<img width="1135" height="714" alt="image" src="https://github.com/user-attachments/assets/c354e4cb-c307-4881-b7d5-ca790a5cfd2c" />|
 
### 🧑‍💼 관리자
- 헌터 신청을 검토·승인하고, 사용자 계정을 관리합니다.
  
| 헌터 신청 관리 | 사용자 관리 |
| :---: | :---: |
|<img width="812" height="243" alt="image (4)" src="https://github.com/user-attachments/assets/ed981fb6-c251-4f9f-8859-56d1c42c24ef" />|<img width="997" height="781" alt="image (1)" src="https://github.com/user-attachments/assets/380009dc-821d-4a61-85ba-46b3355b04d1" /> |
 
<br/>

## 9. 권한(역할) 구조
 
```
ROLE_USER    →  의뢰 등록, 헌터 검색, 채팅, 리뷰 작성, 북마크
ROLE_HUNTER  →  USER 권한 + 의뢰 지원·수락·완료 처리
ROLE_ADMIN   →  전체 관리 (헌터 승인, 계정 관리 등)
```
 
- 헌터 자격은 **관리자 승인 후** `ROLE_USER` → `ROLE_HUNTER`로 전환됩니다.
- 라우트는 `RequireAuth`(로그인 필수)와 `RequireRole`(권한별 접근) 가드로 보호하며,
  백엔드 `@PreAuthorize`와 권한 매트릭스를 일치시켜 운영합니다.

| 경로 | 접근 권한 |
| --- | --- |
| `/mypage/dashboard` · `/mypage/reviews` | USER + HUNTER |
| `/mypage/requests` · `/mypage/bookmarks/hunters` | USER only |
| `/mypage/hunter/tasks` · `/mypage/hunter/bookmarks/requests` | HUNTER only |
| `/requestView/new` · `/requestView/edit/:id` | USER only |
 

<div align="center">
**🐛 Bugbug** · 해충은 우리가 잡을게요
 
</div>
