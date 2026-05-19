@AGENTS.md
@DIRECTION.md

---

# Harness Workflow Rules

> 이 섹션은 Claude Code 하네스 아키텍처의 필수 워크플로우 규칙을 정의합니다.
> **모든 에이전트는 아래 규칙을 DIRECTION.md보다 우선하여 적용합니다.**

## Plan → Work → Review 사이클

```
1. PLAN   → Plans.md 에 구현 계획 문서화 (planner 에이전트)
2. WORK   → Plans.md 의 계획만을 근거로 코드 작성 (worker 에이전트)
3. REVIEW → CLAUDE.md + DIRECTION.md 기준으로 코드 검토 (reviewer 에이전트)
```

### 규칙 1 — 계획 우선 (Plan-First)
- **Plans.md 없이 코드를 작성하는 것을 엄격히 금지한다.**
- 새로운 기능·버그 수정·리팩토링 모두 planner가 먼저 Plans.md에 다음을 기록해야 한다:
  - 목표 (Goal)
  - 변경 대상 파일 목록
  - 구현 단계 (numbered steps)
  - 완료 기준 (Acceptance Criteria)

### 규칙 2 — 역할 분리 (Role Separation)
- **planner**: 요구사항 분석, 설계, Plans.md 작성 전담. 코드 수정 금지.
- **worker**: Plans.md의 단계를 순서대로 실행. 계획에 없는 코드 추가 금지.
- **reviewer**: 완성된 코드를 CLAUDE.md·DIRECTION.md 기준으로 검토. 코드 재작성 금지 — 발견 사항만 보고.

### 규칙 3 — 검토 통과 기준 (Review Gate)
reviewer가 다음 항목을 모두 통과로 판정해야 머지 가능:
- [ ] DIRECTION.md 3-3 절대 금지 패턴 위반 없음
- [ ] 신규 API 라우트 보안 체크리스트 통과 (DIRECTION.md 5-5)
- [ ] `as any` 없음, `!` non-null assertion 남용 없음
- [ ] 에러 처리: 내부 세부사항 클라이언트 미노출
- [ ] 타입 검사: `npx tsc --noEmit` 오류 없음

### 규칙 4 — 범위 제한 (Scope Lock)
- worker는 Plans.md에 명시된 파일만 수정한다.
- 계획에 없는 파일 변경이 필요하면 작업을 중단하고 planner에게 계획 업데이트를 요청한다.

---

## 프로젝트 개요 (Harness 참조용)

**film-lab** — 소규모 필름 현상소 온라인 접수·관리 시스템

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 16 (App Router, Server/Client Components) |
| 언어 | TypeScript 5 |
| 스타일링 | Tailwind CSS v4 |
| DB | PostgreSQL + Prisma ORM v6 |
| 인증 | JWT (httpOnly 쿠키 `film_session`, `jose`, 7일 만료) |
| 이메일 | Resend API (`src/lib/email.ts`) |
| 스프레드시트 | Google Sheets API (`src/lib/sheets.ts`) |
| Rate Limiting | Upstash Redis + 인메모리 폴백 (`src/lib/rate-limit.ts`) |
| 배포 | Vercel (master 브랜치 → 자동 배포) |
| PWA | `@ducanh2912/next-pwa` |

## 핵심 디렉토리

```
src/
  app/
    (main)/          ← Navbar 포함 레이아웃 (사용자·관리자 라우트)
    (print)/         ← 출력 전용 레이아웃 (Navbar 없음)
    api/             ← API 라우트 핸들러
  components/
    admin/           ← 관리자 전용 컴포넌트
    my/              ← 내 접수 관련 컴포넌트
    order/           ← 주문 폼·출력 컴포넌트
  lib/               ← 서버 유틸리티 (auth, email, prisma 등)
  types/             ← 공유 타입 정의
  data/              ← 정적 데이터 (films.ts)
prisma/
  schema.prisma      ← DB 스키마 (User, Order, ShopSettings, OrderStatus)
  migrations/        ← 마이그레이션 파일
```

## Prisma 모델 요약

- **User**: id, username, pinHash, email, profile* 필드, pinReset*
- **Order**: id, uniqueCode, userId(nullable), customerName, phone, email, filmItems(Json), pickupMethod, status(OrderStatus), editToken, scanFileUrl, adminNotes 등
- **ShopSettings**: singleton 레코드, 현상 옵션·가격·공지 설정
- **OrderStatus**: `PENDING | SHIPPED | PROCESSING | DONE | EXPIRED | CANCELLED`
