import { useState } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from "./blockchain/config";
import "./App.css";

async function sha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function App() {
  const [recordId, setRecordId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyDocument() {
    if (!recordId || !file) {
      setResult("error");
      setMessage("Please enter a Record ID and select a document.");
      return;
    }

    try {
      setLoading(true);
      setResult("");
      setMessage("");

      const hash = await sha256(file);

      const provider = new ethers.JsonRpcProvider(
        "https://ethereum-sepolia-rpc.publicnode.com"
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const verified = await contract.verifyRecord(recordId, hash);

      if (verified) {
        setResult("authentic");
        setMessage(
          "Document verified successfully. It matches the blockchain record."
        );
      } else {
        setResult("tampered");
        setMessage(
          "The document does not match the blockchain record."
        );
      }
    } catch (error) {
      console.error(error);
      setResult("error");
      setMessage(
        "Verification failed. Check the Record ID and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          Ver<span>ID</span>
        </div>

        <div className="network">
          ● Ethereum Sepolia
        </div>
      </nav>

      <section className="hero">
        <div className="badge">
          🔐 Blockchain-Powered Verification
        </div>

        <h1>
          Verify. <span>Trust.</span> Prove.
        </h1>

        <p>
          Verify the authenticity of digital records using cryptographic
          hashing and an immutable blockchain record.
        </p>

        <div className="card">
          <input
            className="input"
            type="text"
            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
          />

          <input
            className="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            className="verify"
            onClick={verifyDocument}
            disabled={loading}
          >
            {loading
              ? "Verifying on Blockchain..."
              : "Verify Document"}
          </button>

          {result && (
            <div className={`result ${result}`}>
              {result === "authentic" && "✅ AUTHENTIC"}
              {result === "tampered" && "🚨 TAMPER DETECTED"}
              {result === "error" && "⚠️ VERIFICATION ERROR"}

              <div style={{ marginTop: 8, fontWeight: 400 }}>
                {message}
              </div>
            </div>
          )}
        </div>

        <div className="footer">
          Powered by Ethereum Sepolia • SHA-256 • VerID
        </div>
      </section>
    </div>
  );
}

export default App;
