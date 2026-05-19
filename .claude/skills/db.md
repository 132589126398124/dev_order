# Skill: 데이터베이스 작업

## Prisma 주요 커맨드

### 마이그레이션 생성 및 적용 (로컬 개발)
```bash
npx prisma migrate dev --name [설명적인_이름]
# 예: npx prisma migrate dev --name add_order_priority_field
```

### Prisma Client 재생성
```bash
npx prisma generate
```

### 마이그레이션 상태 확인
```bash
npx prisma migrate status
```

### Prisma Studio (DB 데이터 시각적 확인)
```bash
npx prisma studio
# 기본 포트: http://localhost:5555
```

### 프로덕션 마이그레이션 적용 (Vercel 배포 시 자동)
```bash
npx prisma migrate deploy
```

## 스키마 파일 위치

```
prisma/
  schema.prisma        ← 모델 정의 (수정 대상)
  migrations/          ← 자동 생성 — 직접 수정 금지
    YYYYMMDDHHMMSS_name/
      migration.sql
```

## 모델 요약

| 모델 | 주요 필드 | 관계 |
|------|-----------|------|
| `User` | id(cuid), username, pinHash, email, profile* | 1:N Order |
| `Order` | id(cuid), uniqueCode, userId?, filmItems(Json), status(OrderStatus) | N:1 User |
| `ShopSettings` | id="singleton" — 항상 단일 레코드 | — |

## OrderStatus Enum

```
PENDING → SHIPPED → PROCESSING → DONE
                              ↓
                         EXPIRED / CANCELLED
```

## 스키마 변경 시 주의사항

1. **`email` 필드 unique 제약**: `User.email`은 `@unique`. 이메일 없는 사용자(null) 추가 시 `null`로 저장 필요.
2. **`Order.filmItems`는 Json 타입**: Prisma에 저장 시 `as unknown as Prisma.InputJsonValue` 캐스팅 필요.
3. **`ShopSettings` singleton**: `upsert({ where: { id: "singleton" }, ... })`로 접근.
4. **인덱스**: `status`, `createdAt`, `userId`, `customerName`, `phone`에 인덱스 있음. 새 검색 필드 추가 시 `@@index` 고려.

## 로컬 DB 초기화 (개발용)

```bash
# 모든 마이그레이션 재적용 (데이터 초기화)
npx prisma migrate reset

# 시드 데이터 필요 시 (현재 seed 스크립트 없음)
# prisma/seed.ts 작성 후: npx prisma db seed
```

## 환경 변수

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]?sslmode=require
```
Vercel Postgres 사용 시: Vercel 대시보드 → Storage → DB → `.env.local` snippet 복사.
