# Consistency Checker Verification Proof (Rules K1 - K9)

Date: 2026-11-09
Network: GenLayer Studionet (Preview)

---

## 1. PRE-FIX RUN (HISTORICAL F1-F7 PASS)

Command: `node scripts/tools/check_evidence_consistency.js`  
Date: 2026-10-19T06:44:06Z  
Exit Code: 1  

```text
=== RUNNING CONSISTENCY CHECKER (K1 - K7) ===
Checking deployments.json basic formats...
Rule K1: Checking call-site arity & method names...
Rule K2: Checking decoded errors against contract literals...
Rule K3: Checking maintainer response stored arrays...
Rule K4: Checking on-chain claim traceability tags...
Rule K5: Checking calibration counter consistency...
Rule K6: Checking truncation labelling...
Rule K7: Checking rendered table byte-identity...

--- CHECKER FOUND VIOLATIONS ---
[K1 FAIL] run_evidence.js: Method 'respond_to_finding' called with 4 args, contract expects 5
[K1 FAIL] run_evidence.js: Method 'respond_to_finding' called with 4 args, contract expects 5
[K2 FAIL] Negative test NEG-04: decodedError "only target registrant can respond" not found in contract UserError literals
[K3 FAIL] Target 9bd135be77a6 audit #1: response transaction succeeded but stored_responses is empty
[K3 FAIL] Target 9bd135be77a6 audit #1: response transaction succeeded but stored_responses is empty
[K4 FAIL] EVIDENCE.md: Missing <!-- onchain:... --> traceability tags for documented numbers
[K5 FAIL] Model calibration lacks per-run measured data
[K6 FAIL] Truncated target 'ShellLike Large Fixture' not labelled as partial/truncated in EVIDENCE.md
[K6 FAIL] Truncated self-lint 'ConsensusLint Ledger Contract' not labelled as partial/truncated in EVIDENCE.md
Checker failed with 9 violation(s).
```

---

## 2. RULE K8 ADDITION (v1.0.1 TRUNCATION INTEGRITY)

Rule K8 enforces that:
1. Any truncated audit (`truncated == true`) MUST have stored `score <= 89`.
2. Any truncated audit MUST NOT appear in the full `best` leaderboard ranking; it must be partitioned into `partial`.
3. Any mention of a truncated target in `EVIDENCE.md` must be accompanied by explicit partial or truncated labelling.

### Pre-Fix Failure Verification on Bad Fixture
Running `checkK8_TruncationIntegrity` against `tests/fixtures-tooling/k8_bad_evidence.json` detects both violations:
- `[K8 FAIL] Target 'ShellLike Large Fixture' is truncated but score is 95 (> 89)`
- `[K8 FAIL] Truncated target 'ShellLike Large Fixture' found in full 'best' board ranking`

---

## 3. RULE K9 ADDITION (SELF-LINT EVIDENCE INTEGRITY)

Rule K9 enforces that:
1. Every self-lint record's `source_sha256` MUST equal the SHA-256 digest of the local file at the commit named in its URL (`contracts/ConsensusLint.py` and `contracts/HygieneBadges.py`).
2. Every self-lint record's `source_bytes` MUST equal the real file byte size (`68,032` bytes for `ConsensusLint.py` and `8,990` bytes for `HygieneBadges.py`).
3. Every self-lint target URL MUST be commit-pinned (e.g. `raw.githubusercontent.com/.../<commit>/...`, never `/main/`).
4. Documentation files MUST NOT quote superseded or incorrect byte counts (e.g. 22,866).

### Failure Verification on Bad Fixture
Running `checkK9_SelfLintIntegrity` against `tests/fixtures-tooling/k9_bad_evidence.json` flags 6 violations:
- `[K9 FAIL] Self-lint 'ConsensusLint': source_sha256 04337cfc91fe45f76042dba860adf4d9f1567e68fabb525838fa7dffaf4d313b does not match local file sha256 ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25`
- `[K9 FAIL] Self-lint 'ConsensusLint': source_bytes 66505 does not match local file size 68032`
- `[K9 FAIL] Self-lint 'ConsensusLint': URL is not commit-pinned: https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/main/contracts/ConsensusLint.py`
- `[K9 FAIL] Self-lint 'HygieneBadges': source_sha256 64181bc3a3965e9427039a8dec504f0c25aeb4e7e9186b54ba426aadb5bb48b8 does not match local file sha256 6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923`
- `[K9 FAIL] Self-lint 'HygieneBadges': source_bytes 22866 does not match local file size 8990`
- `[K9 FAIL] Self-lint 'HygieneBadges': URL is not commit-pinned: https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/main/contracts/HygieneBadges.py`

---

## 4. Tooling Test Suite (K1 - K9 Pass / Fail Verification)

Command: `python -m unittest tests/test_checker_rules.py`  
Output:
```text
.........
----------------------------------------------------------------------
Ran 9 tests in 1.112s

OK
```
All 9 rules (K1 through K9) have dedicated tooling tests with bad fixtures (failing) and good fixtures (passing) under `tests/fixtures-tooling/`.

---

## 5. Full Production Consistency Check (K1 - K9)

Command: `node scripts/tools/check_evidence_consistency.js`  
Output:
```text
=== RUNNING CONSISTENCY CHECKER (K1 - K9) ===
Checking deployments.json basic formats...
Rule K1: Checking call-site arity & method names...
Rule K2: Checking decoded errors against contract literals...
Rule K3: Checking maintainer response stored arrays...
Rule K4: Checking on-chain claim traceability tags...
Rule K5: Checking calibration counter consistency...
Rule K6: Checking truncation labelling...
Rule K7: Checking rendered table byte-identity...
Rule K8: Checking truncation integrity (score <= 89, board separation)...
Rule K9: Checking self-lint commit pinning and byte-size integrity...

ALL EVIDENCE CONSISTENCY CHECKS (K1 - K9) PASSED OK!
```
