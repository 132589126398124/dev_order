# 버그 리포트 (film-lab QA)

> 작성일: 2026-05-17  
> 범위: 전체 라우트 및 백엔드 코드 정적 분석

---

## 🔴 Critical — 보안 / 데이터 누출

### BUG-001: 인쇄 페이지 인증 없음 (개인정보 노출)
- **파일**: `src/app/(print)/order/[id]/print/page.tsx`
- **내용**: 주문 ID를 아는 누구든 `/order/[id]/print`에 접근 가능. 세션 검사 없음. 고객 성명·연락처·이메일·주소가 노출됨.
- **재현**: 로그아웃 상태에서 `/order/[임의ID]/print` 접근 → 주문 데이터 그대로 출력
- **수정 방향**: 페이지 상단에 `getSession()` 추가, 비관리자이면서 `order.userId !== session.userId`인 경우 `notFound()` 또는 `redirect()`

---

### BUG-002: 관리자 PIN 환경변수 폴백 — 타이밍 공격 가능
- **파일**: `src/app/api/auth/login/route.ts:35`, `src/app/api/admin/pin/route.ts:28`
- **내용**: `pin === process.env.ADMIN_PIN` 문자열 비교는 상수 시간 비교가 아님. 타이밍 공격으로 PIN 추측 가능.
- **수정 방향**: `crypto.timingSafeEqual()` 사용, 또는 환경변수 폴백 자체를 제거하고 DB 해시만 사용

---

### BUG-003: JWT_SECRET 미설정 시 조용히 실패
- **파일**: `src/lib/auth.ts:5`
- **내용**: `process.env.JWT_SECRET!` — TypeScript의 `!`는 런타임 체크가 아님. `JWT_SECRET`가 미설정이면 `undefined`로 인코딩되어 모든 세션이 같은 취약한 키로 서명됨.
- **수정 방향**: 앱 시작 시 `if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set")` 추가

---

## 🟠 High — 기능 오작동

### BUG-004: 주문 상세 페이지 — "ultra" 해상도 표시 안 됨
- **파일**: `src/app/(main)/order/[id]/page.tsx:142`
- **코드**: `{item.scanType}{item.scanResolution === "high" ? " (고해상도)" : ""}`
- **내용**: `ultra`(초고해상도) 선택 시 아무것도 표시되지 않음. "high" 케이스만 처리.
- **수정**: `item.scanResolution === "high" ? " (고해상도)" : item.scanResolution === "ultra" ? " (초고해상도)" : ""`

---

### BUG-005: 주문 상세 페이지 — 빈 onClick 버튼
- **파일**: `src/app/(main)/order/[id]/page.tsx:87-92`
- **코드**: `<button onClick={undefined} className="...">` — `trackingUrl`이 없지만 `courierName`이 있을 때 렌더링되는 버튼. 클릭해도 아무 반응 없음.
- **수정**: 해당 버튼 제거하거나 클립보드 복사 등 의미 있는 액션 추가

---

### BUG-006: OrderForm useEffect 의존성 누락 — resolutionConfig
- **파일**: `src/components/order/OrderForm.tsx:91-102`
- **코드**: deps: `[settings.disabledProcesses, settings.disabledScanTypes, settings.disabledResolutions]`
- **내용**: `resolutionConfig` 기반 `availableResolutions` 계산에 사용되지만 deps에 없음. `resolutionConfig`만 변경되면 선택값 자동 보정이 실행되지 않아 비활성화된 해상도가 선택된 채로 남을 수 있음.
- **수정**: deps에 `settings.resolutionConfig` 추가 또는 eslint-disable 제거 후 의존성 재정비

---

### BUG-007: 만료된 주문 — 고객 알림 없음
- **파일**: `src/app/api/cron/expire-orders/route.ts`
- **내용**: 접수 후 7일이 지나 PENDING 상태인 주문을 EXPIRED로 일괄 변경하지만, 고객에게 이메일 알림을 보내지 않음. 고객은 자신의 접수가 만료됐는지 알 수 없음.
- **수정**: updateMany 후 해당 주문 이메일 조회 → `sendStatusNotification()` 호출 (EXPIRED 케이스 추가 필요)

---

### BUG-008: `/api/orders/[id]` GET — try/catch 없음
- **파일**: `src/app/api/orders/[id]/route.ts:53-65`
- **내용**: Prisma 쿼리에 try/catch가 없음. DB 장애 시 처리되지 않은 예외가 500으로 그대로 노출됨.
- **수정**: try/catch 추가 후 `{ error: "서버 오류" }` 반환

---

### BUG-009: `/api/orders` GET — status 파라미터 미검증
- **파일**: `src/app/api/orders/route.ts:102`
- **코드**: `status: status as any`
- **내용**: 유효하지 않은 status 값(`?status=HACK`)을 넘겨도 400이 아닌 빈 결과 반환. 관리자 API지만 방어 코드가 없음.
- **수정**: `Object.values(OrderStatus).includes(status)` 검증 추가

---

### BUG-010: 임시저장에 상세 주소(`deliveryAddressDetail`) 미포함
- **파일**: `src/components/order/OrderForm.tsx:396`
- **내용**: draft 저장 시 `deliveryAddress`만 저장, `deliveryAddressDetail`은 제외. 복원 시 상세 주소(동/호수)가 사라짐.
- **수정**: `deliveryAddressDetail` 상태도 draft에 포함

---

### BUG-011: `/my/orders` — 전체 주문 조회 (limit 없음)
- **파일**: `src/app/(main)/my/orders/page.tsx:16-19`
- **코드**: `prisma.order.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } })`
- **내용**: `take` 없음. 수백 건 이상 주문한 사용자나 DB 부하 시 메모리/응답 문제 발생 가능.
- **수정**: `take: 100` 및 페이지네이션 추가

---

### BUG-012: 관리자 페이지 — 페이지네이션이 전체 페이지 버튼 렌더링
- **파일**: `src/app/(main)/admin/orders/page.tsx:241-253`
- **코드**: `Array.from({ length: totalPages }, (_, i) => i + 1).map(...)`
- **내용**: 주문이 5,000건이면 `totalPages = 100`개 버튼이 모두 렌더링됨. UI 깨짐 및 성능 저하.
- **수정**: 현재 페이지 ±2 + 처음/끝 윈도우 방식 페이지네이션으로 교체

---

## 🟡 Medium — UX/기능 이슈

### BUG-013: 인쇄 페이지 — 스캔 해상도 미표기
- **파일**: `src/app/(print)/order/[id]/print/page.tsx:72`
- **내용**: 스캔 컬럼에 `{item.scanType}`만 출력. 고해상도/초고해상도 정보가 의뢰서에 없어 현상소가 확인 불가.
- **수정**: `{item.scanType}{item.scanResolution !== "standard" ? ` (${item.scanResolution === "high" ? "고해상도" : "초고해상도"})` : ""}` 추가

---

### BUG-014: 일괄 변경 — 같은 스캔 URL이 선택된 모든 주문에 적용
- **파일**: `src/components/admin/AdminOrdersTable.tsx:55-65`
- **내용**: 완료 처리 시 입력한 스캔 URL이 선택한 모든 주문에 동일하게 저장됨. 주문별 개별 파일 링크가 필요한 경우 사용 불가.
- **수정**: 배치 완료 시 "각 주문별 링크는 개별 처리 필요" 안내 추가 또는 개별 입력 지원

---

### BUG-015: AdminStatusSelect — PATCH 실패 시 사용자에게 에러 미표시
- **파일**: `src/components/admin/AdminStatusSelect.tsx:17-28`
- **내용**: fetch 실패 또는 `!res.ok` 시 상태가 되돌아가지도, 에러 메시지가 표시되지도 않음. 관리자가 변경 실패를 인지 불가.
- **수정**: 실패 시 상태 롤백 + 에러 메시지 표시

---

### BUG-016: 설정 페이지 — 변경 사항 저장 없이 이탈 시 경고 없음
- **파일**: `src/components/admin/ShopSettingsForm.tsx`
- **내용**: 요금/설정 변경 후 실수로 다른 페이지로 이동 시 변경사항이 사라짐. `beforeunload` 이벤트나 dirty state 감지 없음.

---

### BUG-017: 고유 코드 prefix "KDL-" 하드코딩
- **파일**: `src/lib/unique-code.ts:6`
- **코드**: `` `KDL-${date}-${nanoid()}` ``
- **내용**: 복수 현상소 배포 시 모든 업체의 코드가 "KDL-"로 시작. 업체별 구분 불가.
- **수정**: `NEXT_PUBLIC_ORDER_CODE_PREFIX` 환경변수로 분리

---

## 🔵 Low — 코드 품질

### BUG-018: ShopSettingsForm — `ALL_RESOLUTIONS` 상수 미사용 + "ultra" 누락
- **파일**: `src/components/admin/ShopSettingsForm.tsx:11-14`
- **내용**: `ALL_RESOLUTIONS` 상수가 `standard`/`high` 2개만 있고 "ultra" 미포함. 이 상수는 실제로 렌더에서 사용되지 않음 — 데드 코드.
- **수정**: 상수 제거 또는 3개로 업데이트

---

### BUG-019: `/api/orders/edit/[token]` — rate limit 없음
- **파일**: `src/app/api/orders/edit/[token]/route.ts`
- **내용**: PUT 요청에 rate limiting 없음. 토큰이 노출됐을 때 반복 수정 요청 가능.
- **수정**: `checkOrderRateLimit()` 추가

---

### BUG-020: `/api/profile` PATCH — 입력값 길이 검증 없음
- **파일**: `src/app/api/profile/route.ts:17-34`
- **내용**: `profileName`, `profilePhone`, `profileEmail`, `profileAddress` 모두 길이/형식 검증 없음. 매우 긴 문자열을 DB에 저장 가능.
- **수정**: 각 필드 maxLength 검증 추가

---

*총 버그: 20건 (Critical 3, High 6, Medium 5, Low 6)*
