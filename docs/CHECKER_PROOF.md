# Consistency Checker Verification Proof (Rules K1 - K8)

Date: 2026-10-31
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

## 3. Tooling Test Suite (K1 - K8 Pass / Fail Verification)

Command: `python -m unittest tests/test_checker_rules.py`  
Output:
```text
........
----------------------------------------------------------------------
Ran 8 tests in 0.610s

OK
```
All 8 rules (K1 through K8) have dedicated tooling tests with bad fixtures (failing) and good fixtures (passing) under `tests/fixtures-tooling/`.
