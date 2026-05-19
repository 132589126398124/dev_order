# Plan: BUG-02 — 회원가입 API 이메일 선택 입력 허용

**날짜**: 2026-05-19
**상태**: DONE

## 목표 (Goal)
회원가입 API에서 이메일을 진짜 선택 항목으로 처리한다. UI는 이미 "(선택사항 · PIN 찾기용)"으로 안내하고 있으나 API가 빈 이메일을 거부했다.

## 배경 (Context)
`if (!email || ...)` 조건에서 `!""` = `true`이므로 빈 문자열이 전달되면 유효성 검사 실패 → 400 반환. 사용자는 UI 안내와 다른 동작으로 혼란을 겪는다.

## 변경 대상 파일
- `src/app/api/auth/register/route.ts` — 이메일 유효성 검사 로직 및 DB 저장 방식 수정

## 구현 단계
- [x] 1. 이메일 검증: `!email` → `email && (...)` 로 변경해 값이 있을 때만 형식 검증
- [x] 2. `normalizedEmail` 도입: 빈 문자열 / undefined → `null` 정규화
- [x] 3. 중복 검사 쿼리: `normalizedEmail` 있을 때만 `{ email: normalizedEmail }` OR 조건 포함
- [x] 4. 중복 이메일 충돌 검사: `normalizedEmail &&` 조건 추가
- [x] 5. `prisma.user.create`: `email: normalizedEmail` 로 null 저장 허용
- [x] 6. `prisma/schema.prisma`: `email String @unique` → `email String? @unique` (Prisma 타입이 null 허용하도록)

## 완료 기준 (Acceptance Criteria)
- [x] 이메일 없이 회원가입 → 200 성공
- [x] 잘못된 형식 이메일(예: "notanemail") → 400 오류
- [x] 유효한 이메일 → 정상 저장
- [x] 중복 이메일 → 409 오류
- [x] 타입 검사: `npx tsc --noEmit` 오류 없음
- [x] 린트: 변경 파일(`register/route.ts`, `forgot-pin/route.ts`) 경고 없음

## 제외 범위 (Out of Scope)
- 프론트엔드 폼 변경
- PIN 찾기 로직 (이미 이메일 없는 경우 처리됨)

## 위험 요소 (Risks)
- `User.email @unique` 제약: PostgreSQL에서 `null` 값은 unique 제약 대상에서 제외되므로 여러 사용자가 null 이메일을 가질 수 있음. 의도된 동작.
- `prisma.user.findFirst` OR 쿼리에서 `email: null`을 포함하면 이메일 없는 기존 사용자와 충돌할 수 있어 `normalizedEmail` 있을 때만 포함하도록 처리함.
