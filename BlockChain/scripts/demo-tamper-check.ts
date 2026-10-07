import crypto from "node:crypto";
import { artifacts, network } from "hardhat";
import { ethers } from "ethers";

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function runForensicDemo() {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║     VerID: BLOCKCHAIN TAMPER-PROOF VERIFICATION FORENSIC SIMULATOR            ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════════╝\n");

  // 1. Connect and Deploy Contract
  const net = await network.connect();
  const provider = new ethers.BrowserProvider(net.provider);
  const universityIssuer = await provider.getSigner(0);
  const employerVerifier = await provider.getSigner(1);

  const artifact = await artifacts.readArtifact("RecordVerification");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, universityIssuer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`[1] 🏛️ Smart Contract Deployed: ${contractAddress}`);
  console.log(`    Issuer Authority Address:    ${await universityIssuer.getAddress()}\n`);

  // 2. Original Credential
  const originalCertificate = 
`==============================================
         OFFICIAL UNIVERSITY DEGREE
==============================================
Recipient:       Harpreet Singh
Degree:          B.S. in Computer Science & AI
Honors:          Magna Cum Laude
GPA:             3.85 / 4.00
Graduation Date: October 7, 2026
Accreditation:   AB-ET Certified
==============================================`;

  const recordId = "CERT-STANFORD-2026-9812";
  const originalHash = sha256(originalCertificate);

  console.log("[2] 📄 Generating Original Certificate Fingerprint:");
  console.log(`    Record ID:     ${recordId}`);
  console.log(`    SHA-256 Hash:  ${originalHash}`);
  console.log("    (Notice: The actual text/PDF is NEVER sent to the blockchain - only this 64-char hash)\n");

  // 3. Register on Blockchain
  console.log("[3] ⛓️  Registering Document Fingerprint on Blockchain...");
  const tx = await contract.connect(universityIssuer).registerRecord(recordId, originalHash);
  const receipt = await tx.wait();
  console.log(`    ✔ Block mined! Tx Hash: ${receipt?.hash}`);

  const [, , storedIssuer, storedTime, exists] = await contract.getRecord(recordId);
  const formattedDate = new Date(Number(storedTime) * 1000).toUTCString();
  console.log(`    ✔ Verified on-chain record: Issuer=${storedIssuer}, Timestamp=${formattedDate}\n`);

  // 4. Test Scenario A: Authentic Verification
  console.log("───────────────────────────────────────────────────────────────────────────────");
  console.log("   TEST A: Employer/Verifier tests the GENUINE Document");
  console.log("───────────────────────────────────────────────────────────────────────────────");
  const testAHash = sha256(originalCertificate);
  const resultA = await contract.connect(employerVerifier).verifyRecord(recordId, testAHash);

  console.log(`  Supplied Document Hash: ${testAHash}`);
  console.log(`  Blockchain Stored Hash: ${originalHash}`);
  if (resultA) {
    console.log("  >>> RESULT: \x1b[32m✔ [AUTHENTIC / UNTAMPERED]\x1b[0m");
    console.log("  Verification Verdict: Document is 100% genuine and matches institutional record.\n");
  } else {
    console.log("  >>> RESULT: \x1b[31m✖ [TAMPERED]\x1b[0m\n");
  }

  // 5. Test Scenario B: Tampered Document (1 tiny character changed)
  console.log("───────────────────────────────────────────────────────────────────────────────");
  console.log("   TEST B: Attacker forges the document (changes GPA from '3.85' to '4.00')");
  console.log("───────────────────────────────────────────────────────────────────────────────");
  const tamperedCertificate = originalCertificate.replace("GPA:             3.85 / 4.00", "GPA:             4.00 / 4.00");
  const tamperedHash = sha256(tamperedCertificate);

  console.log(`  Original Hash:  ${originalHash}`);
  console.log(`  Tampered Hash:  ${tamperedHash}`);
  console.log("  Notice the Avalanche Effect: Editing just 3 digits completely flipped the entire hash!");

  const resultB = await contract.connect(employerVerifier).verifyRecord(recordId, tamperedHash);
  if (resultB) {
    console.log("  >>> RESULT: \x1b[32m✔ [AUTHENTIC]\x1b[0m\n");
  } else {
    console.log("  >>> RESULT: \x1b[31m✖ [TAMPERED / FORGERY DETECTED]\x1b[0m");
    console.log("  Verification Verdict: Immediate cryptographic rejection! The document was altered after issuance.\n");
  }

  console.log("═══════════════════════════════════════════════════════════════════════════════");
  console.log("   💡 WHY THIS STANDS OUT TO HACKATHON JUDGES:");
  console.log("   1. Zero Storage Cost: Blockchain stores 32 bytes of hash, not heavy megabyte files.");
  console.log("   2. Complete Privacy: Sensitive document content stays strictly on the client.");
  console.log("   3. Mathematical Certainty: 1-character modification is 100% mathematically detectable.");
  console.log("   4. Non-Repudiation: Only the issuing wallet address can anchor the initial record.");
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");
}

runForensicDemo().catch(console.error);
