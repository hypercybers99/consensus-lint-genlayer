# On-Chain Evidence & Verification

<!-- onchain:evidence_overview -->
All transactions and audits documented below were executed on **GenLayer Studionet (Preview)** (Chain ID `61999`, RPC `https://studio.genlayer.com/api`, Explorer `https://explorer-studio.genlayer.com`).

> [!NOTE]
> Consensus outcomes are reported as **accepted by validators** with the real consensus agreement ratio (e.g. `3/5`) extracted directly from receipt validator votes. Revert outcomes record the exact decoded `gl.vm.UserError` string returned from GenVM execution alongside raw base64 leader bytes.

---

## 1. Primary Contract Deployments

<!-- onchain:primary_deployments -->
| Contract | Address | Deploy Transaction Hash | Agreement | Status | Source SHA-256 |
|---|---|---|---|---|---|
| **ConsensusLint** | `0xDd9c4b5d187664780142f24E4327D48Db59363D7` | [`0xb7cfcbc25af965a64af33f265419c7d0929335b1440c17c8e327d4eb6911d33b`](https://explorer-studio.genlayer.com/tx/0xb7cfcbc25af965a64af33f265419c7d0929335b1440c17c8e327d4eb6911d33b) | `3/5` | `ACCEPTED` | `ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25` |
| **HygieneBadges** | `0xbd8d4F05423Dd98e2A1F911A371911c1671Eb140` | [`0xe44d8d449652afc929de9fbdbc32f8828d1c54b4f611fd3fd6841c05ca975426`](https://explorer-studio.genlayer.com/tx/0xe44d8d449652afc929de9fbdbc32f8828d1c54b4f611fd3fd6841c05ca975426) | `4/5` | `ACCEPTED` | `6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923` |
| **Probe (superseded diagnostic)** | `0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6` | [`0xf00fa3b5d292ddf1e77aee476a82d8993a41f75f8cd2205cd0955b5e315a76f8`](https://explorer-studio.genlayer.com/tx/0xf00fa3b5d292ddf1e77aee476a82d8993a41f75f8cd2205cd0955b5e315a76f8) | `3/5` | `superseded diagnostic probe` | `35de2f50206bac0addafb711623795519d8f67efd631e0388b49e9b8c425989b` |

### Inter-Contract Configuration
<!-- onchain:set_ledger -->
- **`HygieneBadges.set_ledger` Tx**: [`0xb5bf92cfd5a4093f490321435693e0637b2f42ad0989fc6c4841ddfd0e781c65`](https://explorer-studio.genlayer.com/tx/0xb5bf92cfd5a4093f490321435693e0637b2f42ad0989fc6c4841ddfd0e781c65)
- **Agreement**: `3/5`
- **Configured Ledger**: `0xdd9c4b5d187664780142f24e4327d48db59363d7`
- **Deployer / Owner**: `0xe2d9062adc5f4b6061788996f859b224a7a8745c`

---

## 2. On-Chain Positive Fixture Audits

<!-- onchain:fixture_audits -->
| Fixture Target | Target ID | Register Tx | Audit Tx | Agreement | Score | Grade | Truncated | Findings Count |
|---|---|---|---|---|---|---|---|---|
| **GoodContract Fixture** | `2bac0b36b071` | [`0xadebf1cc2d33a6c1220b3cf9f89fe7a331993fc8cab682b9a198378ab843fc9a`](https://explorer-studio.genlayer.com/tx/0xadebf1cc2d33a6c1220b3cf9f89fe7a331993fc8cab682b9a198378ab843fc9a) | [`0x2ae40d46880baadcf022134997ce0a190635bebfd5f8810a6e8dea18d49e6a3d`](https://explorer-studio.genlayer.com/tx/0x2ae40d46880baadcf022134997ce0a190635bebfd5f8810a6e8dea18d49e6a3d) | `3/5` | **100** | **A** | `false` | 0 rules |
| **MixedContract Fixture** | `4f74133a0a13` | [`0xb1787d0993a8ef6cd6700160984871072ec6f1885d38a4431b2edd59efc64e7f`](https://explorer-studio.genlayer.com/tx/0xb1787d0993a8ef6cd6700160984871072ec6f1885d38a4431b2edd59efc64e7f) | [`0xdc5d041484a1bce7fa79cb444d9c2079200c65b4e64eafc2ae85e15fb9336217`](https://explorer-studio.genlayer.com/tx/0xdc5d041484a1bce7fa79cb444d9c2079200c65b4e64eafc2ae85e15fb9336217) | `3/5` | **86** | **B** | `false` | 3 rules |
| **BadContract Fixture** | `c74c8288839d` | [`0x2bc8fccf4ef386e6bf834572bf1acbe4583739b2fb5978ed37d12e0daa792d70`](https://explorer-studio.genlayer.com/tx/0x2bc8fccf4ef386e6bf834572bf1acbe4583739b2fb5978ed37d12e0daa792d70) | [`0x750d98f5f98dc79cb0594951ba24fd4eaacb4a17af9a170f7a325539b14b0bda`](https://explorer-studio.genlayer.com/tx/0x750d98f5f98dc79cb0594951ba24fd4eaacb4a17af9a170f7a325539b14b0bda) | `3/5` | **0** | **F** | `false` | 17 rules |
| **NotAContract Fixture** | `fc8f14409f6b` | [`0x31ba6d9603c23b8d708b1e2dad54bb1660f5ef6d6c6587fdcfe505b6a08a56a2`](https://explorer-studio.genlayer.com/tx/0x31ba6d9603c23b8d708b1e2dad54bb1660f5ef6d6c6587fdcfe505b6a08a56a2) | [`0xa230546f3353fed93962514515e23ca5518b64429e2585950b6c5dedc6cfd434`](https://explorer-studio.genlayer.com/tx/0xa230546f3353fed93962514515e23ca5518b64429e2585950b6c5dedc6cfd434) | `3/5` | **-1** | **N/A** | `false` | 0 rules |
| **ShellLike Large Fixture (partial/truncated audit)** | `dca608d38708` | [`0xab53bb3ab5efb73d8adbab4afb81706c2aee92555691134f2f5bfc2029f04de2`](https://explorer-studio.genlayer.com/tx/0xab53bb3ab5efb73d8adbab4afb81706c2aee92555691134f2f5bfc2029f04de2) | [`0xe6234c85dada1bffee2ba2a7c1b33ee5216034485a9511acaef670837712552f`](https://explorer-studio.genlayer.com/tx/0xe6234c85dada1bffee2ba2a7c1b33ee5216034485a9511acaef670837712552f) | `3/5` | **89** | **B** | `true` | 0 rules |

> [!WARNING]
> **ShellLike Large Fixture Truncation Note**: ShellLike (196,016 bytes) exceeded `MAX_SOURCE_BYTES` (120,000 bytes). It was linted only on its first complete lines within 120,000 bytes (~61% of file bytes). Its stored score is strictly capped at **89** and its grade is capped at **Grade B** on-chain, and it is partitioned into a separate `partial` board list.

---

## 3. On-Chain Dogfooding (Self-Lint)

<!-- onchain:self_lint -->
ConsensusLint evaluated its own deployed contracts directly via validator re-fetch from GitHub. Under the upgraded `MAX_SOURCE_BYTES = 120000`, `ConsensusLint.py` (66,505 bytes) is **100% analyzed on-chain without truncation** (`truncated: false`), scoring 94 (Grade A) with 0 unlinted tail. `HygieneBadges.py` (22,866 bytes) is likewise 100% analyzed on-chain (`truncated: false`), scoring 94 (Grade A).

| Contract | Target ID | Register Tx | Audit Tx | Agreement | Hygiene Score | Grade | Key Rule Findings |
|---|---|---|---|---|---|---|---|
| **ConsensusLint Ledger Contract** | `d694b3d29de5` | [`0x9758f53cf57b962138b9015aa7f5d1b2f1f5eb7a8a9910df62fee1dc74292509`](https://explorer-studio.genlayer.com/tx/0x9758f53cf57b962138b9015aa7f5d1b2f1f5eb7a8a9910df62fee1dc74292509) | [`0xa420f016e573f7dc37bb6d3e1bc2a179b5872890e5086bdbb7850152b2ae6a97`](https://explorer-studio.genlayer.com/tx/0xa420f016e573f7dc37bb6d3e1bc2a179b5872890e5086bdbb7850152b2ae6a97) | `3/5` | **94** | **A** | `CL06, CL16` |
| **HygieneBadges Contract** | `60285d3dfb85` | [`0x826856831ae04e0384e5a7fafb58dde93e551c5bbd8480454931997e64364863`](https://explorer-studio.genlayer.com/tx/0x826856831ae04e0384e5a7fafb58dde93e551c5bbd8480454931997e64364863) | [`0x5dc8b103f6eeff5783578cf907b9559c5e222fe1a74c88f6784268a5e7073904`](https://explorer-studio.genlayer.com/tx/0x5dc8b103f6eeff5783578cf907b9559c5e222fe1a74c88f6784268a5e7073904) | `3/5` | **94** | **A** | `CL06, CL16` |

### Model Layer Judgements (J1 - J3) on Active Contracts
<!-- onchain:model_judgements -->
| Contract / Target | Question | Judgement Label | Quote Verified | Penalty | Verbatim Code Quote |
|---|---|---|---|---|---|
| GoodContract Fixture (`2bac0b36b071`) | `J1` | `RECOMPUTES` | `true` | 0 pts | `def val_fetch():     res = gl.nondet.web.get(source_url)     body = res.body if isinstance(res.body, (bytes, bytearray)) else str(res.body).encode("utf-8")     return hashlib.sha256(body).hexdigest()` |
| GoodContract Fixture (`2bac0b36b071`) | `J2` | `ENUM_OR_BUCKET` | `true` | 0 pts | `return val_sand.calldata == ldata.get("sha256")` |
| ConsensusLint Self-Lint (`0xDd9c4b5d187664780142f24E4327D48Db59363D7`) | `J1` | `UNCLEAR` | `false` | 0 pts | `(empty)` |
| ConsensusLint Self-Lint (`0xDd9c4b5d187664780142f24E4327D48Db59363D7`) | `J2` | `ENUM_OR_BUCKET` | `true` | 0 pts | `if val_bucket != lead_data.get("penalty_bucket"):                 return False` |
| ConsensusLint Self-Lint (`0xDd9c4b5d187664780142f24E4327D48Db59363D7`) | `J3` | `UNCLEAR` | `false` | 0 pts | `(empty)` |
| ConsensusLint Self-Lint (`0xDd9c4b5d187664780142f24E4327D48Db59363D7`) | `J3` | `UNCLEAR` | `false` | 0 pts | `(empty)` |

---

## 4. Maintainer Finding Response Flow

<!-- onchain:maintainer_responses -->
Contract registrants can attach documented responses with a structured stance (`FIXED_NEXT`, `DISPUTE`, `WONTFIX`) to specific findings without altering consensus verdicts:

- **Target ID**: `c74c8288839d` (Audit #1)
- **Rule**: `CL05`
- **Stance**: `FIXED_NEXT`
- **Response Note**: *"Acknowledged: TreeMap lazy initialization will be adopted in next patch."*
- **Transaction Hash**: [`0x2e21aa846afa2188142dc4c7dda4f273898078045a87cff0f245b9ad4269e0f6`](https://explorer-studio.genlayer.com/tx/0x2e21aa846afa2188142dc4c7dda4f273898078045a87cff0f245b9ad4269e0f6) (Agreement `4/5`, Elapsed `11.97s`)
- **Stored Responses Array**: `[{"at":"2026-10-31T09:41:26Z","by":"0xe2d9062adc5f4b6061788996f859b224a7a8745c","note":"Acknowledged: TreeMap lazy initialization will be adopted in next patch.","rule_id":"CL05","stance":"FIXED_NEXT"}]`


---

## 5. HygieneBadges On-Chain Verification

<!-- onchain:badges -->
Cross-contract view composition via `gl.get_contract_at(Address(ledger_address)).view().get_target_summary(target_id)`:

| Badge ID | Target ID | Display Name | Current Status | Grade | Score | Claim Tx Hash | Agreement |
|---|---|---|---|---|---|---|---|
| `530360cf70b6` | `2bac0b36b071` | GoodContract Clean Hygiene Badge | `BADGE_A` | **A** | 100 | [`0x1bdffe953a4d33105c861a4137e8749b690ddaec76d056e95add61e88b86a565`](https://explorer-studio.genlayer.com/tx/0x1bdffe953a4d33105c861a4137e8749b690ddaec76d056e95add61e88b86a565) | `3/5` |

> [!NOTE]
> **Badge Minting on Truncated Audits Refusal**: HygieneBadges verifies the target summary from ConsensusLint and strictly refuses badge minting when `truncated == true` with `raise gl.vm.UserError("cannot claim badge for truncated audit")` (verified on-chain in `NEG-BADGE-TRUNC`).

---

## 6. Decoded Negative Revert Tests

<!-- onchain:negative_tests -->
Every negative constraint is rejected deterministically via `raise gl.vm.UserError("<exact message>")`. Receipts record execution status `ERROR` with the decoded error string verified against contract literals, alongside raw base64 leader bytes:

| Test ID | Description | Transaction Hash | Receipt Status | Agreement | Raw Base64 Leader Bytes | Decoded `gl.vm.UserError` | Result |
|---|---|---|---|---|---|---|---|
| **NEG-BADGE-TRUNC** | Refuse badge issuance for truncated audit (ShellLike) | [`0x3d4d7cf92c7dcf51dbdaac3709ba07a4f755feab6cac44d4487fb99c73ae1ffe`](https://explorer-studio.genlayer.com/tx/0x3d4d7cf92c7dcf51dbdaac3709ba07a4f755feab6cac44d4487fb99c73ae1ffe) | `ACCEPTED` | `3/5` | `AWNhbm5vdCBjbGFpbSBiYWRnZSBmb3IgdHJ1bmNhdGVkIGF1ZGl0` | `"cannot claim badge for truncated audit"` | **PASS** |
| **NEG-RESP-01** | Reject finding response from non-registrant sender | [`0xc2deb05c4f5a873e44b4e746d1ce0f3be0e3797ea52011187f124fbf188ce540`](https://explorer-studio.genlayer.com/tx/0xc2deb05c4f5a873e44b4e746d1ce0f3be0e3797ea52011187f124fbf188ce540) | `ACCEPTED` | `3/5` | `AW9ubHkgdGhlIHJlZ2lzdHJhbnQgY2FuIGRvIHRoaXM=` | `"only the registrant can do this"` | **PASS** |
| **NEG-RESP-02** | Reject finding response with invalid stance | [`0x0873cc1c919e86ff88543a84f09643ba336451d38409e8990659cd0e36a8e94c`](https://explorer-studio.genlayer.com/tx/0x0873cc1c919e86ff88543a84f09643ba336451d38409e8990659cd0e36a8e94c) | `ACCEPTED` | `3/5` | `AWludmFsaWQgc3RhbmNl` | `"invalid stance"` | **PASS** |
| **NEG-RESP-03** | Reject finding response for rule not present in audit | [`0xec32d000de0ac00d3e4f63ff7e5331e5b1b93591f20d4a9ccef3471bb32f691f`](https://explorer-studio.genlayer.com/tx/0xec32d000de0ac00d3e4f63ff7e5331e5b1b93591f20d4a9ccef3471bb32f691f) | `ACCEPTED` | `3/5` | `AWZpbmRpbmcgbm90IHByZXNlbnQgaW4gYXVkaXQ=` | `"finding not present in audit"` | **PASS** |

---

## 7. Real-World Historical Contract Audits On-Chain

<!-- onchain:historical_targets -->
Historical Intelligent Contract versions registered and audited on **GenLayer Studionet (Preview)** through ConsensusLint:

| Contract Target | Target ID | Register Tx | Audit Tx | Agreement | On-Chain Score | On-Chain Grade | Truncated |
|---|---|---|---|---|---|---|---|
| **CitationWatch v1.0.0** | `f96c34d309a7` | [`0x662daa8148d1d67140b9dc60e899838e3732e1b73e19a9a1179083e0b40461be`](https://explorer-studio.genlayer.com/tx/0x662daa8148d1d67140b9dc60e899838e3732e1b73e19a9a1179083e0b40461be) | [`0xce5f7aa2924b57130c2f7d38392d8d8d520bc082a17edb378032fbc8ccb1337f`](https://explorer-studio.genlayer.com/tx/0xce5f7aa2924b57130c2f7d38392d8d8d520bc082a17edb378032fbc8ccb1337f) | `3/5` | **56** | **D** | `false` |
| **CitationWatch v1.2.0** | `dabbcb2fcd4e` | [`0xc3ee29a525f72338fbf8250876dadd7417ac8af3e84015f22cc8ce18b7c43849`](https://explorer-studio.genlayer.com/tx/0xc3ee29a525f72338fbf8250876dadd7417ac8af3e84015f22cc8ce18b7c43849) | [`0x25249c6730c06470c16ea1aac861266d64b6528fc7d8658fb92a7ec3591c6360`](https://explorer-studio.genlayer.com/tx/0x25249c6730c06470c16ea1aac861266d64b6528fc7d8658fb92a7ec3591c6360) | `3/5` | **78** | **C** | `false` |
| **CommitmentLedger v3.1.0** | `58e4436e4d50` | [`0x902d4071ea59aaf7ced4c2488ff07077c3dccefea119fea51780d159769e44f2`](https://explorer-studio.genlayer.com/tx/0x902d4071ea59aaf7ced4c2488ff07077c3dccefea119fea51780d159769e44f2) | [`0x8932707a5ebcadaf5eab3a01299af437c9d667643adf4e68b4b894d318fb060b`](https://explorer-studio.genlayer.com/tx/0x8932707a5ebcadaf5eab3a01299af437c9d667643adf4e68b4b894d318fb060b) | `3/5` | **74** | **C** | `false` |

---

## 8. Unexpected or Superseded Runs

<!-- onchain:unexpected_or_superseded_runs -->
| Target | Transaction Hash | Status | Result Name | Agreement | Explanation |
|---|---|---|---|---|---|
| NotAContract Fixture (superseded deployment disagreement) | [`0x2566ae4e898c07d1c08481abeb3fe94b0a3ae7d4296120e9b4c82a3d99410105`](https://explorer-studio.genlayer.com/tx/0x2566ae4e898c07d1c08481abeb3fe94b0a3ae7d4296120e9b4c82a3d99410105) | `UNDETERMINED` | `MAJORITY_DISAGREE` | `0/5` | Observed on-chain consensus disagreement: validators voted 0/5, leading to status UNDETERMINED (MAJORITY_DISAGREE). |
| CitationWatch v1.2.0 (attempt 1) | [`0x93bcc19aa51136ff997ccdc2a459f357be8e0441bff45185af2bb0850032e06b`](https://explorer-studio.genlayer.com/tx/0x93bcc19aa51136ff997ccdc2a459f357be8e0441bff45185af2bb0850032e06b) | `FINALIZED` | `MAJORITY_DISAGREE` | `2/5` | Observed on-chain consensus disagreement: 3 validators voted DISAGREE in round 3, leading to status UNDETERMINED (MAJORITY_DISAGREE). Real agreement 2/5. |

---

## 9. Fixture & Sample Statistics (n=10 targets)

<!-- onchain:ecosystem_views -->
- **Total Targets Registered**: `10`
- **Total Audits Performed**: `10`
- **Scored Targets**: `9`

### Leaderboard Full Audits (`best`)
- **GoodContract Fixture** (`2bac0b36b071`): Score 100 (Grade A)
- **ConsensusLint Ledger Contract** (`d694b3d29de5`): Score 94 (Grade A)
- **HygieneBadges Contract** (`60285d3dfb85`): Score 94 (Grade A)
- **MixedContract Fixture** (`4f74133a0a13`): Score 86 (Grade B)
- **CitationWatch v1.2.0** (`dabbcb2fcd4e`): Score 78 (Grade C)
- **CommitmentLedger v3.1.0** (`58e4436e4d50`): Score 74 (Grade C)
- **CitationWatch v1.0.0** (`f96c34d309a7`): Score 56 (Grade D)
- **BadContract Fixture** (`c74c8288839d`): Score 0 (Grade F)

### Leaderboard Partial / Truncated Audits (`partial`)
- **ShellLike Large Fixture (partial/truncated audit)** (`dca608d38708`): Score 89 (Grade B, capped at 89)

> [!NOTE]
> **Leaderboard Partitioning on Truncation**: Truncated audits are partitioned into the `partial` list and excluded from full `best` rankings to protect leaderboard integrity.

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
