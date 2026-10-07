import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { artifacts, network } from "hardhat";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("\n========================================================");
  console.log("   🚀 Deploying VerID RecordVerification Smart Contract");
  console.log("========================================================\n");

  let provider: ethers.Provider;
  let signer: ethers.Signer;
  let networkName = "hardhat-inprocess";
  let chainId = 31337;

  // Check if a local Hardhat node is running at port 8545
  try {
    const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const net = await Promise.race([
      localProvider.getNetwork(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000)),
    ]);
    if (net) {
      provider = localProvider;
      signer = await localProvider.getSigner(0);
      networkName = "hardhat-local-node (http://127.0.0.1:8545)";
      chainId = Number(net.chainId);
      console.log(`[+] Connected to running Hardhat node at 127.0.0.1:8545 (Chain ID: ${chainId})`);
    }
  } catch {
    // Fall back to in-process Hardhat network
    const net = await network.connect();
    const browserProvider = new ethers.BrowserProvider(net.provider);
    provider = browserProvider;
    signer = await browserProvider.getSigner(0);
    console.log("[+] Connected to Hardhat in-process network (Chain ID: 31337)");
  }

  const deployerAddress = await signer.getAddress();
  console.log(`[+] Deployer / Issuer Wallet Address: ${deployerAddress}`);

  // Load contract artifact
  const artifact = await artifacts.readArtifact("RecordVerification");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("[+] Broadcasting deployment transaction...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const txHash = contract.deploymentTransaction()?.hash ?? "N/A";

  console.log("\n--------------------------------------------------------");
  console.log("   ✅ CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("--------------------------------------------------------");
  console.log(`   Contract Address:   ${contractAddress}`);
  console.log(`   Deployer Address:   ${deployerAddress}`);
  console.log(`   Transaction Hash:   ${txHash}`);
  console.log(`   Network:            ${networkName}`);
  console.log("--------------------------------------------------------\n");

  // Save deployment metadata and ABI to deployment-info.json for frontend/backend
  const deploymentInfo = {
    contractName: "RecordVerification",
    contractAddress,
    deployerAddress,
    transactionHash: txHash,
    network: networkName,
    chainId,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const outputPath = path.resolve(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2), "utf8");

  console.log(`[+] Deployment metadata & ABI exported to:\n    ${outputPath}\n`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
