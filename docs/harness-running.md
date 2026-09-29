# 실행 방법

Node.js 22 이상과 Codex CLI를 사용한다. 외부 npm 의존성은 없다.

## 폴더
- .codex/: 역할 정의, Figma 대상, 승인된 상세 에이전트 지침
- docs/: 원본 기준 문서와 실행·강제 범위 안내
- rules/: 기계 판정 값과 제안 JSON 스키마
- scripts/: 실행기, 판정기, 쓰기 차단 코드
- tests/: 자동 테스트와 검증 보고서
- harness/: R2~R8 설계 기록
- harness/artifacts/: 실제 실행 상태와 산출물 (테스트 fixture와 구분)

루트 AGENTS.md는 프로젝트 전체에서 읽을 실행 진입점으로 유지한다.

## 시작과 작업
프로젝트 루트에서 실행한다.

    node scripts/harness.mjs start
    powershell -NoProfile -File scripts/run-role.ps1 references
    node scripts/harness.mjs check G1
    powershell -NoProfile -File scripts/run-role.ps1 structure
    powershell -NoProfile -File scripts/run-role.ps1 rules
    node scripts/harness.mjs check G2

역할 실행기는 Codex를 read-only, approval never로 호출해 파일 제안을 받는다.
적용은 역할별 write guard를 통과해야 한다. 실제 모델 호출·샌드박스 작동은 환경별 통합 검증 대상이다.
design 역할은 연결된 Figma 스킬로 진행한다. 파일·페이지 미지정이면 보류한다.
G3 통과 후 `status`의 approvalHash를 사람이 확인하고 대화형 터미널에서 승인한다.

    node scripts/harness.mjs check G3
    node scripts/harness.mjs status
    node scripts/harness.mjs approve <approvalHash>
    powershell -NoProfile -File scripts/run-role.ps1 handoff

실패 후 수정 전에 `retry G1`처럼 시도를 예약한다. 자동 수정 한도는 2회다.
현재 판정기는 JSON 구조와 값의 증거를 검사한다. 자연어 PRD 해석의 정확성·원격 Figma 진위는 자동으로 증명하지 않는다.

## 산출물 형식
- references.json: `{references:[{id,url,reason}],patterns:[{summary,references:[id,id]}]}`
- screens.json: `{screens:[{id,source}],fields:[{id,required}],settings:[{field,hideable}]}`
- 필드 ID `tea-name`은 유일한 필수 필드이며 hideable=false다. 나머지는 required=false, hideable=true다.
- 화면 ID: record-list, record-create, record-detail, taste-analysis, field-settings.
- figma-manifest.json: `{fileKey,pageId,screens:[{id,nodeId,extraction,image}],fields,settings}`
- extraction: 프로젝트 상대경로 JSON. `{fileKey,nodeId,properties:[{kind,value}],fields,settings}`
- properties 종류: color, spacing, radius, fontFamily, fontSize. 수치 허용값은 rules/design-rules.json 참조.
- 추출기는 실제 디자인 데이터로만 작성한다. 누락 또는 지원하지 않는 표현은 보류하고 임의로 정규화하지 않는다.

## 검증
    node --test tests/*.test.mjs

테스트는 별도 임시 폴더를 사용한다. 실제 작업의 승인으로 기록하지 않는다.
알려진 미검증 항목과 다음 입력은 tests/validation-report.md를 확인한다.

## Codex 근거
공식 보안 문서: https://developers.openai.com/codex/security
설치된 `codex exec --help`로 read-only, --ignore-user-config, --output-schema 옵션을 확인했다.
이 CLI는 프로젝트에 없는 Claude 훅 설정을 사용하지 않는다.
