import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ethers } from "ethers";

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║        VerID — LIVE SEPOLIA TAMPER-PROOF VERIFICATION              ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝\n");

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl) throw new Error("SEPOLIA_RPC_URL is missing from .env");
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY is missing from .env");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();

  if (Number(network.chainId) !== 11155111) {
    throw new Error(`Wrong network. Expected Sepolia, got ${network.chainId}`);
  }

  const artifactPath = path.resolve(
    "artifacts/contracts/RecordVerification.sol/RecordVerification.json"
  );

  const deploymentPath = path.resolve("deployment-info.json");

  if (!fs.existsSync(artifactPath)) {
    throw new Error("Contract artifact not found.");
  }

  if (!fs.existsSync(deploymentPath)) {
    throw new Error("deployment-info.json not found.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const contractAddress = deployment.contractAddress;

  console.log(`[+] Connected to Ethereum Sepolia`);
  console.log(`[+] Contract: ${contractAddress}`);
  console.log(`[+] Issuer Wallet: ${await signer.getAddress()}\n`);

  const contract = new ethers.Contract(
    contractAddress,
    artifact.abi,
    signer
  );

  const originalCertificate =
`==============================================
         OFFICIAL UNIVERSITY DEGREE
==============================================
Recipient:       VerID Demo Student
Degree:          B.S. in Computer Science & AI
Honors:          Magna Cum Laude
GPA:             3.85 / 4.00
Graduation Date: October 7, 2026
Accreditation:   VerID Demo Authority
==============================================`;

  const recordId = `VERID-DEMO-${Date.now()}`;
  const originalHash = sha256(originalCertificate);

  console.log("[1] 📄 ORIGINAL DOCUMENT");
  console.log(`    Record ID:    ${recordId}`);
  console.log(`    SHA-256:      ${originalHash}\n`);

  console.log("[2] ⛓️  REGISTERING HASH ON SEPOLIA...");

  const tx = await contract.registerRecord(recordId, originalHash);
  console.log(`    Transaction: ${tx.hash}`);

  await tx.wait();

  console.log("    ✅ Record permanently registered on Sepolia.\n");

  console.log("──────────────────────────────────────────────────────────────────────");
  console.log("   TEST A — GENUINE DOCUMENT");
  console.log("──────────────────────────────────────────────────────────────────────");

  const genuineHash = sha256(originalCertificate);
  const genuineResult = await contract.verifyRecord(
    recordId,
    genuineHash
  );

  console.log(`    Submitted Hash: ${genuineHash}`);
  console.log(`    Verification:   ${genuineResult}`);

  if (genuineResult) {
    console.log("    ✅ AUTHENTIC — DOCUMENT MATCHES BLOCKCHAIN RECORD\n");
  } else {
    console.log("    ❌ ERROR — AUTHENTIC DOCUMENT REJECTED\n");
  }

  console.log("──────────────────────────────────────────────────────────────────────");
  console.log("   TEST B — TAMPERED DOCUMENT");
  console.log("──────────────────────────────────────────────────────────────────────");

  const tamperedCertificate = originalCertificate.replace(
    "GPA:             3.85 / 4.00",
    "GPA:             4.00 / 4.00"
  );

  const tamperedHash = sha256(tamperedCertificate);

  const tamperedResult = await contract.verifyRecord(
    recordId,
    tamperedHash
  );

  console.log(`    Original Hash: ${originalHash}`);
  console.log(`    Tampered Hash: ${tamperedHash}`);
  console.log(`    Verification:  ${tamperedResult}`);

  if (!tamperedResult) {
    console.log("    🚨 TAMPER DETECTED — DOCUMENT REJECTED\n");
  } else {
    console.log("    ❌ ERROR — TAMPERED DOCUMENT ACCEPTED\n");
  }

  console.log("══════════════════════════════════════════════════════════════════════");
  console.log("                    🎯 VERID DEMO COMPLETE");
  console.log("══════════════════════════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("\n❌ Demo failed:", error);
  process.exitCode = 1;
});
