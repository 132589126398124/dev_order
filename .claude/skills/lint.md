# Skill: 린트 & 타입 검사

## 커맨드

### ESLint
```bash
npm run lint
# 또는 직접 실행
npx eslint src/
```

### TypeScript 타입 검사
```bash
npx tsc --noEmit
```

### 둘 다 실행 (권장 — 코드 제출 전 필수)
```bash
npx tsc --noEmit && npm run lint
```

## 설명

- **ESLint**: `eslint.config.mjs` 기준, `eslint-config-next` 규칙 적용.
  - React hooks 규칙 (`react-hooks/exhaustive-deps`) 포함.
  - `as any` 사용 시 `@typescript-eslint/no-explicit-any` 경고.
- **tsc**: `tsconfig.json` 기준 엄격 모드 타입 검사.

## 코드 컨벤션 주요 규칙

| 규칙 | 내용 |
|------|------|
| `as any` 금지 | 타입 캐스팅 필요 시 구체적 타입 사용 |
| 불필요한 `!` 금지 | null 불가능 보장이 없으면 `??` 또는 옵셔널 체이닝 사용 |
| 주석 최소화 | WHY가 불명확한 경우에만 한 줄 |
| Server Component 기본 | 상태/이벤트 없으면 `"use client"` 제거 |

## 자동 수정 (일부 규칙)

```bash
npx eslint src/ --fix
```

> **주의**: 자동 수정은 ESLint 규칙 위반만 처리합니다. TypeScript 오류는 수동 수정이 필요합니다.
