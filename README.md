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

현재 레퍼런스, 화면 구조, 피그마 이미지와 추출 자료는 `harness/artifacts/`에 함께 저장합니다. 로컬 실행 상태, 승인 기록, 변경 이력과 이전 이미지는 Git에서 제외합니다. 새 환경에서는 `start` 후 G1~G3를 다시 검사하며, 저장소의 자료 자체가 사람 승인을 뜻하지 않습니다. 미확정 규칙과 자료 누락은 게이트에서 보류됩니다.

## 현재 디자인 자료

- [피그마 화면](https://www.figma.com/design/NEgBtr6qQA7oXLyE4bdFRq?node-id=38-378)
- [화면 미리보기](harness/artifacts/04-design/overview.png)
- [화면별 검토 자료](harness/artifacts/04-design/review.md)
- [UI Bowl 라운드 레퍼런스](harness/artifacts/01-references/README.md)

레퍼런스 이미지는 UI Bowl에서 조회한 참고 자료이며 원 서비스의 자산입니다. 새로운 레퍼런스 이미지를 추가하면 `.gitignore`의 이미지 허용 목록도 갱신합니다.
