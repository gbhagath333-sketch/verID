# 🔐 Blockchain-Based Tamper-Proof Record Verification

A secure and educational document verification system that uses **SHA-256 cryptographic hashing and a custom blockchain implementation** to detect unauthorized modifications to digital documents.

## 📌 Overview

Digital documents such as academic certificates, mark sheets, internship certificates, training certificates, agreements, and official records are increasingly shared and stored electronically. However, once a digital document is downloaded or transferred, it can potentially be modified without an obvious indication that its contents have changed.

**Blockchain-Based Tamper-Proof Record Verification** addresses this problem by creating a unique cryptographic fingerprint for every registered document using the **SHA-256 hashing algorithm**. This fingerprint is stored inside a blockchain block along with essential document metadata. Because every block is linked to the previous block through cryptographic hashes, unauthorized modifications can be detected immediately.

The system does not store the complete document inside the blockchain. Instead, it stores the document's SHA-256 hash, which acts as its digital fingerprint. When a document is uploaded for verification, its hash is calculated again and compared with the hash stored in the blockchain.

If both hashes match and the blockchain itself is valid, the document is considered authentic.

---

## 🎯 Problem Statement

Digital certificates and records can be copied, edited, or manipulated using commonly available software. Traditional file systems generally do not provide a reliable mechanism for proving that a document is exactly the same as the originally issued version.

For example, a student may receive a certificate showing a score of **87**, but someone could modify the document and change the score to **97**. Visually, the modified document may look completely legitimate.

There is therefore a need for a simple system that can detect whether a digital document has been modified after it was originally registered.

---

## 💡 Proposed Solution

This project combines **file hashing and blockchain technology** to provide tamper detection.

When a document is registered:

```text
Document
   ↓
Raw File Bytes
   ↓
SHA-256
   ↓
Unique Document Hash
   ↓
Blockchain Block
```

During verification:

```text
Uploaded Document
   ↓
SHA-256
   ↓
Compare With Registered Hash
   ↓
Blockchain Validation
   ↓
Verified / Tampered / Not Registered
```

Even a very small modification to a file changes its SHA-256 hash. Therefore, the system can determine whether the uploaded file is byte-for-byte identical to the originally registered document.

---

## ⛓️ How the Blockchain Works

The project implements a simplified blockchain from scratch using Python.

Each block contains:

- Block index
- Timestamp
- Document ID
- Filename
- File type
- File size
- Document SHA-256 hash
- Previous block hash
- Current block hash

The first block is called the **Genesis Block**.

Every subsequent block stores the hash of the previous block:

```text
Block 0
   ↓
Block 1
   ↓
Block 2
   ↓
Block 3
```

For example:

```text
Block 2 previous_hash
        =
Block 1 hash
```

If someone changes the contents of Block 1, its hash changes. Block 2 still contains the old hash of Block 1, causing the chain validation to fail.

This demonstrates the fundamental concept of blockchain immutability.

---

## 🔑 SHA-256 Document Fingerprinting

SHA-256 is a cryptographic hash function that generates a fixed-length **256-bit hash** from input data.

For example:

```text
Original Document
       ↓
SHA-256
       ↓
9f86d081884c7d659a2feaa0c55ad015...
```

If even a small part of the document changes:

```text
Modified Document
       ↓
SHA-256
       ↓
4a7d1ed414474e4033ac29ccb8653d9b...
```

The resulting hashes will be completely different.

The system therefore does not need to understand the contents of every document. It simply compares their cryptographic fingerprints.

---

## 📂 Supported Documents

The application supports common file formats including:

- PDF
- DOC
- DOCX
- TXT
- JSON
- CSV
- JPG
- JPEG
- PNG

The core hashing mechanism is file-format independent because it operates directly on the raw bytes of the uploaded file.

---

## ✨ Key Features

### 📤 Document Registration

Users can upload a document and register it on the blockchain. The system calculates its SHA-256 hash and creates a blockchain record containing the document's cryptographic fingerprint.

### 🔍 Document Verification

Users can upload a document at any later time to check whether it matches the registered version.

### 🛡️ Tamper Detection

If a registered document is modified, its SHA-256 hash changes and the system reports:

**❌ DOCUMENT TAMPERED**

### ⛓️ Blockchain Validation

The application verifies the integrity of every block and checks whether all previous-hash relationships remain valid.

### 📊 Blockchain Explorer

Users can visually inspect blocks, document hashes, previous hashes, timestamps, and validation status.

### 📥 Original Document Download

Registered documents can be downloaded when local storage is being used.

### 🔄 Blockchain Reset

The educational demo can be reset to its initial state for repeated demonstrations.

---

## 🧪 Live Tamper Demonstration

The project includes a demonstration specifically designed for presentations and judging.

### Step 1 — Register

Upload an original certificate or mark sheet.

The system generates its SHA-256 hash and creates a blockchain block.

### Step 2 — Verify

Upload the same original file.

The system displays:

```text
✓ DOCUMENT VERIFIED
```

because the hashes match.

### Step 3 — Modify

Change something in the document, such as a mark from:

```text
87 → 97
```

Save the modified file.

### Step 4 — Verify Again

Upload the modified document.

The system calculates a different SHA-256 hash and displays:

```text
✗ DOCUMENT TAMPERED

Original Hash ≠ Uploaded Hash
```

### Step 5 — Demonstrate Blockchain Tampering

The application also allows an authorized educational demo user to modify block data directly.

After modification, blockchain validation produces:

```text
✗ BLOCKCHAIN INTEGRITY COMPROMISED
```

The application identifies the affected block and broken hash relationship.

---

## 🏗️ Technology Stack

**Backend**
- Python
- Flask
- hashlib

**Frontend**
- HTML5
- CSS3
- JavaScript

**Security**
- SHA-256
- Cryptographic hash linking
- Secure file handling

**Deployment**
- GitHub
- Vercel-compatible architecture

---

## 📁 Project Structure

```text
blockchain-document-verifier/
│
├── app.py
├── blockchain.py
├── document_manager.py
├── requirements.txt
├── README.md
├── LICENSE
├── .gitignore
├── vercel.json
│
├── uploads/
│   └── .gitkeep
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
│
└── screenshots/
    └── .gitkeep
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd blockchain-document-verifier
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
python app.py
```

Open the application in your browser:

```text
http://127.0.0.1:5000
```

---

## 🔌 API Endpoints

The application provides REST-style endpoints including:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Main application |
| GET | `/api/chain` | Get blockchain |
| GET | `/api/validate` | Validate blockchain |
| GET | `/api/documents` | List documents |
| POST | `/api/documents/register` | Register document |
| POST | `/api/documents/verify` | Verify document |
| GET | `/api/documents/<id>` | Get document details |
| GET | `/api/documents/<id>/download` | Download document |
| POST | `/api/tamper` | Demonstrate blockchain tampering |
| POST | `/api/reset` | Reset demo |

---

## 🔐 Security Model

The system uses two independent integrity checks.

### Layer 1 — Document Integrity

```text
Uploaded File Hash
        ↓
Registered File Hash
        ↓
MATCH / MISMATCH
```

### Layer 2 — Blockchain Integrity

```text
Block Data
   ↓
Recalculate Hash
   ↓
Compare With Stored Hash
   ↓
Validate Previous Hash
```

A document is considered verified only when both layers are valid.

---

## 🚀 Future Enhancements

The prototype can be expanded with:

- Database persistence
- User authentication
- Digital signatures
- QR-code certificate verification
- Institution-issued certificates
- Public/private key cryptography
- Distributed blockchain nodes
- Smart contracts
- Ethereum or Polygon integration
- IPFS-based document storage
- Cloud object storage
- Decentralized identity
- Mobile verification application

---

## ⚠️ Limitations

This project is an **educational blockchain prototype**.

It currently does not implement a decentralized network, consensus mechanism, proof of work, digital signatures, or production-grade identity management.

The prototype may use in-memory blockchain data and local file storage during development. For a production deployment, persistent databases and secure cloud object storage should be used.

The blockchain stores document fingerprints rather than complete documents.

---

## 🎓 Learning Outcomes

This project demonstrates practical understanding of:

- Blockchain fundamentals
- SHA-256 hashing
- Cryptographic fingerprints
- Block structure
- Hash linking
- Immutability
- Tamper detection
- File handling
- REST APIs
- Flask
- Frontend-backend integration
- Git and GitHub
- Cloud deployment concepts

---

## 📜 Conclusion

**Blockchain-Based Tamper-Proof Record Verification** demonstrates how blockchain concepts can be applied to a practical digital document verification problem.

Instead of relying only on the appearance of a document, the system creates a cryptographic fingerprint using SHA-256 and records that fingerprint inside a linked blockchain. When the document is presented again, the system recalculates its fingerprint and compares it with the registered value.

A genuine document produces the same hash, while even a small modification produces a completely different hash. At the same time, blockchain hash linking makes unauthorized modification of stored records detectable.

The project therefore provides a simple and visual demonstration of how **cryptographic hashing + blockchain + document verification** can work together to improve digital record integrity.

> **Note:** This project is intended for educational and demonstration purposes. It should not be considered a production-grade certificate authority or secure document management platform without additional authentication, authorization, persistent storage, digital signatures, and distributed consensus.
