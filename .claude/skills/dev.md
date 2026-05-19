# Skill: 개발 서버 실행

## 커맨드

```bash
npm run dev
```

## 설명
Turbopack이 활성화된 Next.js 16 개발 서버를 시작합니다 (`next.config.ts`의 `turbopack: {}`).
기본 포트: **http://localhost:3000**

## 전제 조건

`.env.local` 파일에 다음 환경 변수가 설정되어 있어야 합니다:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 선택 (미설정 시 콘솔 로그로 대체)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 주의사항

- `NODE_ENV=development`에서는 PWA 서비스 워커가 비활성화됩니다 (`next-pwa` 설정).
- DB 스키마 변경 후에는 반드시 `npx prisma migrate dev` 후 서버를 재시작합니다.
- `src/app/api/` 라우트 변경은 핫 리로드가 적용됩니다.
