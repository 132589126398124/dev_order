# 프로젝트 방향성 가이드

> **모든 에이전트 필독.** 코드 작성 전 이 문서를 숙지하세요.  
> 이해되지 않거나 모호한 부분은 작업 시작 전 반드시 질문하세요.  
> 방향성이 변경되면 이 문서를 함께 수정합니다.

---

## 1. 프로젝트 개요

**film-lab** — 소규모 필름 현상소를 위한 온라인 접수·관리 시스템.

- **고객**: 온라인으로 현상 접수 → 택배 발송 → 현상·스캔 결과 수령
- **운영자(관리자)**: 접수 현황 관리, 상태 업데이트, 고객 알림
- 비회원 접수 지원 (회원가입 없이도 접수 가능)
- 단일 샵(점포) 운영 기준으로 설계됨

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js (주의: 훈련 데이터와 다른 버전일 수 있음 → `node_modules/next/dist/docs/` 확인) |
| 스타일링 | Tailwind CSS만 사용. CSS Modules / 인라인 style 지양 |
| DB | PostgreSQL + Prisma ORM |
| 인증 | JWT (httpOnly 쿠키 `film_session`, `jose` 라이브러리, 7일 만료) |
| 이메일 | Resend API (`src/lib/email.ts`) |
| 스프레드시트 | Google Sheets API (`src/lib/sheets.ts`) |
| Rate Limiting | Upstash Redis + 인메모리 폴백 (`src/lib/rate-limit.ts`) |
| 배포 | Vercel (master 브랜치 push → 자동 배포) |

---

## 3. 디자인 철학

### 3-1. 레퍼런스 스타일

**Toss 앱** + **Apple (iOS/visionOS) Liquid Glass** 감성의 혼합:
- Toss: 굵은 타이포그래피, 넉넉한 여백, 카드 기반 레이아웃, 단일 목적 화면
- Apple: 깊이감, 반투명/frosted 효과, 유려한 전환, 맥락적 인라인 액션

### 3-2. 컬러·타이포·형태 원칙

```
Primary CTA:    bg-slate-900 text-white  (hover: bg-slate-800)
Secondary CTA:  bg-white border-slate-200 text-slate-700  (hover: border-slate-300)
카드:           bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
위험 액션:      bg-red-500 text-white  (confirm 전 인라인 확인 UI 필수)
성공/완료:      bg-emerald-600 text-white
상태 배지:      rounded-full px-2.5 py-1 text-xs font-medium  (색상은 ORDER_STATUS_COLORS 참조)
```

- 모서리: `rounded-xl` (소), `rounded-2xl` (카드/컨테이너)
- 폰트 크기 계층: `text-2xl font-bold` 제목 → `text-sm` 본문 → `text-xs` 보조 정보
- 한글 본문: `break-keep` 필수 (word-break: keep-all — `·` 중간 개행 방지)
- 흐름형 텍스트(→ 구분자): `whitespace-nowrap`

### 3-3. 절대 금지 패턴

- `window.alert()` / `window.confirm()` — 인라인 확인 UI로 대체
- 무거운 모달/다이얼로그 — 간단한 작업은 인라인 또는 토스트로
- 전체 페이지 리다이렉트로 피드백 — 성공/실패는 같은 화면에서 표시
- 불필요한 "확인" 단계 추가 — 되돌릴 수 없는 작업만 확인 요구

---

## 4. UX 원칙: 클릭·터치 최소화

**모든 기능 설계 시 "이 작업에 필요한 최소 탭 수는?"을 먼저 묻는다.**

### 4-1. 인라인 액션 우선

페이지 이동 없이 현재 화면에서 처리:
- 상태 변경: 테이블 내 인라인 select (✅ 이미 구현)
- 위험 상태 확인: select 바로 아래 인라인 confirm (✅ 이미 구현)
- 관리자 메모: 상세 페이지 내 인라인 저장
- 접수 취소(사용자): 주문 상세 페이지 내 인라인 버튼

### 4-2. 컨텍스트 유지

- 검색·필터 결과에서 상세 보기 후 목록으로 복귀 시 상태(필터, 스크롤 위치) 유지
- 로그인 후 원래 페이지 복귀 (`?next=` 파라미터, ✅ 이미 구현)

### 4-3. 로딩 상태

- 버튼 클릭 → 즉각 disabled + 로딩 표시 (사용자가 다시 클릭하지 않도록)
- 목록 페이지: Skeleton UI 사용 (`loading.tsx` 활용)
- 데이터 변경 후: 페이지 전체 리로드 대신 해당 항목만 갱신 (가능한 경우)

### 4-4. 피드백

- 성공: 인라인 상태 변경 즉시 반영 또는 토스트 (짧게, 자동 소멸)
- 실패: 액션 위치 근처에 에러 메시지 표시 (전용 에러 페이지 X)

### 4-5. 모바일 패턴

모바일 네비게이션은 **햄버거 메뉴 단일 패턴**으로 결정 (`NavbarMobileMenu.tsx`). 별도 바텀 네비게이션은 도입하지 않습니다.

- 주요 액션은 엄지 닿는 영역(하단)에 배치
- 복잡한 옵션은 바텀시트 (전체 페이지 이동 X)
- 상단 Navbar는 PC용, 모바일은 햄버거 드롭다운으로 동일 메뉴 제공

---

## 5. 코드 작성 원칙

### 5-1. 컴포넌트

- 기본: Server Component. 상태/이벤트 필요할 때만 `"use client"` 추가
- 작은 인라인 UI 변화는 컴포넌트 추출 불필요 (과도한 추상화 금지)
- 3개 미만으로 쓰이면 분리하지 않는다

### 5-2. 주석

- 기본 주석 없음
- WHY가 불명확한 경우에만 한 줄 (무엇을 하는지 설명하는 주석 금지)

### 5-3. 타입

- `as any` 금지
- `!` non-null assertion: 실제로 null이 불가능한 경우에만, 가능하면 `??` 대체
- Prisma JSON 필드: `as unknown as Prisma.InputJsonValue` 패턴 허용 (필요악)

### 5-4. 에러 처리

- API 400/401/403: 사용자 친화적 한국어 메시지
- 내부 에러 세부사항(Zod flatten 등) 클라이언트에 노출 금지
- 이메일·Sheets 등 부가 기능 실패는 console.error로만 (주문 실패로 이어지면 안 됨)

### 5-5. 보안 체크리스트

새 API 라우트 작성 시 확인:
- [ ] 관리자 전용: `session?.isAdmin` 확인
- [ ] 사용자 전용: `session?.userId` 확인
- [ ] 입력값 길이 상한 검증
- [ ] HTML에 사용자 값 삽입 시 `escapeHtml()` 적용 (`src/lib/email.ts` 참조)
- [ ] 무제한 쿼리 방지 (limit에 상한 설정)

---

## 6. 라우트 구조 요약

```
(main)/           ← Navbar 포함 레이아웃
  page.tsx        ← 홈
  login/          ← PIN 로그인
  register/       ← 회원가입
  my/orders/      ← 내 접수 내역 (로그인 필요)
  my/profile/     ← 프로필 관리
  order/new/      ← 신규 접수 폼
  order/[id]/     ← 접수 상세
  order/complete/ ← 접수 완료 (고유코드 표시)
  order/edit/     ← 수정 링크 (editToken 기반)
  admin/orders/   ← 관리자 대시보드
  admin/settings/ ← 쇼핑 설정

(print)/          ← Navbar 없는 출력 전용 레이아웃
  order/[id]/print/
```

---

## 7. 마일스톤

### 최근 완료
- **M1 · 운영 안정화** 모두 완료 (2026-05 기준)
  - 모바일 햄버거 메뉴 (`src/components/NavbarMobileMenu.tsx`, 풀스크린 드롭다운 · body scroll lock · pathname 변경 시 자동 닫힘). 바텀 네비게이션은 채택하지 않음.
  - PIN 분실 복구 (`/forgot-pin`, `/reset-pin/[token]`, `pinResetToken`/`pinResetExpires` 필드, 재설정 링크 1시간 유효)
  - 내 접수 내역 "더 보기" (`src/components/my/OrdersLoadMore.tsx`, cursor 기반)
  - 최소형 푸터 (`src/components/Footer.tsx`, shopPhone·shopAddress 표시)
- **M2 일부 완료**
  - Skeleton 로딩 UI (`(main)/loading.tsx`, `admin/orders/loading.tsx`, `login/loading.tsx`, `register/loading.tsx`)
- **M3 일부 완료**
  - 관리자 통계 인라인 카드 (`admin/orders` 상단 4종: 오늘 접수 · 접수대기 · 발송확인 · 작업중)

### M2 · 사용자 경험 완성 (잔여)
- 이메일 인증 (회원가입 — 현재 의도적 미구현, schema에 `emailVerified` 필드 없음. 진행 전 확인 필요)
- 사용자 직접 접수 취소 (PENDING 상태 인라인 버튼 — 별도 페이지 X. 현재 `/api/orders/[id]` PATCH는 admin 전용)
- 어드민 패치노트 토스트 (진입 시 1회, 비침습적. `PATCHNOTE.md`는 존재하나 UI 미연결)

### M3 · 운영 효율화 (잔여)
- 스캔 파일 직접 업로드 (현재 외부 URL 입력만 — `AdminOrderMeta.tsx`)
- 택배사 운송장 자동 추적 (URL 매핑은 있으나 자동 동기화 없음)

### M4 · 스케일 (선택적)
- 결제 연동 (토스페이먼츠)
- 실시간 알림 (SSE / 웹푸시)
- 다점포 확장

---

## 8. 모호한 경우 질문 예시

작업 중 아래에 해당하면 작업 전 확인:
- "이 액션이 별도 페이지로 가야 하나, 인라인이어야 하나?"
- "이 피드백이 토스트여야 하나, 인라인 메시지여야 하나?"
- "M2 이메일 인증 관련 작업인가?" (현재 의도적 미구현 상태)
- "결제가 필요한 기능인가?" (사업 방향 미확정)
