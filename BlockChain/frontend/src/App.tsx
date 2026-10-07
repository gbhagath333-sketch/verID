import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3001";

async function registerCertificate(studentName: string, file: File) {
  const formData = new FormData();
  formData.append("studentName", studentName);
  formData.append("certificate", file);

  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

async function verifyCertificate(recordId: string, file: File) {
  const formData = new FormData();
  formData.append("recordId", recordId);
  formData.append("certificate", file);

  const response = await fetch(`${API_URL}/api/verify`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

function App() {
  const [studentName, setStudentName] = useState("");
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [recordId, setRecordId] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);

  const [registerMessage, setRegisterMessage] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");

  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  async function handleRegister() {
    if (!studentName || !registerFile) {
      setRegisterMessage("Please enter the student name and select a certificate.");
      return;
    }

    try {
      setRegisterLoading(true);
      setRegisterMessage("");

      const data = await registerCertificate(studentName, registerFile);

      if (data.success) {
        setRegisterMessage(
          `✅ Certificate registered!\nRecord ID: ${data.recordId}`
        );
        setRecordId(data.recordId);
      } else {
        setRegisterMessage(`⚠️ ${data.error || "Registration failed."}`);
      }
    } catch (error) {
      console.error(error);
      setRegisterMessage(
        "⚠️ Cannot connect to the VerID blockchain server."
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleVerify() {
    if (!recordId || !verifyFile) {
      setVerifyMessage("Please enter the Record ID and select the certificate.");
      return;
    }

    try {
      setVerifyLoading(true);
      setVerifyMessage("");

      const data = await verifyCertificate(recordId, verifyFile);

      if (data.verified) {
        const student =
          data.record?.recordId
            ? "Blockchain record found"
            : "Verified";

        setVerifyMessage(
          `✅ AUTHENTIC\n${student}\nRecord ID: ${data.record.recordId}`
        );
      } else {
        setVerifyMessage(
          "🚨 TAMPER DETECTED\nThis certificate does not match the blockchain record."
        );
      }
    } catch (error) {
      console.error(error);
      setVerifyMessage(
        "⚠️ Cannot connect to the VerID blockchain server."
      );
    } finally {
      setVerifyLoading(false);
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
          Create tamper-proof certificate records and verify their
          authenticity using SHA-256 and Ethereum blockchain technology.
        </p>

        <div className="forms">
          <div className="card">
            <h2>Register Certificate</h2>

            <p className="card-description">
              Register a certificate permanently on the blockchain.
            </p>

            <input
              className="input"
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />

            <input
              className="file"
              type="file"
              onChange={(e) =>
                setRegisterFile(e.target.files?.[0] ?? null)
              }
            />

            <button
              className="verify"
              onClick={handleRegister}
              disabled={registerLoading}
            >
              {registerLoading
                ? "Registering on Blockchain..."
                : "Register Certificate"}
            </button>

            {registerMessage && (
              <div className="result authentic">
                {registerMessage}
              </div>
            )}
          </div>

          <div className="card">
            <h2>Verify Certificate</h2>

            <p className="card-description">
              Check whether a certificate matches its blockchain record.
            </p>

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
              onChange={(e) =>
                setVerifyFile(e.target.files?.[0] ?? null)
              }
            />

            <button
              className="verify"
              onClick={handleVerify}
              disabled={verifyLoading}
            >
              {verifyLoading
                ? "Verifying on Blockchain..."
                : "Verify Certificate"}
            </button>

            {verifyMessage && (
              <div
                className={`result ${
                  verifyMessage.startsWith("✅")
                    ? "authentic"
                    : "tampered"
                }`}
              >
                {verifyMessage}
              </div>
            )}
          </div>
        </div>

        <div className="footer">
          Powered by Ethereum Sepolia • SHA-256 • VerID
        </div>
      </section>
    </div>
  );
}

export default App;
