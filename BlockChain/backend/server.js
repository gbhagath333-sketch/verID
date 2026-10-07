require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const { ethers } = require("ethers");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x3E1FFce6eE152454A0c50BC21f78d5F607D8421B";

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "string", name: "documentHash", type: "string" }
    ],
    name: "registerRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "string", name: "documentHash", type: "string" }
    ],
    name: "verifyRecord",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "recordId", type: "string" }],
    name: "getRecord",
    outputs: [
      { internalType: "string", name: "", type: "string" },
      { internalType: "string", name: "", type: "string" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "bool", name: "", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

if (!RPC_URL || !PRIVATE_KEY) {
  throw new Error("Missing SEPOLIA_RPC_URL or DEPLOYER_PRIVATE_KEY in .env");
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    network: "Ethereum Sepolia"
  });
});

app.post("/api/register", upload.single("certificate"), async (req, res) => {
  try {
    const { studentName } = req.body;

    if (!studentName || !req.file) {
      return res.status(400).json({
        error: "Student name and certificate are required."
      });
    }

    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const recordId =
      `VERID-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const tx = await contract.registerRecord(recordId, hash);
    await tx.wait();

    res.json({
      success: true,
      recordId,
      studentName,
      documentHash: hash,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to register certificate on blockchain."
    });
  }
});

app.post("/api/verify", upload.single("certificate"), async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId || !req.file) {
      return res.status(400).json({
        error: "Record ID and certificate are required."
      });
    }

    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const verified = await contract.verifyRecord(recordId, hash);

    let record = null;

    if (verified) {
      const data = await contract.getRecord(recordId);

      record = {
        recordId: data[0],
        documentHash: data[1],
        issuer: data[2],
        timestamp: Number(data[3])
      };
    }

    res.json({
      verified,
      record
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Verification failed."
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`VerID backend running on port ${PORT}`);
});

