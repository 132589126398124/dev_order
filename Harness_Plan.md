# Harness 초기화 계획

**날짜**: 2026-05-19  
**상태**: DONE

---

## 1. 생성된 .claude/ 구조

```
film-lab/
├── CLAUDE.md                    ← 업데이트됨 — 하네스 워크플로우 규칙 추가
├── Harness_Plan.md              ← 이 파일
│
└── .claude/
    ├── agents/
    │   ├── planner.md           ← 요구사항 분석 · Plans.md 작성 전담
    │   ├── worker.md            ← Plans.md 기반 코드 구현 전담
    │   └── reviewer.md         ← CLAUDE.md 기준 코드 검토 전담
    │
    └── skills/
        ├── dev.md              ← 개발 서버 실행 (npm run dev)
        ├── build.md            ← 프로덕션 빌드 (npm run build)
        ├── lint.md             ← 린트 · 타입 검사 (tsc + eslint)
        └── db.md               ← Prisma DB 작업 커맨드 모음
```

---

## 2. 각 파일 역할 요약

### CLAUDE.md
기존 `@AGENTS.md` · `@DIRECTION.md` 참조를 유지하면서 **Plan → Work → Review** 사이클 규칙을 추가했습니다:
- 규칙 1: Plans.md 없이 코드 작성 금지
- 규칙 2: planner / worker / reviewer 역할 분리
- 규칙 3: reviewer 통과 기준 (보안 체크리스트, tsc, lint)
- 규칙 4: 계획에 명시된 파일만 수정

### .claude/agents/

| 에이전트 | 호출 시점 | 주요 제약 |
|----------|-----------|-----------|
| `planner` | 새 기능·버그 수정 시작 시 | 코드 수정 금지 |
| `worker` | Plans.md 작성 완료 후 | 계획 외 파일 수정 금지 |
| `reviewer` | worker 구현 완료 후 | 코드 재작성 금지, 보고만 |

### .claude/skills/

| 스킬 | 핵심 커맨드 |
|------|------------|
| `dev` | `npm run dev` (Turbopack) |
| `build` | `prisma generate && next build --webpack` |
| `lint` | `npx tsc --noEmit && npm run lint` |
| `db` | `npx prisma migrate dev`, `prisma studio` 등 |

---

## 3. 첫 번째 테스트 태스크 제안

### 태스크: 이메일 없이 회원가입 허용 (BUG-02 배포 검증)

**배경**: 이번 QA 세션에서 `src/app/api/auth/register/route.ts`의 이메일 검증 버그를 로컬에서 수정했습니다. 이 수정이 하네스 워크플로우로 올바르게 검증·배포되는지 테스트하기에 이상적인 소규모 태스크입니다.

**왜 첫 태스크로 적합한가?**
- 변경 파일 1개 (`src/app/api/auth/register/route.ts`) — 범위 최소
- 이미 로컬 수정 완료 → reviewer만 실행하면 됨
- 보안·타입 관련 검토 포인트 포함 (인증 없는 public endpoint)

### 실행 방법

```
1. planner 에이전트 호출:
   "BUG-02 수정 (이메일 선택 입력 허용)에 대한 Plans.md를 작성해줘"

2. reviewer 에이전트 호출:
   "src/app/api/auth/register/route.ts 변경사항을 Plans.md 기준으로 검토해줘"

3. 검토 통과 후 배포:
   git add src/app/api/auth/register/route.ts
   git commit -m "fix: make email optional in register API"
   git push origin master
```

---

## 4. 하네스 워크플로우 다이어그램

```
사용자 요청
    │
    ▼
[planner 에이전트]
    │  Plans.md 작성
    ▼
Plans.md 검토 (사용자 승인)
    │
    ▼
[worker 에이전트]
    │  계획대로 코드 구현
    │  npx tsc --noEmit ✓
    │  npm run lint ✓
    ▼
[reviewer 에이전트]
    │  CLAUDE.md 기준 검토
    ▼
┌─────────────────┐
│ CRITICAL/HIGH?  │──YES──► worker에게 수정 요청
└─────────────────┘
    │ NO
    ▼
✅ 머지 · 배포
```

---

## 5. 주의사항

- `Plans.md`는 단일 파일로 관리합니다. 새 태스크 시작 시 이전 계획 위에 새 섹션을 추가하거나 완료된 계획을 `Plans_archive.md`로 이동합니다.
- `.claude/agents/` 파일은 Claude Code의 서브에이전트 정의로 사용됩니다. `Agent` 도구 호출 시 `subagent_type`이 아닌 에이전트 이름으로 참조합니다.
- 하네스 규칙 자체를 변경해야 할 경우, `CLAUDE.md`를 수정하고 모든 팀원에게 공유합니다.
