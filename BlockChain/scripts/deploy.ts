import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("\n========================================================");
  console.log("   🚀 Deploying VerID RecordVerification to Sepolia");
  console.log("========================================================\n");

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error("SEPOLIA_RPC_URL is missing from .env");
  }

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY is missing from .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();

  if (Number(network.chainId) !== 11155111) {
    throw new Error(
      `Wrong network! Expected Sepolia (11155111), got chain ID ${network.chainId}`
    );
  }

  const deployerAddress = await signer.getAddress();

  console.log(`[+] Connected to Ethereum Sepolia`);
  console.log(`[+] Deployer / Issuer Wallet: ${deployerAddress}`);
  console.log(`[+] Chain ID: ${network.chainId}`);

  const balance = await provider.getBalance(deployerAddress);

  console.log(
    `[+] Wallet balance: ${ethers.formatEther(balance)} ETH`
  );

  const artifactPath = path.resolve(
    __dirname,
    "..",
    "artifacts/contracts/RecordVerification.sol/RecordVerification.json"
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      "Contract artifact not found. Run the local Solidity compilation step first."
    );
  }

  const artifact = JSON.parse(
    fs.readFileSync(artifactPath, "utf8")
  );

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  console.log("\n[+] Broadcasting deployment transaction...");

  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const txHash = contract.deploymentTransaction()?.hash ?? "N/A";

  console.log("\n--------------------------------------------------------");
  console.log("   ✅ CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("--------------------------------------------------------");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Deployer Address: ${deployerAddress}`);
  console.log(`   Transaction Hash: ${txHash}`);
  console.log(`   Network: Ethereum Sepolia`);
  console.log(`   Chain ID: 11155111`);
  console.log("--------------------------------------------------------\n");

  const deploymentInfo = {
    contractName: "RecordVerification",
    contractAddress,
    deployerAddress,
    transactionHash: txHash,
    network: "Ethereum Sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const outputPath = path.resolve(
    __dirname,
    "..",
    "deployment-info.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(deploymentInfo, null, 2),
    "utf8"
  );

  console.log(
    `[+] Deployment metadata & ABI exported to:\n    ${outputPath}\n`
  );
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
});
