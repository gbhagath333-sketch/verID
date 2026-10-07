import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { artifacts, network } from "hardhat";
import { ethers } from "ethers";

describe("VerID - RecordVerification Smart Contract", async () => {
  async function deployFixture() {
    const net = await network.connect();
    const provider = new ethers.BrowserProvider(net.provider);
    const [issuer, verifier, hacker] = await Promise.all([
      provider.getSigner(0),
      provider.getSigner(1),
      provider.getSigner(2),
    ]);

    const artifact = await artifacts.readArtifact("RecordVerification");
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, issuer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    return { contract, issuer, verifier, hacker, provider };
  }

  it("1. Should deploy the contract successfully with a valid address", async () => {
    const { contract } = await deployFixture();
    const address = await contract.getAddress();
    assert.match(address, /^0x[a-fA-F0-9]{40}$/);
    console.log("   ✔ Contract deployed at:", address);
  });

  it("2. Should register a new document record and store issuer & timestamp", async () => {
    const { contract, issuer } = await deployFixture();
    const recordId = "CERT-STANFORD-2026-001";
    // Simulated SHA-256 hash of a diploma
    const originalDocHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const tx = await contract.registerRecord(recordId, originalDocHash);
    const receipt = await tx.wait();
    assert.equal(receipt.status, 1, "Transaction should be confirmed");

    // Fetch the record back from blockchain
    const [storedId, storedHash, storedIssuer, storedTimestamp, exists] =
      await contract.getRecord(recordId);

    assert.equal(storedId, recordId);
    assert.equal(storedHash, originalDocHash);
    assert.equal(storedIssuer, await issuer.getAddress());
    assert.equal(exists, true);
    assert.ok(storedTimestamp > 0n, "Timestamp should be non-zero");

    console.log("   ✔ Record stored successfully by issuer:", storedIssuer);
  });

  it("3. Should prevent duplicate record IDs", async () => {
    const { contract } = await deployFixture();
    const recordId = "CERT-DUPLICATE-TEST";
    const hash1 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const hash2 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    await contract.registerRecord(recordId, hash1);

    await assert.rejects(
      async () => {
        await contract.registerRecord(recordId, hash2);
      },
      /Record already exists/,
      "Contract must revert with 'Record already exists'"
    );

    console.log("   ✔ Duplicate registration prevented successfully");
  });

  it("4. Should verify an AUTHENTIC / UNTAMPERED document correctly", async () => {
    const { contract } = await deployFixture();
    const recordId = "DEGREE-HARPREET-2026";
    const genuineHash = "5f4dcc3b5aa765d61d8327deb882cf992b95ecd5e8d641121d5a7b6b8b0e8c61";

    await contract.registerRecord(recordId, genuineHash);

    // Verify with exact same hash
    const isAuthentic = await contract.verifyRecord(recordId, genuineHash);
    assert.equal(isAuthentic, true, "Untampered document must verify as authentic");

    console.log("   ✔ Verification result: AUTHENTIC / UNTAMPERED (true)");
  });

  it("5. Should detect a TAMPERED document and return false", async () => {
    const { contract } = await deployFixture();
    const recordId = "DEGREE-HARPREET-2026";
    const genuineHash = "5f4dcc3b5aa765d61d8327deb882cf992b95ecd5e8d641121d5a7b6b8b0e8c61";
    // Tampered hash (simulating a forged grade or modified name)
    const forgedHash = "9b73c6ce6f7e52ab459dd3ff0d3eee2a4e3d271f939b6b139600f4585e3be9ee";

    await contract.registerRecord(recordId, genuineHash);

    // Verify with tampered hash
    const isAuthentic = await contract.verifyRecord(recordId, forgedHash);
    assert.equal(isAuthentic, false, "Tampered document must fail verification");

    console.log("   ✔ Tamper detection result: TAMPERED (false)");
  });

  it("6. Should return false for a non-existent record ID without reverting", async () => {
    const { contract } = await deployFixture();
    const nonExistentId = "GHOST-RECORD-9999";
    const randomHash = "1111111111111111111111111111111111111111111111111111111111111111";

    const isAuthentic = await contract.verifyRecord(nonExistentId, randomHash);
    assert.equal(isAuthentic, false);

    const [, , , , exists] = await contract.getRecord(nonExistentId);
    assert.equal(exists, false);

    console.log("   ✔ Non-existent record handled cleanly (returns false)");
  });
});
