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
- 현재 레퍼런스는 UI Bowl MCP에서 조회한 라운드만 사용한다. G1은 설정된 제공자·앱·uibowl.io 출처·MCP 이미지 ID를 검사한다. 이는 제출 자료의 일관성 검사이며 원격 조회 진위의 자동 증명은 아니다.
- 현재 적용 목록은 `harness/artifacts/01-references/README.md`에서 확인한다. `references.json`과 `image-downloads.json`에 연결되지 않은 과거 이미지는 적용하지 않는다.
- 최종 사람 검토 항목은 `brand`(브랜드색의 절제와 무채색 구성), `reference`(참고 스타일), `readability`(가독성)다.
- references.json: `{references:[{id,url,reason,imageUrls:["https://.../screen.png"]}],patterns:[{summary,references:[id,id]}]}`
- 레퍼런스 수집자는 실제로 확인한 화면 이미지의 직접 주소를 imageUrls에 넣는다. 앱 소개 페이지 주소나 추측한 주소를 넣지 않는다. 주소를 얻지 못하면 빈 배열을 기록한다.
- CLI로 references.json을 저장하면 화면 이미지를 자동 다운로드한다. `run-role.ps1 references`도 이 저장 경로를 사용한다. API의 `Harness.write()`만 직접 호출한 경우 `downloadReferenceImages()`를 별도로 호출한다.
- 저장 위치: `harness/artifacts/01-references/images/`. 파일명은 이미지 내용의 SHA-256이며 같은 내용은 같은 파일을 사용한다. 출처와 파일 연결 및 실패 사유는 같은 상위 폴더의 `image-downloads.json`에 저장한다.
- 기존 자료의 이미지 다운로드 또는 재시도: `node scripts/harness.mjs download-references`. G1 수정 예약이 필요한 상태에서는 먼저 기존 `retry G1` 절차를 따른다.
- HTTPS 직접 이미지 주소를 사용하며 PNG/JPEG/GIF/WebP 헤더를 확인한다. 파일당 최대 10 MiB, 요청당 20초 제한이다. 로그인 세션이나 접근 제한을 우회하지 않는다. 페이지에서 이미지를 자동 탐색하거나 이미지를 생성하지 않는다.
- 이미지 주소 누락·다운로드 실패는 image-downloads.json에서 blocked로 보고한다. 기존 G1은 출처·이유·공통 패턴 검사이며 이미지 다운로드 성공을 의미하지 않는다.
- screens.json: `{screens:[{id,source}],fields:[{id,required}],settings:[{field,hideable}]}`
- 필드 ID `tea-name`은 유일한 필수 필드이며 hideable=false다. 나머지는 required=false, hideable=true다.
- 화면 ID: record-list, record-create, record-detail, taste-analysis, field-settings.
- figma-manifest.json: `{fileKey,pageId,screens:[{id,nodeId,extraction,image}],fields,settings}`
- extraction: 프로젝트 상대경로 JSON. `{fileKey,pageId,nodeId,properties:[{kind,value}],fields,settings}`
- G3는 manifest의 fileKey·pageId가 `.codex/figma-target.json`의 지정 대상과 일치하는지 검사한다. 각 추출 JSON에도 같은 fileKey·pageId와 해당 화면의 nodeId가 필요하다.
- 대상 설정, 화면 연결 정보, 비어 있지 않은 추출 속성, 화면 이미지가 누락되면 보류한다. 대상 불일치나 화면 간 nodeId 중복은 실패한다. 기존 추출 자료에 pageId가 없으면 실제 원본을 확인해 다시 추출해야 한다.
- 이 검사는 제출된 로컬 자료의 일관성을 확인한다. 원격 Figma에서 해당 노드가 실제로 존재하거나 지정 페이지에 속하는지 직접 조회하는 검사는 아니다.
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
