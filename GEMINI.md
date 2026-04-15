# GEMINI.md

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS

### Backend
- Python (FastAPI)
- yt-dlp 사용

### Deployment
- Frontend: Vercel
---

## Architecture Rules (매우 중요)

- Next.js API Route에서 yt-dlp 실행 금지
- 다운로드 로직은 반드시 Python FastAPI 서버에서 처리
- Frontend는 Backend API를 호출하는 구조로만 구성
- 파일 다운로드는 Backend → URL 반환 방식 사용

---

## Project Structure

- /app → Next.js App Router
- /components → UI 컴포넌트
- /lib → API 호출 및 유틸
- /backend → FastAPI 서버
- /styles → Tailwind

---

## Coding Conventions

- TypeScript 사용
- 모든 API 호출은 /lib/api.ts에 정의
- React 컴포넌트는 functional component만 사용
- Tailwind CSS만 사용 (CSS 파일 최소화)

---

## Backend Rules

- yt-dlp로 영상 다운로드
- 다운로드는 비동기 처리
- 임시 파일 저장 후 URL 반환
- 잘못된 URL 입력 시 에러 반환

---

## UI Requirements

- 입력 폼 (유튜브 URL)
- 영상 미리보기 카드
- 다운로드 버튼
- 반응형 디자인 필수

---

## Constraints (중요)

- 로그인 기능 구현하지 말 것
- 불필요한 상태관리 라이브러리 추가 금지
- 데이터베이스 구축하지 말것
- Redux, Zustand 사용 금지
- 단순한 구조 유지

---

## Error Handling

- 잘못된 URL 입력 시 사용자에게 메시지 표시
- 다운로드 실패 시 fallback 처리
- loading 상태 UI 표시

---

## Common Tasks

### 새로운 다운로드 요청 추가
1. URL 입력
2. /info API 호출
3. 결과 표시
4. /download API 호출

---

## MCP Usage (선택)

- GitHub 레포지토리 생성 및 push 가능

---

## Final Goal

- 실제 배포 가능한 수준의 웹앱 구현
- 코드 실행 가능해야 함
- 모든 주요 기능 동작해야 함
