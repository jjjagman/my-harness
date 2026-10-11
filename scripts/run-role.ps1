param(
  [Parameter(Mandatory=$true)][ValidateSet('references','structure','rules','design','handoff','judge')][string]$Role
)
$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
  $roles = Get-Content -LiteralPath '.codex/roles.json' -Raw | ConvertFrom-Json
  $roleInfo = $roles.$Role
  $stateText = & node scripts/harness.mjs resume
  if ($LASTEXITCODE -ne 0) { throw 'Start a run first.' }
  $runState = $stateText | ConvertFrom-Json
  if ($roleInfo.gateBefore -and $runState.gates.($roleInfo.gateBefore).status -ne 'pass') { throw 'Preceding gate has not passed.' }
  if ($Role -eq 'judge') {
    foreach ($gate in @('G1','G2','G3')) {
      & node scripts/harness.mjs check $gate
      if ($LASTEXITCODE -ne 0) { break }
    }
    exit $LASTEXITCODE
  }
  if ($Role -eq 'design') { throw 'Use the connected Figma skill in the interactive session. Supply target file/page and produce real extraction data; this text worker cannot edit Figma.' }
  $prompt = @"
Read AGENTS.md and docs/harness-running.md. Role: $Role. Task: $($roleInfo.task)
You are a read-only proposal worker. Never write files, invoke other agents, approve a gate, or send external messages.
Return only the JSON matching the provided schema. Each file content is a complete proposed UTF-8 file.
If source data, user decisions, or tool access is missing, return status blocked and files []. Never fabricate references or clear unresolved decisions.
Use the artifact formats documented in docs/harness-running.md. Your output is applied only through the role write guard.
"@
  $proposalText = $prompt | & codex -a never exec --ignore-user-config --sandbox read-only --skip-git-repo-check --output-schema rules/proposal.schema.json -
  if ($LASTEXITCODE -ne 0) { throw 'Codex worker failed; no proposal applied.' }
  $proposal = ($proposalText -join "`n") | ConvertFrom-Json
  if ($proposal.status -ne 'ready') { throw ('Worker blocked: ' + $proposal.reason) }
  foreach ($file in $proposal.files) {
    $file.content | & node scripts/harness.mjs write $Role $file.path
    if ($LASTEXITCODE -ne 0) { throw 'Proposal rejected by write guard.' }
  }
} finally { Pop-Location }
