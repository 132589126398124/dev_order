# 개선 사항 (film-lab QA)

> 작성일: 2026-05-17  
> 범위: UX/UI · 접근성 · 엔지니어링 · 웹 표준

---

## ♿ 접근성 (Accessibility)

### ACC-001: 관리자 테이블 체크박스 — aria-label 없음
- **파일**: `src/components/admin/AdminOrdersTable.tsx:88-95, 119-124`
- **내용**: 전체 선택 체크박스, 행별 체크박스 모두 `aria-label` 없음. 스크린 리더에서 "체크박스"로만 읽힘.
- **개선**: `aria-label="전체 선택"`, `aria-label={`${order.uniqueCode} 선택`}` 추가

---

### ACC-002: 에러 메시지 — aria-live 없음
- **파일**: `src/components/order/OrderForm.tsx:651-655`
- **내용**: 폼 제출 실패 에러가 `aria-live="polite"` 없이 렌더링됨. 스크린 리더 사용자에게 에러 발생을 알리지 못함.
- **개선**: 에러 컨테이너에 `role="alert"` 또는 `aria-live="assertive"` 추가

---

### ACC-003: 설정 페이지 필름 검색 드롭다운 — 키보드 내비게이션 불가
- **파일**: `src/components/admin/ShopSettingsForm.tsx:286`
- **코드**: `onMouseDown={() => addBlockedFilm(f)}`
- **내용**: 드롭다운 결과가 마우스(`onMouseDown`)로만 선택 가능. 키보드(↑↓Enter)로 탐색·선택 불가.
- **개선**: `onKeyDown` 핸들러 추가, `role="listbox"` / `role="option"` ARIA 패턴 적용

---

### ACC-004: 폼 제출 후 포커스 이동 없음
- **파일**: `src/components/order/OrderForm.tsx:580-590`
- **내용**: 접수 성공 후 `router.push()`, 실패 후 에러 렌더링 시 포커스가 이동하지 않음. 키보드 사용자가 결과를 인지하지 못함.
- **개선**: 에러 div에 `ref` 연결 후 실패 시 `.focus()` 호출

---

### ACC-005: AdminStatusSelect — 변경 즉시 적용 (예기치 않은 동작)
- **파일**: `src/components/admin/AdminStatusSelect.tsx:30-38`
- **내용**: `<select>` 변경 즉시 API 호출. "완료" 외 상태는 확인 없이 바로 변경됨. 스크린 리더 및 키보드 사용자에게 예기치 않은 부작용 발생 가능.
- **개선**: 상태 변경 전 확인 단계 추가 (특히 CANCELLED, EXPIRED)

---

### ACC-006: 토글 버튼 — label 연결 없음
- **파일**: `src/components/admin/ShopSettingsForm.tsx:122-144`
- **내용**: `role="switch"` 버튼과 텍스트 레이블이 시각적으로 묶여 있지만 `aria-labelledby` 연결 없음. 스크린 리더에서 "버튼"만 읽힘.
- **개선**: 레이블 `<div>`에 `id` 부여 후 버튼에 `aria-labelledby` 연결

---

### ACC-007: 색상 대비 — slate-400 텍스트
- **내용**: `text-slate-400` (hex #94a3b8) on white — 대비율 약 2.9:1. WCAG AA 기준(4.5:1) 미달. 사용 위치: 부가 설명, 날짜, placeholder 안내 등.
- **개선**: 보조 텍스트 최소 `text-slate-500` (#64748b, 대비율 4.6:1) 이상 사용

---

## 🎨 UX/UI

### UX-001: 비회원 주문자 — 주문 상세 직접 접근 불가
- **파일**: `src/app/(main)/order/[id]/page.tsx:29`
- **내용**: `order.userId`가 null(비회원)이고 세션도 없으면 `/login`으로 리다이렉트. 비회원이 완료 페이지 이후에 `/order/[id]`로 직접 접근하면 로그인 요구. 완료 페이지에 링크가 없어서 덜 심각하지만 고유코드로 검색·접근하려는 사용자에게 혼란.
- **개선**: 비회원 주문 접근 시 이메일 인증 또는 고유코드+연락처 조합 인증 옵션 제공 (장기 개선)

---

### UX-002: 일괄 상태 변경 — 파괴적 액션 확인 없음
- **파일**: `src/components/admin/AdminOrdersTable.tsx:51-78`
- **내용**: CANCELLED, EXPIRED 일괄 변경 시 확인 다이얼로그 없음. 실수로 다수 주문 취소 가능.
- **개선**: `CANCELLED`/`EXPIRED` 선택 후 적용 시 "X건을 [상태]로 변경합니다. 계속하시겠습니까?" 확인

---

### UX-003: 관리자 주문 목록 — 컬럼 정렬 없음
- **파일**: `src/app/(main)/admin/orders/page.tsx`
- **내용**: 접수일 내림차순 고정. 고객명·상태·수령방법 기준 정렬 불가.
- **개선**: 최소 접수일 오름차순/내림차순 토글 추가

---

### UX-004: 설정 저장 버튼 위치 — PIN 변경 섹션 아래에 있음
- **파일**: `src/components/admin/ShopSettingsForm.tsx:491-498`
- **내용**: "설정 저장" 버튼이 PIN 변경 섹션 바로 위에 있음. PIN 변경과 설정 저장이 별개 액션인데 시각적으로 모호하게 묶여 보임.
- **개선**: 저장 버튼을 PIN 섹션보다 먼저 배치하거나, 두 섹션 사이에 구분선/간격 추가

---

### UX-005: 이메일 HTML 템플릿 — 기본 구조 없음
- **파일**: `src/lib/email.ts`
- **내용**: 이메일 html이 `<p>` 태그만으로 구성. `<html>`, `<body>`, `<meta charset>`, 기본 폰트 스타일 없음. Outlook 등 일부 이메일 클라이언트에서 깨질 수 있음.
- **개선**: 최소 이메일 보일러플레이트 (`<!DOCTYPE html>...`) 적용

---

### UX-006: 접수 완료 페이지 — 수정 링크 조건부 표시 개선
- **파일**: `src/app/(main)/order/complete/[id]/page.tsx:34-38`
- **내용**: `editLinkValid` 체크 후 수정 링크 표시. 단, 비회원이 로그인 후 같은 완료 페이지를 다시 열면 `isOwner=true`로 마스킹 없이 보이지만, 수정 링크가 없으면 어디서 수정하는지 안내 없음.
- **개선**: 수정 링크가 만료된 경우 "이메일로 발송된 수정 링크를 이용해주세요" 안내 추가

---

### UX-007: 관리자 이메일 알림 — 새 접수 링크가 목록 페이지
- **파일**: `src/lib/email.ts:94`
- **코드**: `const detailUrl = \`${APP_URL}/admin/orders\``
- **내용**: 신규 접수 알림 이메일 링크가 관리자 목록 페이지. 해당 주문 상세 페이지로 바로 이동할 수 없음.
- **개선**: `${APP_URL}/order/${order.id}` 로 변경 (관리자는 `/order/[id]`에서 상세 확인 가능)

---

### UX-008: 접수 폼 — EI 감도 자유 입력 (유효성 없음)
- **파일**: `src/components/order/OrderForm.tsx:278-283`
- **내용**: EI 입력이 자유 텍스트. "800", "1600" 같은 숫자 외에 임의 문자 입력 가능. 현상소 측에서 파싱 어려움.
- **개선**: `inputMode="numeric"` 추가, 선택 드롭다운(100, 200, 400, 800, 1600, 3200, 6400) 또는 숫자 전용 입력 제한

---

### UX-009: 로그아웃 후 리다이렉트 목적지 불명확
- **파일**: `src/components/LogoutButton.tsx` (미열람 — 추측)
- **내용**: 로그아웃 후 어디로 이동하는지 확인 필요. `/`로 이동하면 무난하지만, 관리자가 로그아웃하면 다시 `/login`으로 이동하는 게 더 자연스러울 수 있음.

---

## ⚙️ 엔지니어링

### ENG-001: 공개 설정 엔드포인트 — 캐싱 없음
- **파일**: `src/app/api/settings/route.ts`
- **내용**: 모든 접수 폼 로드마다 DB에서 `shopSettings` 조회. `Cache-Control` 또는 Next.js `revalidate` 없음.
- **개선**: `export const revalidate = 60;` 추가 (또는 ISR 캐싱), 또는 서버 컴포넌트에서 직접 DB 조회 후 props 전달

---

### ENG-002: Google Sheets 연동 — 재시도 없음
- **파일**: `src/lib/sheets.ts:56-66`
- **내용**: `appendOrderToSheet`에 재시도 로직 없음. Google API 일시 장애 시 주문 접수는 되지만 스프레드시트 누락.
- **개선**: 간단한 retry (1회) 또는 큐잉 메커니즘. 최소한 실패 시 alert 발송.

---

### ENG-003: 보안 헤더 없음
- **파일**: `next.config.ts`
- **내용**: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` 미설정.
- **개선**: `next.config.ts`의 `headers()` 함수로 기본 보안 헤더 추가

```ts
// next.config.ts 예시
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  }];
}
```

---

### ENG-004: 환경변수 시작 시 검증 없음
- **내용**: `JWT_SECRET`, `DATABASE_URL` 등 필수 환경변수가 미설정이어도 서버가 시작됨. 런타임에 첫 요청 시 실패.
- **개선**: `src/lib/env.ts` 같은 파일에서 시작 시 필수 env 확인 후 throw

---

### ENG-005: `filmItems as any` 타입 안전하지 않음
- **파일**: `src/app/api/orders/route.ts:52`, `src/app/api/orders/edit/[token]/route.ts:53`
- **코드**: `filmItems: filmItems as any`
- **내용**: Zod로 이미 검증된 `filmItems`를 `any`로 캐스팅. Prisma Json 타입 호환을 위해서지만 가능하면 명시적 타입 사용 권장.
- **개선**: `filmItems: filmItems as Prisma.InputJsonValue` 로 교체

---

### ENG-006: 관리자 주문 GET 엔드포인트와 페이지 쿼리 불일치
- **파일**: `src/app/api/orders/route.ts:116-118` vs `src/app/(main)/admin/orders/page.tsx:87`
- **내용**: API GET은 전체 `Order` 행 반환, 서버 페이지는 별도 Prisma 쿼리로 선택 컬럼만 조회. `AdminOrdersTable`은 클라이언트 API 사용 안 하고 서버 props 받음. API GET 엔드포인트 중복.
- **개선**: `/api/orders` GET이 실제로 어디서 사용되는지 확인 후 미사용이면 제거 또는 정리

---

### ENG-007: 이메일 발송 — Resend 인스턴스 매번 생성
- **파일**: `src/lib/email.ts:16, 68, 92, 120`
- **내용**: 함수 호출마다 `new Resend(process.env.RESEND_API_KEY)` 생성. 모듈 수준에서 단일 인스턴스로 관리하는 것이 표준.
- **개선**: 모듈 최상단에 `const resend = isEmailConfigured() ? new Resend(process.env.RESEND_API_KEY) : null` 선언

---

### ENG-008: 등록 시 이메일 인증 없음
- **파일**: `src/app/api/auth/register/route.ts`
- **내용**: 이메일 형식 검증만 있고 실제 이메일 소유 확인 없음. 타인의 이메일로 가입 후 상태 알림 수신 가능.
- **개선**: 회원가입 시 이메일 인증 링크 발송 (장기 개선 사항)

---

### ENG-009: `search` 파라미터 — 전화번호 검색 대소문자 구분 불필요
- **파일**: `src/app/api/orders/route.ts:107-112`
- **코드**: `{ phone: { contains: search } }` — `mode: "insensitive"` 없음. 전화번호는 숫자라 문제없지만, 대소문자 구분 없는 전화번호 검색은 Prisma `contains` 기본값(CS) 그대로여서 일관성 위해 `mode: "insensitive"` 통일 권장.

---

*총 개선 항목: 9 (접근성) + 9 (UX) + 9 (엔지니어링) = 27건*
