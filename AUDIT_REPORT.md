# film-lab 감사 보고서

감사 일자: 2026-05-18  
범위: 전체 라우트 UX/보안/성능/코드품질 종합 감사

---

## 1. 수정 완료 항목

### 🔴 심각 (Security / Correctness)

#### 1-1. 비회원 주문 상세 페이지 접근 불가 버그
- **파일**: `src/app/(main)/order/[id]/page.tsx`
- **원인**: `order.userId !== session?.userId` — `null !== undefined` 는 `true`이므로 비회원 주문은 무조건 `/login` 리다이렉트
- **수정**: 비회원 주문(`order.userId === null`)이면 UUID 보안으로 접근 허용, 회원 주문만 세션 확인

#### 1-2. 프린트 페이지 인증 누락 — 타인 주문 PII 노출
- **파일**: `src/app/(print)/order/[id]/print/page.tsx`
- **원인**: `if (session && !session.isAdmin && ...)` — 비로그인 상태에서 모든 주문 프린트 가능
- **수정**: 1-1과 동일 패턴 적용. 회원 주문은 본인/관리자만 출력, 비회원 주문은 UUID 보안

#### 1-3. 관리자 주문 필터 `as any` 타입 우회
- **파일**: `src/app/(main)/admin/orders/page.tsx`
- **원인**: `status as any`로 prisma에 넘겨 잘못된 enum 값이 DB 쿼리에 들어갈 수 있음
- **수정**: `Object.values(OrderStatus).includes(status as OrderStatus)` 런타임 검증 추가

#### 1-4. `timingSafeStringEqual` 코드 중복 → 타이밍 공격 위험
- **파일**: `src/app/api/auth/login/route.ts`, `src/app/api/admin/pin/route.ts`
- **원인**: 동일 함수가 두 파일에 각각 구현됨. 한쪽이 수정되면 동기화 누락 위험
- **수정**: `src/lib/auth.ts`로 추출 후 양쪽에서 import

---

### 🟠 중요 (UX / Correctness)

#### 1-5. 배치 상태 변경 시 Google Sheets 미동기
- **파일**: `src/app/api/orders/batch/route.ts`
- **원인**: 개별 PATCH는 Sheets 업데이트하나 배치 엔드포인트는 누락
- **수정**: `updateOrderStatusInSheet` 호출 추가 (`Promise.allSettled`로 실패 격리)

#### 1-6. 주문 수정 완료 후 이동 불편 — 주문 상세 링크 없음
- **파일**: `src/components/order/OrderForm.tsx`
- **원인**: 수정 성공 화면에 "홈으로" 버튼만 있어 수정된 주문을 바로 확인 불가
- **수정**: `orderId` prop 추가 후 "접수 내역 확인" 버튼 (→ `/order/${orderId}`) 추가

#### 1-7. 로그인 후 원래 페이지 복귀 안 됨
- **파일**: `src/app/(main)/my/orders/page.tsx`, `src/app/(main)/my/profile/page.tsx`, `src/app/(main)/login/page.tsx`
- **원인**: redirect가 `/login`으로만 이동, 로그인 후 항상 `/my/orders`로 감
- **수정**: `?next=` 쿼리 파라미터 추가, 로그인 성공 시 `next`로 복귀 (시작이 `/`인 경우만)

#### 1-8. AdminSearch 이중 마진 / 디자인 불일치
- **파일**: `src/components/admin/AdminSearch.tsx`
- **원인**: 컴포넌트 내 `mb-4` + 부모 div `mb-4` 이중 적용. `bg-black` 사용 (앱 전체는 `bg-slate-900`)
- **수정**: 내부 `mb-4` 제거, `bg-black` → `bg-slate-900`, rounded/transition 스타일 통일

#### 1-9. reCAPTCHA 스크립트 `beforeInteractive` 성능 저하
- **파일**: `src/app/(main)/order/new/page.tsx`
- **원인**: `strategy="beforeInteractive"`는 페이지 렌더 블로킹
- **수정**: `strategy="afterInteractive"`로 변경

---

### 🟡 개선 (Code Quality / DX)

#### 1-10. `parseShopSettings` 로직 4곳에 중복
- **파일**: `src/types/settings.ts` (신규 export), 총 4개 파일에서 사용
- **수정**: `parseShopSettings()` 유틸 함수 추출. 적용 파일:
  - `src/app/(main)/order/new/page.tsx`
  - `src/app/(main)/order/edit/[token]/page.tsx`
  - `src/app/(main)/admin/settings/page.tsx`
  - `src/app/api/admin/settings/route.ts`

#### 1-11. 불필요한 의존성 제거
- **파일**: `package.json`
- **제거**: `@supabase/supabase-js`, `@hookform/resolvers`, `react-hook-form`, `nodemailer`, `react-to-print`, `@types/nodemailer`
- **devDependencies로 이동**: `@types/bcryptjs`

#### 1-12. 폼 label-input 연결 누락 (접근성)
- **파일**: `src/components/order/OrderForm.tsx`, `src/components/my/ProfileForm.tsx`, `src/components/order/FilmSearch.tsx`
- **원인**: `<label>`에 `htmlFor` 없음, `<input>`에 `id` 없음
- **수정**: 모든 폼 필드에 `htmlFor`/`id` 연결. FilmSearch에 `id` prop 추가

#### 1-13. 이메일 템플릿 — 미설정 env 노출
- **파일**: `src/lib/email.ts`
- **원인**: `EMAIL_FROM`이 미설정이면 `undefined` 문자열이 이메일에 표시
- **수정**: 조건부 렌더링으로 미설정 시 해당 줄 미출력

#### 1-14. AdminDateRangePicker aria-label 누락
- **파일**: `src/components/admin/AdminDateRangePicker.tsx`
- **수정**: 시작/종료 날짜 input에 `aria-label` 추가

#### 1-15. OrderFormDraft 타입 중복 캐스팅
- **파일**: `src/types/order.ts`, `src/components/order/OrderForm.tsx`
- **원인**: `deliveryAddressDetail`를 쓰기 위해 `as Partial<OrderFormData> & { deliveryAddressDetail?: string }` 캐스팅 필요
- **수정**: `OrderFormDraft` 타입 정의 후 직접 사용

---

## 2. 보류 항목 (사용자 결정 필요)

### PIN 복구 방법 미존재
관리자가 PIN을 잊으면 복구 수단이 없음. 옵션:
- (A) `ADMIN_PIN_FALLBACK` 환경변수로 비상 접근
- (B) 이메일 리셋 플로우 (adminEmail 필요)
- (C) 문서화된 DB 직접 수정 절차

### 모바일 네비게이션 없음
소형 화면에서 어드민 링크 등 접근 불가. 햄버거 메뉴 또는 바텀 네비게이션 패턴 필요.

### My/orders 페이지네이션
주문 내역 전체 로드. 주문이 많아지면 성능 저하. 페이지네이션 또는 무한 스크롤 여부 결정 필요.

### 푸터 콘텐츠
현재 푸터 없음. 연락처, 영업시간, 외부 링크 등 넣을 내용 확인 필요.

---

## 3. 라우트별 감사 결과 요약

| 라우트 | 감사 결과 |
|--------|----------|
| `/` (홈) | 이상 없음 |
| `/order/new` | reCAPTCHA 성능 수정, 설정 파싱 dedup |
| `/order/[id]` | 비회원 접근 버그 수정 |
| `/order/[id]/print` | 인증 누락 보안 수정 |
| `/order/edit/[token]` | orderId 누락, 설정 파싱 dedup |
| `/order/complete/[id]` | 이상 없음 (UUID 보안, 상태 표시) |
| `/login` | next 파라미터 복귀 추가 |
| `/register` | 이상 없음 |
| `/my/orders` | next 파라미터 추가 |
| `/my/profile` | next 파라미터 추가, 폼 접근성 수정 |
| `/admin/orders` | as any 제거, 배치 Sheets 동기 추가 |
| `/admin/settings` | 설정 파싱 dedup |

---

## 4. 타입 검사 결과

감사 완료 후 `npx tsc --noEmit` — **오류 없음**
