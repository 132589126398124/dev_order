# Skill: 프로덕션 빌드

## 커맨드

```bash
npm run build
```

실제 실행 내용:
```bash
prisma generate && next build --webpack
```

## 설명
1. `prisma generate` — Prisma Client를 DB 스키마(`prisma/schema.prisma`) 기준으로 재생성.
2. `next build --webpack` — Next.js 프로덕션 빌드. **Turbopack 대신 Webpack을 사용** (프로덕션 빌드 안정성).

## 빌드 전 체크리스트

```bash
# 1. 타입 오류 확인
npx tsc --noEmit

# 2. 린트 확인
npm run lint

# 3. DB 스키마 최신화 확인
npx prisma migrate status
```

## 빌드 결과 확인

```bash
# 프로덕션 서버 로컬 실행 (빌드 결과 검증)
npm run start
```

## Vercel 자동 배포

`master` 브랜치에 push하면 Vercel이 자동으로 이 빌드 커맨드를 실행합니다.
빌드 실패 시 이전 배포가 유지됩니다.

## 빌드 실패 시 주요 원인

| 원인 | 해결 |
|------|------|
| TypeScript 오류 | `npx tsc --noEmit` 실행 후 수정 |
| Prisma Client 미생성 | `npx prisma generate` 실행 |
| 환경 변수 누락 | `NEXT_PUBLIC_APP_URL`, `DATABASE_URL` 확인 |
| Dynamic import 오류 | App Router에서 `export const dynamic` 설정 확인 |
