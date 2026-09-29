# 차록다록 실행 진입점

설계 기준은 .codex/AGENTS.md와 harness/r2-purpose.md부터 r8-validation.md까지를 읽는다.
사용자의 명시적 하네스 구현·유지보수 요청에는 실행 코드와 설정을 수정할 수 있다.
디자인 작업 실행에는 아래 절차와 역할별 제한을 따른다.

## 실행 명령
- 시작: `node scripts/harness.mjs start`
- 재개·상태: `node scripts/harness.mjs resume`
- 자동 검사: `node scripts/harness.mjs check G1` (G2, G3 동일)
- 수정 시도 예약: `node scripts/harness.mjs retry G1`
- 역할 산출물 저장: `node scripts/harness.mjs write ROLE PATH` (내용은 stdin)
- 최종 승인: 사용자가 터미널에서 `node scripts/harness.mjs approve HASH` 실행
- 검증: `node --test tests/*.test.mjs`

역할 정의는 .codex/roles.json을 읽는다. 산출물은 guardWrite 경로를 통해 저장한다.
검사 실패·보류를 우회하거나 실제 데이터를 테스트 fixture로 대체하지 않는다.
사람 대신 승인 명령을 실행하지 않는다. 스크립트가 반환한 approvalHash를 사용자에게 제시한다.
미확정 규칙을 답변 없이 지우거나 피그마 노드·이미지·추출 자료를 지어내지 않는다.
피그마 작성 시 관련 Figma 스킬을 먼저 읽고 지정된 파일·페이지 안에서 작업한다.

## 보장 범위
현재 강제 장치는 하네스 API/CLI를 통해 저장하거나 진행하는 작업에 적용된다.
일반 셸·에디터·외부 Figma 도구의 직접 쓰기를 OS 수준에서 차단하는 설정은 아니다.
추출 JSON의 형식·값 검사는 실제 원격 Figma 원본 진위 검증을 대체하지 않는다.
실행 상태·규칙·승인 파일을 직접 편집해 게이트를 우회하지 않는다.
