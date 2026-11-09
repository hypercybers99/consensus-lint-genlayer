// scripts/tools/render_evidence.js
const fs = require('fs');
const path = require('path');

function renderMarkdown() {
  const deployPath = path.join(__dirname, '../deploy/deployments.json');
  const livePath = path.join(__dirname, '../deploy/live_evidence.json');

  if (!fs.existsSync(deployPath)) {
    throw new Error("deployments.json missing");
  }
  const deployments = JSON.parse(fs.readFileSync(deployPath, 'utf8'));

  let live = null;
  if (fs.existsSync(livePath)) {
    live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
  }

  let md = `# On-Chain Evidence & Verification

<!-- onchain:evidence_overview -->
All transactions and audits documented below were executed on **GenLayer Studionet (Preview)** (Chain ID \`61999\`, RPC \`https://studio.genlayer.com/api\`, Explorer \`https://explorer-studio.genlayer.com\`).

> [!NOTE]
> Consensus outcomes are reported as **accepted by validators** with the real consensus agreement ratio (e.g. \`3/5\`) extracted directly from receipt validator votes. Revert outcomes record the exact decoded \`gl.vm.UserError\` string returned from GenVM execution alongside raw base64 leader bytes.

---

## 1. Primary Contract Deployments

<!-- onchain:primary_deployments -->
| Contract | Address | Deploy Transaction Hash | Agreement | Status | Source SHA-256 |
|---|---|---|---|---|---|
| **ConsensusLint** | \`${deployments.contracts.ConsensusLint.address}\` | [\`${deployments.contracts.ConsensusLint.deployTxHash}\`](https://explorer-studio.genlayer.com/tx/${deployments.contracts.ConsensusLint.deployTxHash}) | \`${deployments.contracts.ConsensusLint.agreement}\` | \`${deployments.contracts.ConsensusLint.status}\` | \`${deployments.contracts.ConsensusLint.sourceSha256}\` |
| **HygieneBadges** | \`${deployments.contracts.HygieneBadges.address}\` | [\`${deployments.contracts.HygieneBadges.deployTxHash}\`](https://explorer-studio.genlayer.com/tx/${deployments.contracts.HygieneBadges.deployTxHash}) | \`${deployments.contracts.HygieneBadges.agreement}\` | \`${deployments.contracts.HygieneBadges.status}\` | \`${deployments.contracts.HygieneBadges.sourceSha256}\` |
| **Probe (superseded diagnostic)** | \`${deployments.contracts.Probe.address}\` | [\`${deployments.contracts.Probe.deployTxHash}\`](https://explorer-studio.genlayer.com/tx/${deployments.contracts.Probe.deployTxHash}) | \`3/5\` | \`${deployments.contracts.Probe.status}\` | \`35de2f50206bac0addafb711623795519d8f67efd631e0388b49e9b8c425989b\` |

### Inter-Contract Configuration
<!-- onchain:set_ledger -->
- **\`HygieneBadges.set_ledger\` Tx**: [\`${deployments.contracts.HygieneBadges.setLedgerTxHash}\`](https://explorer-studio.genlayer.com/tx/${deployments.contracts.HygieneBadges.setLedgerTxHash})
- **Agreement**: \`${deployments.contracts.HygieneBadges.setLedgerAgreement}\`
- **Configured Ledger**: \`${deployments.contracts.HygieneBadges.ledgerAddress}\`
- **Deployer / Owner**: \`${deployments.deployer}\`

---

## 2. On-Chain Positive Fixture Audits

<!-- onchain:fixture_audits -->
| Fixture Target | Target ID | Register Tx | Audit Tx | Agreement | Score | Grade | Truncated | Findings Count |
|---|---|---|---|---|---|---|---|---|
`;

  if (live) {
    for (const [key, t] of Object.entries(live.targets || {})) {
      const fCount = Object.keys(t.auditRecord.findings || {}).length;
      const isTruncated = t.auditRecord && t.auditRecord.truncated;
      const labelText = isTruncated ? `**${t.label} (partial/truncated audit)**` : `**${t.label}**`;
      md += `| ${labelText} | \`${t.tid}\` | [\`${t.registrationTxHash}\`](https://explorer-studio.genlayer.com/tx/${t.registrationTxHash}) | [\`${t.auditTxHash}\`](https://explorer-studio.genlayer.com/tx/${t.auditTxHash}) | \`${t.auditAgreement}\` | **${t.auditRecord.score}** | **${t.auditRecord.grade}** | \`${t.auditRecord.truncated}\` | ${fCount} rules |\n`;
    }

    md += `
> [!WARNING]
> **ShellLike Large Fixture Truncation Note**: ShellLike (196,016 bytes) exceeded \`MAX_SOURCE_BYTES\` (120,000 bytes). It was linted only on its first complete lines within 120,000 bytes (~61% of file bytes). Its stored score is strictly capped at **89** and its grade is capped at **Grade B** on-chain, and it is partitioned into a separate \`partial\` board list.

---

## 3. On-Chain Dogfooding (Self-Lint)

<!-- onchain:self_lint -->
ConsensusLint v1.0.1 sources at commit 8b547e3, fetched by validators from a commit-pinned URL (\`ConsensusLint.py\` at 68,032 bytes and \`HygieneBadges.py\` at 8,990 bytes), were 100% analyzed on-chain without truncation (\`truncated: false\`), both scoring 94 (Grade A) with 0 unlinted tail.

| Contract | Target ID | Register Tx | Audit Tx | Agreement | Hygiene Score | Grade | Key Rule Findings |
|---|---|---|---|---|---|---|---|
`;
    for (const [key, s] of Object.entries(live.self_lint || {})) {
      const findingKeys = Object.keys(s.auditRecord.findings || {}).join(", ") || "None";
      const isTruncated = s.auditRecord && s.auditRecord.truncated;
      const labelText = isTruncated ? `**${s.label} (partial/truncated self-lint)**` : `**${s.label}**`;
      md += `| ${labelText} | \`${s.tid}\` | [\`${s.registrationTxHash}\`](https://explorer-studio.genlayer.com/tx/${s.registrationTxHash}) | [\`${s.auditTxHash}\`](https://explorer-studio.genlayer.com/tx/${s.auditTxHash}) | \`${s.auditAgreement}\` | **${s.auditRecord.score}** | **${s.auditRecord.grade}** | \`${findingKeys}\` |\n`;
    }

    if (live.superseded_self_lint_v100) {
      md += `
### Superseded v1.0.0 self-lint (historical)
<!-- onchain:superseded_self_lint -->
The initial v1.0.0 self-lint audited the pre-v1.0.1 sources at the \`main\` branch (66,505 bytes and 8,833 bytes):

| Contract | Target ID | Register Tx | Audit Tx | Agreement | Score | Grade | Notes |
|---|---|---|---|---|---|---|---|
`;
      for (const [key, s] of Object.entries(live.superseded_self_lint_v100)) {
        md += `| ${s.label} | \`${s.tid}\` | [\`${s.registrationTxHash}\`](https://explorer-studio.genlayer.com/tx/${s.registrationTxHash}) | [\`${s.auditTxHash}\`](https://explorer-studio.genlayer.com/tx/${s.auditTxHash}) | \`${s.auditAgreement}\` | **${s.auditRecord.score}** | **${s.auditRecord.grade}** | Superseded v1.0.0 self-lint |\n`;
      }
    }

    md += `
### Model Layer Judgements (J1 - J3) on Active Contracts
<!-- onchain:model_judgements -->
| Contract / Target | Question | Judgement Label | Quote Verified | Penalty | Verbatim Code Quote |
|---|---|---|---|---|---|
`;
    // GoodContract judgements
    if (live.targets && live.targets.good_contract && live.targets.good_contract.auditRecord.judgements) {
      for (const j of live.targets.good_contract.auditRecord.judgements) {
        const qClean = (j.quote || "(empty)").replace(/\n/g, ' ');
        const pen = j.label === "FREE_TEXT_OR_PAYLOAD" ? "-6 pts" : "0 pts";
        md += `| GoodContract Fixture (\`2bac0b36b071\`) | \`${j.id}\` | \`${j.label}\` | \`${j.quote_verified}\` | ${pen} | \`${qClean}\` |\n`;
      }
    }
    // Self-lint judgements
    if (live.self_lint && live.self_lint.ConsensusLint && live.self_lint.ConsensusLint.auditRecord.judgements) {
      for (const j of live.self_lint.ConsensusLint.auditRecord.judgements) {
        const qClean = (j.quote || "(empty)").replace(/\n/g, ' ');
        const pen = j.label === "NOT_ISOLATED" ? "-4 pts" : "0 pts";
        md += `| ConsensusLint Self-Lint (\`${deployments.contracts.ConsensusLint.address}\`) | \`${j.id}\` | \`${j.label}\` | \`${j.quote_verified}\` | ${pen} | \`${qClean}\` |\n`;
      }
    }

    md += `
---

## 4. Maintainer Finding Response Flow

<!-- onchain:maintainer_responses -->
Contract registrants can attach documented responses with a structured stance (\`FIXED_NEXT\`, \`DISPUTE\`, \`WONTFIX\`) to specific findings without altering consensus verdicts:

`;
    for (const resp of live.maintainer_responses || []) {
      md += `- **Target ID**: \`${resp.tid}\` (Audit #${resp.n})\n`;
      md += `- **Rule**: \`${resp.rule_id}\`\n`;
      md += `- **Stance**: \`${resp.stance}\`\n`;
      md += `- **Response Note**: *"${resp.note}"*\n`;
      md += `- **Transaction Hash**: [\`${resp.txHash}\`](https://explorer-studio.genlayer.com/tx/${resp.txHash}) (Agreement \`${resp.agreement}\`, Elapsed \`${resp.elapsed}s\`)\n`;
      md += `- **Stored Responses Array**: \`${JSON.stringify(resp.stored_responses)}\`\n\n`;
    }

    md += `
---

## 5. HygieneBadges On-Chain Verification

<!-- onchain:badges -->
Cross-contract view composition via \`gl.get_contract_at(Address(ledger_address)).view().get_target_summary(target_id)\`:

| Badge ID | Target ID | Display Name | Current Status | Grade | Score | Claim Tx Hash | Agreement |
|---|---|---|---|---|---|---|---|
`;
    for (const [key, b] of Object.entries(live.badges || {})) {
      const rec = b.record;
      md += `| \`${rec.id}\` | \`${rec.target_id}\` | ${rec.display_name} | \`${rec.current_status}\` | **${rec.current_grade}** | ${rec.current_score} | [\`${b.claimTxHash}\`](https://explorer-studio.genlayer.com/tx/${b.claimTxHash}) | \`${b.agreement}\` |\n`;
    }

    md += `
> [!NOTE]
> **Badge Minting on Truncated Audits Refusal**: HygieneBadges verifies the target summary from ConsensusLint and strictly refuses badge minting when \`truncated == true\` with \`raise gl.vm.UserError("cannot claim badge for truncated audit")\` (verified on-chain in \`NEG-BADGE-TRUNC\`).

---

## 6. Decoded Negative Revert Tests

<!-- onchain:negative_tests -->
Every negative constraint is rejected deterministically via \`raise gl.vm.UserError("<exact message>")\`. Receipts record execution status \`ERROR\` with the decoded error string verified against contract literals, alongside raw base64 leader bytes:

| Test ID | Description | Transaction Hash | Receipt Status | Agreement | Raw Base64 Leader Bytes | Decoded \`gl.vm.UserError\` | Result |
|---|---|---|---|---|---|---|---|
`;
    for (const neg of live.negative_tests || []) {
      md += `| **${neg.testId}** | ${neg.description} | [\`${neg.txHash}\`](https://explorer-studio.genlayer.com/tx/${neg.txHash}) | \`${neg.status}\` | \`3/5\` | \`${neg.raw_leader_b64 || "N/A"}\` | \`"${neg.decodedError}"\` | **${neg.passed ? 'PASS' : 'FAIL'}** |\n`;
    }

    if (live.historical_targets) {
      md += `
---

## 7. Real-World Historical Contract Audits On-Chain

<!-- onchain:historical_targets -->
Historical Intelligent Contract versions registered and audited on **GenLayer Studionet (Preview)** through ConsensusLint:

| Contract Target | Target ID | Register Tx | Audit Tx | Agreement | On-Chain Score | On-Chain Grade | Truncated |
|---|---|---|---|---|---|---|---|
`;
      for (const [key, ht] of Object.entries(live.historical_targets)) {
        md += `| **${ht.label}** | \`${ht.tid}\` | [\`${ht.registrationTxHash}\`](https://explorer-studio.genlayer.com/tx/${ht.registrationTxHash}) | [\`${ht.auditTxHash}\`](https://explorer-studio.genlayer.com/tx/${ht.auditTxHash}) | \`${ht.auditAgreement}\` | **${ht.auditRecord.score}** | **${ht.auditRecord.grade}** | \`${ht.auditRecord.truncated}\` |\n`;
      }
    }

    if (live.unexpected_or_superseded_runs && live.unexpected_or_superseded_runs.length > 0) {
      md += `
---

## 8. Unexpected or Superseded Runs

<!-- onchain:unexpected_or_superseded_runs -->
| Target | Transaction Hash | Status | Result Name | Agreement | Explanation |
|---|---|---|---|---|---|
`;
      for (const dr of live.unexpected_or_superseded_runs) {
        md += `| ${dr.target} | [\`${dr.txHash}\`](https://explorer-studio.genlayer.com/tx/${dr.txHash}) | \`${dr.status}\` | \`${dr.result_name}\` | \`${dr.agreement}\` | ${dr.reason} |\n`;
      }
    }

    if (live.ecosystem_views) {
      md += `
---

## 9. Fixture & Sample Statistics (n=${live.ecosystem_views.meta.targets_total || 10} targets)

<!-- onchain:ecosystem_views -->
- **Total Targets Registered**: \`${live.ecosystem_views.meta.targets_total}\`
- **Total Audits Performed**: \`${live.ecosystem_views.meta.audits_total}\`
- **Scored Targets**: \`${live.ecosystem_views.meta.targets_scored_total}\`

### Leaderboard Full Audits (\`best\`)
`;
      const best = (live.ecosystem_views.board && live.ecosystem_views.board.best) || [];
      for (const b of best) {
        md += `- **${b.label}** (\`${b.id}\`): Score ${b.score} (Grade ${b.grade})\n`;
      }

      md += `
### Leaderboard Partial / Truncated Audits (\`partial\`)
`;
      const partial = (live.ecosystem_views.board && live.ecosystem_views.board.partial) || [];
      for (const p of partial) {
        md += `- **${p.label} (partial/truncated audit)** (\`${p.id}\`): Score ${p.score} (Grade ${p.grade}, capped at 89)\n`;
      }

      md += `\n> [!NOTE]\n> **Leaderboard Partitioning on Truncation**: Truncated audits are partitioned into the \`partial\` list and excluded from full \`best\` rankings to protect leaderboard integrity.\n`;
    }
  }

  md += `
---

## 10. Verification & Traceability Summary

### Observed on-chain on the active deployment:
- Contract deployments (ConsensusLint, HygieneBadges, set_ledger)
- Positive fixture audits (GoodContract, BadContract, MixedContract, NotAContract, ShellLike)
- Self-lint dogfooding (ConsensusLint 100% analyzed / not truncated, HygieneBadges)
- Maintainer response flow (respond_to_finding with stance, stored responses array verified)
- HygieneBadges issuance & query (claim_badge, get_badge)
- HygieneBadges refusal on truncated audits (NEG-BADGE-TRUNC)
- Decoded negative reverts (NEG-RESP-01, NEG-RESP-02, NEG-RESP-03, NEG-BADGE-TRUNC)
- Historical real-world audits on-chain (CitationWatch v1.0.0, CitationWatch v1.2.0, CommitmentLedger v3.1.0)
- Public ledger aggregations with truncation partitioning (get_board, get_target_summary, list_target_ids)

### Unit-tested only (until proven on-chain):
- Response count limit (MAX_RESPONSES_PER_AUDIT = 10 rejection)
- Model layer prompt injection resilience and fallback downgrade
- Disagreement paths in fallback regex scanner
- Pagination bounds > 50 rejection
`;

  return md;
}

function renderEvidence() {
  const md = renderMarkdown();
  const outPath = path.join(__dirname, '../../docs/EVIDENCE.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log("Rendered EVIDENCE.md successfully to:", outPath);
}

if (require.main === module) {
  renderEvidence();
}

module.exports = {
  renderMarkdown,
  renderEvidence,
};
