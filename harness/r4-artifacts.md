# 하네스 산출물과 재개 정책

## 단계별 산출물

| 단계 | 파일 | 내용 |
|---|---|---|
| 1. 레퍼런스 수집·분석 | harness/artifacts/01-references/references.json | 출처 URL, 참고 이유, 공통 패턴 |
| 2. 화면 구조 설계 | harness/artifacts/02-structure/screens.json | 화면 ID, PRD 근거, 화면 구조·상태 |
| 3. 디자인 규칙 정의 | rules/design-rules.json | 디자인 토큰, 컴포넌트 규칙, 서비스 위반 금지 조건 |
| 4. 피그마 화면 제작 | harness/artifacts/04-design/figma-manifest.json | 피그마 링크, 화면 ID별 노드 ID, 검사용 추출 데이터 위치 |
| 5. 검토·전달 준비 | harness/artifacts/05-review/report.json | 판정 결과와 근거 |
| 5. 검토·전달 준비 | harness/artifacts/05-review/handoff.md | 개발자 전달 안내 |

피그마에서 추출한 검사용 데이터와 화면 이미지는 harness/artifacts/04-design/에 보관한다.

## 규칙의 단일 기준 파일
- 스크립트가 읽는 규칙은 rules/design-rules.json에 모은다.
- 각 규칙에 고유 ID와 원문 근거를 기록한다.
- PRD, 서비스 스토리, 디자인 문서에서 규칙을 옮긴다.
- 원문과 충돌하거나 값이 미정이면 해당 판정을 보류한다.
- 보류된 판정은 통과로 처리하지 않는다.

## 실행 상태와 재개
- harness/artifacts/run-state.json에 다음 내용을 저장한다.
  - 단계별 상태
  - 입력·규칙·산출물의 해시
  - 검사 결과와 승인 기록
- 재개 시 변경이 없는 완료 단계만 건너뛴다.
- 입력이나 규칙이 바뀌면 영향을 받는 단계부터 다시 실행한다.
- 변경된 산출물에 대한 이전 검사와 승인은 무효화한다.

## 이력 보관
- 기존 결과는 harness/artifacts/history/ 아래 실행 ID별로 보관한다.
- 다시 실행할 때 이전 결과를 이력으로 남긴다.

## 후속 확정 사항
- 기계 판정 조건과 사람 승인 방식은 R5에서 정한다.
- 에이전트별 편집 권한은 R6에서 정한다.
