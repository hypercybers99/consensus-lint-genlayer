const dns = require('dns');
dns.setDefaultResultOrder('verbatim');
const { createClient, chains, createAccount } = require('genlayer-js');
const { generatePrivateKey } = require('viem/accounts');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RPC_URL = "https://studio.genlayer.com/api";

async function waitReceiptWithRetry(hash, maxRetries = 60, intervalMs = 3000) {
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
        if (tx && (tx.status === 'ACCEPTED' || tx.status === 'FINALIZED')) {
          return tx;
        }
      } catch (parseErr) {
        // html/network glitch, retry
      }
    } catch (e) {
      // network glitch, retry
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timeout waiting for tx receipt: ${hash}`);
}

function calculateAgreement(tx) {
  if (!tx.consensus_data || !tx.consensus_data.votes) {
    return { agree: 0, total: 0, str: "N/A" };
  }
  const votes = tx.consensus_data.votes;
  const agreeCount = Object.values(votes).filter(v => v === 'agree').length;
  const totalCount = Object.keys(votes).length;
  return {
    agree: agreeCount,
    total: totalCount,
    str: `${agreeCount}/${totalCount}`,
  };
}

async function main() {
  console.log("=== DEPLOYING CONSENSUSLINT & HYGIENEBADGES ===");
  console.log("Network: GenLayer Studionet (Preview)");
  console.log("Chain ID: 61999");
  console.log("RPC:", RPC_URL);

  const keyPath = path.join(__dirname, 'deployer_key.json');
  let privateKey;
  if (fs.existsSync(keyPath)) {
    const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    privateKey = keyData.privateKey;
    console.log("Loaded existing deployer key from:", keyPath);
  } else {
    privateKey = generatePrivateKey();
    fs.writeFileSync(keyPath, JSON.stringify({ privateKey }, null, 2), 'utf8');
    console.log("Generated fresh deployer key and saved to:", keyPath);
  }

  const account = createAccount(privateKey);
  console.log("Deployer account address:", account.address);

  const client = createClient({
    chain: chains.studionet,
    account: account,
  });

  // Read contracts
  const consensusLintPath = path.join(__dirname, '../../contracts/ConsensusLint.py');
  const consensusLintCode = fs.readFileSync(consensusLintPath, 'utf8');
  const consensusLintSha256 = crypto.createHash('sha256').update(consensusLintCode, 'utf8').digest('hex');

  const hygieneBadgesPath = path.join(__dirname, '../../contracts/HygieneBadges.py');
  const hygieneBadgesCode = fs.readFileSync(hygieneBadgesPath, 'utf8');
  const hygieneBadgesSha256 = crypto.createHash('sha256').update(hygieneBadgesCode, 'utf8').digest('hex');

  console.log("\nConsensusLint.py SHA-256:", consensusLintSha256);
  console.log("HygieneBadges.py SHA-256:", hygieneBadgesSha256);

  // 1. Deploy ConsensusLint
  console.log("\n[1/3] Deploying ConsensusLint.py...");
  const t0 = Date.now();
  const lintDeployTxHash = await client.deployContract({
    code: consensusLintCode,
    args: [],
  });
  console.log("Deploy Tx Hash:", lintDeployTxHash);
  const lintDeployTx = await waitReceiptWithRetry(lintDeployTxHash);
  const lintElapsed = ((Date.now() - t0) / 1000).toFixed(2);
  const lintAgreement = calculateAgreement(lintDeployTx);
  const lintAddress = lintDeployTx.recipient;
  console.log(`ConsensusLint deployed in ${lintElapsed}s. Status: ${lintDeployTx.status}, Address: ${lintAddress}, Agreement: ${lintAgreement.str}`);

  // 2. Deploy HygieneBadges
  console.log("\n[2/3] Deploying HygieneBadges.py...");
  const t1 = Date.now();
  const badgesDeployTxHash = await client.deployContract({
    code: hygieneBadgesCode,
    args: [],
  });
  console.log("Deploy Tx Hash:", badgesDeployTxHash);
  const badgesDeployTx = await waitReceiptWithRetry(badgesDeployTxHash);
  const badgesElapsed = ((Date.now() - t1) / 1000).toFixed(2);
  const badgesAgreement = calculateAgreement(badgesDeployTx);
  const badgesAddress = badgesDeployTx.recipient;
  console.log(`HygieneBadges deployed in ${badgesElapsed}s. Status: ${badgesDeployTx.status}, Address: ${badgesAddress}, Agreement: ${badgesAgreement.str}`);

  // 3. Connect HygieneBadges to ConsensusLint via set_ledger
  console.log("\n[3/3] Setting ledger address on HygieneBadges...");
  const t2 = Date.now();
  const setLedgerTxHash = await client.writeContract({
    address: badgesAddress,
    functionName: 'set_ledger',
    args: [lintAddress],
  });
  console.log("set_ledger Tx Hash:", setLedgerTxHash);
  const setLedgerTx = await waitReceiptWithRetry(setLedgerTxHash);
  const setLedgerElapsed = ((Date.now() - t2) / 1000).toFixed(2);
  const setLedgerAgreement = calculateAgreement(setLedgerTx);
  console.log(`set_ledger confirmed in ${setLedgerElapsed}s. Status: ${setLedgerTx.status}, Agreement: ${setLedgerAgreement.str}`);

  // Verification read
  console.log("\nVerifying contract wiring...");
  const configuredLedger = await client.readContract({
    address: badgesAddress,
    functionName: 'get_ledger_address',
    args: [],
  });
  console.log("HygieneBadges.get_ledger_address():", configuredLedger);
  if (configuredLedger.toLowerCase() !== lintAddress.toLowerCase()) {
    throw new Error(`Ledger address mismatch: expected ${lintAddress.toLowerCase()}, got ${configuredLedger.toLowerCase()}`);
  }

  const badgesOwner = await client.readContract({
    address: badgesAddress,
    functionName: 'get_owner',
    args: [],
  });
  console.log("HygieneBadges.get_owner():", badgesOwner);
  if (badgesOwner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(`Owner address mismatch: expected ${account.address.toLowerCase()}, got ${badgesOwner.toLowerCase()}`);
  }

  // Verify SHA-256 on-chain via eth_getTransactionByHash contract_code base64 decode
  console.log("\nVerifying on-chain contract code SHA-256 matches disk source...");
  async function verifyOnchainSha256(txHash, expectedSha, name) {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [txHash],
      }),
    });
    const json = await res.json();
    const codeB64 = json.result?.data?.contract_code;
    if (!codeB64) {
      throw new Error(`Failed to retrieve contract_code for ${name} from tx ${txHash}`);
    }
    const code = Buffer.from(codeB64, 'base64').toString('utf8');
    const actualSha = crypto.createHash('sha256').update(code, 'utf8').digest('hex');
    if (actualSha !== expectedSha) {
      throw new Error(`SHA256 mismatch for ${name}: expected ${expectedSha}, got ${actualSha}`);
    }
    console.log(`[PASS] ${name} on-chain source SHA-256 verified: ${actualSha}`);
    return actualSha;
  }

  await verifyOnchainSha256(lintDeployTxHash, consensusLintSha256, "ConsensusLint");
  await verifyOnchainSha256(badgesDeployTxHash, hygieneBadgesSha256, "HygieneBadges");

  const deployments = {
    network: "GenLayer Studionet (Preview)",
    chainId: 61999,
    rpc: RPC_URL,
    deployer: account.address.toLowerCase(),
    deployedAt: new Date().toISOString(),
    contracts: {
      ConsensusLint: {
        address: lintAddress,
        deployTxHash: lintDeployTxHash,
        sourceSha256: consensusLintSha256,
        status: lintDeployTx.status,
        agreement: lintAgreement.str,
        elapsedSeconds: parseFloat(lintElapsed),
      },
      HygieneBadges: {
        address: badgesAddress,
        deployTxHash: badgesDeployTxHash,
        sourceSha256: hygieneBadgesSha256,
        status: badgesDeployTx.status,
        agreement: badgesAgreement.str,
        elapsedSeconds: parseFloat(badgesElapsed),
        ledgerAddress: configuredLedger.toLowerCase(),
        setLedgerTxHash: setLedgerTxHash,
        setLedgerAgreement: setLedgerAgreement.str,
        setLedgerElapsedSeconds: parseFloat(setLedgerElapsed),
      },
      Probe: {
        address: "0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6",
        deployTxHash: "0xf00fa3b5d292ddf1e77aee476a82d8993a41f75f8cd2205cd0955b5e315a76f8",
        status: "superseded diagnostic probe",
        role: "Phase 0 runtime probe contract",
      }
    },
    superseded: [
      {
        name: "ConsensusLint (v1.0.0)",
        address: "0xE2cBaf1916Df7C742486B2eC4E5d3A3289115F2D",
        deployTxHash: "0x0f93a3a8679b5ed4e3e7c7acbf848b219834481a91a636e2006d0e3955c1faed",
        sourceSha256: "04337cfc91fe45f76042dba860adf4d9f1567e68fabb525838fa7dffaf4d313b",
        status: "superseded by v1.0.1",
        agreement: "3/5"
      },
      {
        name: "HygieneBadges (v1.0.0)",
        address: "0x3CA9E1b7804b442eaA932ae190d494D4A59295bF",
        deployTxHash: "0xeef694c69810f8b4f0c16667bffc0b5784d4302617e2136fd7fadf993fd6c609",
        sourceSha256: "64181bc3a3965e9427039a8dec504f0c25aeb4e7e9186b54ba426aadb5bb48b8",
        status: "superseded by v1.0.1",
        agreement: "3/5"
      },
      {
        name: "Probe",
        address: "0xCAF2c7cdBD0a6EB4154b763c9fA869407CcCb7b6",
        deployTxHash: "0xf00fa3b5d292ddf1e77aee476a82d8993a41f75f8cd2205cd0955b5e315a76f8",
        status: "superseded diagnostic probe",
        role: "Phase 0 runtime probe contract"
      }
    ]
  };

  const deploymentsPath = path.join(__dirname, 'deployments.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2), 'utf8');
  console.log("\nDeployments saved to:", deploymentsPath);
  console.log("\nALL CONTRACTS SUCCESSFULLY DEPLOYED AND WIRED!");
}

main().catch(err => {
  console.error("FATAL ERROR in deploy script:", err);
  process.exit(1);
});
