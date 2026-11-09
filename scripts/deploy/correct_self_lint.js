const dns = require('dns');
dns.setDefaultResultOrder('verbatim');

const { createClient, chains, createAccount } = require('genlayer-js');
const fs = require('fs');
const path = require('path');

const RPC_URL = "https://studio.genlayer.com/api";

async function waitReceiptWithRetry(hash, maxRetries = 100, intervalMs = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionByHash',
          params: [hash],
        }),
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        const tx = json.result;
        if (tx && (tx.status === 'ACCEPTED' || tx.status === 'FINALIZED' || tx.status === 'UNDETERMINED' || tx.status === 5 || tx.status === 6)) {
          return tx;
        }
      } catch (parseErr) {}
    } catch (e) {}
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for tx receipt: ${hash}`);
}

function calculateAgreement(tx) {
  if (!tx.consensus_data || !tx.consensus_data.votes) {
    return { agree: 0, total: 0, str: "N/A", votes: {} };
  }
  const votes = tx.consensus_data.votes;
  const agreeCount = Object.values(votes).filter(v => v === 'agree').length;
  const totalCount = Object.keys(votes).length;
  return {
    agree: agreeCount,
    total: totalCount,
    str: `${agreeCount}/${totalCount}`,
    votes: votes
  };
}

async function retryCall(fn, maxRetries = 10, delayMs = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      let waitMs = delayMs;
      if (e.cause && e.cause.data && e.cause.data.retry_after_seconds) {
        waitMs = (e.cause.data.retry_after_seconds + 3) * 1000;
      } else if (e.message && e.message.includes('Rate limit')) {
        waitMs = 20000;
      }
      console.log(`Call failed (attempt ${i + 1}/${maxRetries}): ${e.message}. Retrying in ${waitMs}ms...`);
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
}

async function main() {
  console.log("=== EXECUTING SELF-LINT EVIDENCE CORRECTION (v1.0.1) ===");
  console.log("Network: GenLayer Studionet (Preview)");
  console.log("Chain ID: 61999");
  console.log("RPC:", RPC_URL);

  const deployments = JSON.parse(fs.readFileSync(path.join(__dirname, 'deployments.json'), 'utf8'));
  const lintAddress = deployments.contracts.ConsensusLint.address;
  console.log("Active ConsensusLint address:", lintAddress);

  const keyPath = path.join(__dirname, 'deployer_key.json');
  const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const primaryAccount = createAccount(keyData.privateKey);
  console.log("Primary deployer account:", primaryAccount.address);

  const client = createClient({
    chain: chains.studionet,
    account: primaryAccount,
  });

  const targetsToAudit = [
    {
      key: "ConsensusLint",
      label: "ConsensusLint Ledger Contract",
      series: "ConsensusLint Core",
      url: "https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/8b547e3a3257e5d24bf74463a5271c39d6bcb375/contracts/ConsensusLint.py",
      expectedSha: "ce592840fda0a61d2f3d0ea39aaaa5ba2c6da0929ee9a6a7654cf7e74c0d3e25",
      expectedBytes: 68032
    },
    {
      key: "HygieneBadges",
      label: "HygieneBadges Contract",
      series: "ConsensusLint Core",
      url: "https://raw.githubusercontent.com/hypercybers99/consensus-lint-genlayer/8b547e3a3257e5d24bf74463a5271c39d6bcb375/contracts/HygieneBadges.py",
      expectedSha: "6d2a48275d31556f42ac8fed0b0c91ecace9300e3f60592643b5bf98e3009923",
      expectedBytes: 8990
    }
  ];

  const results = {};

  for (const t of targetsToAudit) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing ${t.label}...`);
    console.log(`URL: ${t.url}`);

    // Register target
    console.log("Registering target...");
    const tReg0 = Date.now();
    const regTxHash = await retryCall(() => client.writeContract({
      address: lintAddress,
      functionName: 'register_target',
      args: [t.label, t.series, t.url],
    }));
    console.log("Registration Tx Hash:", regTxHash);
    const regTx = await waitReceiptWithRetry(regTxHash);
    const regElapsed = ((Date.now() - tReg0) / 1000).toFixed(2);
    const regAgr = calculateAgreement(regTx);
    console.log(`Registration confirmed in ${regElapsed}s. Status: ${regTx.status}, Agreement: ${regAgr.str}`);

    await new Promise(r => setTimeout(r, 2000));

    // Get assigned target id
    const rawIds = await retryCall(() => client.readContract({
      address: lintAddress,
      functionName: 'list_target_ids',
      args: [0, 1],
    }));
    const ids = JSON.parse(rawIds);
    const tid = ids[0];
    console.log(`Assigned Target ID: ${tid}`);

    // Audit target
    console.log(`Auditing Target ID ${tid}...`);
    const tAud0 = Date.now();
    const audTxHash = await retryCall(() => client.writeContract({
      address: lintAddress,
      functionName: 'audit_target',
      args: [tid],
    }));
    console.log("Audit Tx Hash:", audTxHash);
    const audTx = await waitReceiptWithRetry(audTxHash);
    const audElapsed = ((Date.now() - tAud0) / 1000).toFixed(2);
    const audAgr = calculateAgreement(audTx);
    console.log(`Audit confirmed in ${audElapsed}s. Status: ${audTx.status}, Agreement: ${audAgr.str}`);

    await new Promise(r => setTimeout(r, 2000));

    // Read back summary
    const rawSummary = await retryCall(() => client.readContract({
      address: lintAddress,
      functionName: 'get_target_summary',
      args: [tid],
    }));
    const summary = JSON.parse(rawSummary);

    // Read back audit record
    const rawAudit = await retryCall(() => client.readContract({
      address: lintAddress,
      functionName: 'get_audit',
      args: [tid, summary.latest_n],
    }));
    const auditRecord = JSON.parse(rawAudit);

    results[t.key] = {
      label: t.label,
      series: t.series,
      url: t.url,
      tid: tid,
      registrationTxHash: regTxHash,
      registrationElapsed: parseFloat(regElapsed),
      registrationAgreement: regAgr.str,
      registrationVotes: regAgr.votes,
      auditTxHash: audTxHash,
      auditElapsed: parseFloat(audElapsed),
      auditAgreement: audAgr.str,
      auditVotes: audAgr.votes,
      summary: summary,
      auditRecord: auditRecord,
    };

    console.log(`\n=== ON-CHAIN RECORD FOR ${t.label} ===`);
    console.log(`Target ID: ${tid}`);
    console.log(`Source Bytes: ${auditRecord.source_bytes}`);
    console.log(`Source SHA-256: ${auditRecord.source_sha256}`);
    console.log(`Expected SHA-256: ${t.expectedSha}`);
    console.log(`SHA-256 Match: ${auditRecord.source_sha256 === t.expectedSha}`);
    console.log(`Truncated: ${auditRecord.truncated}`);
    console.log(`Score: ${auditRecord.score}`);
    console.log(`Grade: ${auditRecord.grade}`);
    console.log(`Votes: ${JSON.stringify(audAgr.votes)} (${audAgr.str})`);
    console.log(`Elapsed Seconds: ${audElapsed}s`);
    console.log(`Register Tx Hash: ${regTxHash}`);
    console.log(`Audit Tx Hash: ${audTxHash}`);
  }

  // Save to live_evidence.json
  const evidencePath = path.join(__dirname, 'live_evidence.json');
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

  // Move old self-lint to superseded
  evidence.superseded_self_lint_v100 = evidence.self_lint;
  evidence.self_lint = results;

  // Refresh ecosystem views
  console.log("\nRefreshing ecosystem views...");
  const rawBoard = await retryCall(() => client.readContract({
    address: lintAddress,
    functionName: 'get_board',
    args: [10],
  }));
  const board = JSON.parse(rawBoard);

  const rawMeta = await retryCall(() => client.readContract({
    address: lintAddress,
    functionName: 'get_meta',
    args: [],
  }));
  const meta = JSON.parse(rawMeta);

  evidence.ecosystem_views = {
    board: board,
    meta: meta,
  };

  const raw = JSON.stringify(evidence, null, 2);
  const asciiSafe = raw.replace(/[\u007F-\uFFFF]/g, c => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4));
  fs.writeFileSync(evidencePath, asciiSafe, 'utf8');
  console.log("\nSuccessfully updated live_evidence.json with v1.0.1 self-lint evidence!");
}

main().catch(e => {
  console.error("FATAL ERROR in correct_self_lint.js:", e);
  process.exit(1);
});
