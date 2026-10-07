# VerID — API & Architecture Contract
> **Project:** Blockchain-Based Tamper-Proof Record Verification  
> **Repository Scope:** Shared Integration Specification for Frontend, Backend, and Blockchain  
> **Target Deployment:** Local Node / Testnet / Vercel / Cloud

---

## 1. Executive Architecture & Core Rules

```
                      ┌──────────────────────────────────────────────────────────┐
                      │                 USER / CLIENT UPLOAD                     │
                      │  Supports: PDF, PNG, JPG, DOCX, XLSX, TXT, etc.          │
                      └────────────────────────────┬─────────────────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │      GENERATE SHA-256 HASH           │
                                │   (64-character lowercase hex)       │
                                └──────────────────┬───────────────────┘
                                                   │
                          ┌────────────────────────┴────────────────────────┐
                          ▼                                                 ▼
             [ ISSUANCE / REGISTRATION ]                        [ VERIFICATION FLOW ]
                          │                                                 │
                          ▼                                                 ▼
          Store hash on Smart Contract                      Query hash from Smart Contract
        registerRecord(recordId, hash)                     verifyRecord(recordId, uploadHash)
                          │                                                 │
                          ▼                                                 ▼
       Generate Proof & QR Code Link                    COMPARE HASHES:
       https://<app>/verify?recordId=...                • MATCH    -> "AUTHENTIC / UNTAMPERED"
                                                        • MISMATCH -> "TAMPERED"
```

### ⚠️ Strict Hackathon Rules (Non-Negotiable)
1. **Zero Files On-Chain**: The raw file (PDF/Image/DOC) is **NEVER** stored on the blockchain or sent to smart contract transactions.
2. **Only 32-Byte Hashes**: Only the 64-character hexadecimal SHA-256 digest and metadata (`recordId`, `issuer`, `timestamp`) are stored on-chain.
3. **Format Agnostic**: Any file format can be verified. The system hashes raw file bytes.

---

## 2. Smart Contract Reference (`RecordVerification`)

- **Solidity File:** `BlockChain/contracts/RecordVerification.sol`
- **Compiler Version:** `0.8.34`
- **Deployment Manifest & ABI:** `BlockChain/deployment-info.json`
- **Default Local Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Local Network RPC:** `http://127.0.0.1:8545` (Chain ID: `31337`)

### Smart Contract Methods

| Function | Type | Inputs | Returns | Behavior / Reverts |
| :--- | :--- | :--- | :--- | :--- |
| `registerRecord` | State Change (Write) | `string recordId`, `string documentHash` | `void` | Reverts if `recordId` is empty or already registered (`"Record already exists"`). Emits `RecordRegistered` event. |
| `verifyRecord` | View (Read-Only, 0 Gas) | `string recordId`, `string documentHash` | `bool` | Returns `true` if record exists and hash matches (**AUTHENTIC**). Returns `false` if hash differs (**TAMPERED**) or record not found. |
| `getRecord` | View (Read-Only, 0 Gas) | `string recordId` | `(string, string, address, uint256, bool)` | Returns `(recordId, documentHash, issuer, timestamp, exists)`. |

### Smart Contract Event
```solidity
event RecordRegistered(
    string recordId,
    string documentHash,
    address indexed issuer,
    uint256 timestamp
);
```

---

## 3. Backend REST API Specification

If your backend is built in Node.js / Express / Fastify / Python, implement the following endpoints:

### Endpoint 1: Register Document Record
* **Route:** `POST /api/records/register`
* **Content-Type:** `multipart/form-data` (upload file) OR `application/json` (pre-computed hash)
* **Request Body (JSON option):**
```json
{
  "recordId": "CERT-STANFORD-2026-001",
  "documentHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "metadata": {
    "title": "B.S. Computer Science Diploma",
    "recipient": "Harpreet Singh"
  }
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "recordId": "CERT-STANFORD-2026-001",
  "documentHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "transactionHash": "0x3078a4db025304de4448692e4efe2d2664651741b7810ddd0eebba24253f9e91",
  "issuerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": 1728281527,
  "verificationUrl": "https://verid.vercel.app/verify?recordId=CERT-STANFORD-2026-001",
  "qrPayload": "https://verid.vercel.app/verify?recordId=CERT-STANFORD-2026-001"
}
```
* **Error Response (`400 Bad Request` or `409 Conflict`):**
```json
{
  "success": false,
  "error": "Record ID already exists on the blockchain."
}
```

---

### Endpoint 2: Verify Document Record
* **Route:** `POST /api/records/verify`
* **Content-Type:** `multipart/form-data` OR `application/json`
* **Request Body (JSON option):**
```json
{
  "recordId": "CERT-STANFORD-2026-001",
  "documentHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a"
}
```
* **Success Response — Authentic (`200 OK`):**
```json
{
  "recordId": "CERT-STANFORD-2026-001",
  "isAuthentic": true,
  "status": "AUTHENTIC / UNTAMPERED",
  "uploadedHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "blockchainHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "issuerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": 1728281527,
  "formattedDate": "Wed, 07 Oct 2026 06:12:08 GMT"
}
```
* **Success Response — Tampered (`200 OK`):**
```json
{
  "recordId": "CERT-STANFORD-2026-001",
  "isAuthentic": false,
  "status": "TAMPERED",
  "uploadedHash": "900520b3d6de1ba051f70f3be4fd71c933a2d962faef88971cdda33ee0e70dd6",
  "blockchainHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "issuerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": 1728281527
}
```
* **Error Response — Not Found (`404 Not Found`):**
```json
{
  "recordId": "UNKNOWN-ID",
  "isAuthentic": false,
  "status": "RECORD_NOT_FOUND",
  "error": "No record exists for the provided Record ID."
}
```

---

### Endpoint 3: Get Record Metadata
* **Route:** `GET /api/records/:recordId`
* **Response (`200 OK`):**
```json
{
  "recordId": "CERT-STANFORD-2026-001",
  "documentHash": "6b06e869deac4d31cf9be929f2f5455965782a5de0f18e27188d3e9e73fcaf9a",
  "issuer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": 1728281527,
  "exists": true
}
```

---

## 4. Copy-Paste Code Snippet for Backend Team (Node.js + ethers.js)

Here is a ready-to-use service module the backend person can save into `backend/blockchainService.js`:

```javascript
import { ethers } from "ethers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// 1. Load deployment metadata exported by the Blockchain layer
const deploymentPath = path.resolve("../BlockChain/deployment-info.json");
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

// 2. Setup Provider and Signer (Local node by default, or Testnet RPC)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
const signer = process.env.PRIVATE_KEY 
  ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  : await provider.getSigner(0); // Uses first pre-funded Hardhat account

// 3. Connect to Smart Contract
const contract = new ethers.Contract(deployment.contractAddress, deployment.abi, signer);

/**
 * Calculates SHA-256 hash of a file buffer
 */
export function calculateSHA256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Registers document hash on blockchain
 */
export async function registerOnChain(recordId, documentHash) {
  const tx = await contract.registerRecord(recordId, documentHash);
  const receipt = await tx.wait();
  return {
    recordId,
    documentHash,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    issuer: await signer.getAddress(),
  };
}

/**
 * Verifies document hash against blockchain
 */
export async function verifyOnChain(recordId, documentHash) {
  const isAuthentic = await contract.verifyRecord(recordId, documentHash);
  const [storedId, storedHash, issuer, timestamp, exists] = await contract.getRecord(recordId);

  return {
    recordId,
    exists,
    isAuthentic,
    status: !exists ? "NOT_FOUND" : isAuthentic ? "AUTHENTIC / UNTAMPERED" : "TAMPERED",
    blockchainHash: storedHash,
    submittedHash: documentHash,
    issuer,
    timestamp: Number(timestamp),
  };
}
```

---

## 5. Copy-Paste Code Snippet for Frontend Team (Client-Side Hashing)

If the frontend calculates the hash directly in the browser (no file uploads to server needed!):

```javascript
// Browser Web Crypto API (supported natively in all modern browsers)
export async function computeBrowserSHA256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

### QR Code Format
The QR code should encode a direct link to the verification page:
```text
https://<YOUR_DEPLOYED_FRONTEND_DOMAIN>/verify?recordId=CERT-STANFORD-2026-001
```
When opened, the frontend automatically:
1. Reads `recordId` from the URL parameter `?recordId=...`.
2. Queries the blockchain metadata (`GET /api/records/:recordId`).
3. Prompts the user to drop the file to verify authenticity.

---

## 6. How to Run the Blockchain Locally

When testing the whole stack:

```bash
# In BlockChain/ directory:
1. npm run node      # (Starts local blockchain node on 127.0.0.1:8545)
2. npm run deploy    # (Deploys contract & updates deployment-info.json)
3. npm test          # (Runs 6 automated unit tests)
4. npm run demo      # (Runs live terminal tamper forensic simulation)
```

