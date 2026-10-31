# Changelog

All notable changes to the ConsensusLint project are documented in this file.

## [1.0.1] - 2026-10-31

### Added
- **Checker Rule K8**: Added `checkK8_TruncationIntegrity` in `scripts/tools/check_evidence_consistency.js` enforcing:
  1. All truncated audits on-chain have score <= 89 and grade capped at B.
  2. Public board partitioning isolates truncated audits in `partial` array.
  3. All doc mentions of truncated audits are explicitly labelled `partial/truncated`.
- **Badge Refusal on Truncated Audits**: `HygieneBadges.claim_badge` strictly inspects `summary.get("truncated", False)` and raises `gl.vm.UserError("cannot claim badge for truncated audit")` when attempting to claim a badge for a truncated audit (evidenced in on-chain test `NEG-BADGE-TRUNC`).
- **Board Partitioning**: `ConsensusLint.get_board` partitions results into `{"best": [...], "partial": [...], "most_improved": [...]}`. Truncated audits (e.g. `ShellLike Large Fixture`) appear only in `partial`.

### Changed
- **`MAX_SOURCE_BYTES` Increased to 120,000**: Probed and benchmarked on GenLayer Studionet (Preview). Under 120 KB limit, `ConsensusLint.py` (66,505 bytes) is 100% analyzed on-chain without truncation (`truncated: false`), scoring Grade A (94) with 0 unlinted tail.
- **Truncated Score Capping**: `_compute_score_and_penalty` strictly caps score at 89 whenever `truncated == True`, aligning numerical scores with Grade B cap.
- **Model Layer J2 Prompt Clarification**: Added explicit clarification that comparing a computed SHA-256 digest to an expected digest (`hashlib.sha256(...).hexdigest() == expected`) is deterministic and MUST be classified as `ENUM_OR_BUCKET` (0 penalty). On-chain test confirms GoodContract received 0 penalty on J2 and achieved Score 100 (Grade A).
- **Active Deployment Redeployed**:
  - ConsensusLint: `0xDd9c4b5d187664780142f24E4327D48Db59363D7` (SHA-256 `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25`)
  - HygieneBadges: `0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140` (SHA-256 `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923`)

## [1.0.0] - 2026-10-31

### Added
- Initial deployment of ConsensusLint and HygieneBadges on GenLayer Studionet (Preview).
- 18 consensus-hygiene rules (CL01-CL18) evaluating pinned SDK Intelligent Contracts.
- Cross-contract badge minting and query composition.
- Maintainer response flow with structured stances (`FIXED_NEXT`, `DISPUTE`, `WONTFIX`).
