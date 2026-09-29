# 차록다록 디자인 하네스

차록다록 디자인 작업을 위한 Codex 하네스입니다. 규칙 검사, 역할별 산출물 저장, 게이트, 승인, 재개와 이력 관리를 포함합니다.

| 폴더 | 내용 |
|---|---|
| `.codex/` | 에이전트 지침, 역할, Figma 대상 |
| `docs/` | PRD, 디자인·서비스·작업 기준과 실행 안내 |
| `harness/` | R2~R8 설계 문서 |
| `rules/` | 판정 규칙과 JSON 스키마 |
| `scripts/` | 실행기, 판정기, 쓰기 차단 |
| `tests/` | 테스트와 검증 결과 |

## 시작

Node.js 22 이상과 Codex CLI가 필요합니다.

```sh
node --test tests/*.test.mjs
node scripts/harness.mjs start
node scripts/harness.mjs status
```

자세한 사용법은 [실행 안내](docs/harness-running.md), 보장 범위는 [강제 장치 안내](docs/enforcement.md), 검증 상태는 [검증 보고서](tests/validation-report.md)를 참고하세요.

실제 실행 시 생성되는 `harness/artifacts/`는 로컬 상태로 관리하며 Git에 포함하지 않습니다. 미확정 규칙과 자료 누락은 게이트에서 보류됩니다.
