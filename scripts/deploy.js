import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({ path: ".env.local" });

function updateEnvFile(key, value) {
  const envPath = path.join(process.cwd(), ".env.local");

  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const newLine = `${key}=${value}`;

  if (envContent.includes(`${key}=`)) {
    envContent = envContent.replace(new RegExp(`${key}=.*`), newLine);
  } else {
    envContent += `\n${newLine}`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n");
}

function findArtifactPath() {
  const simplePath = path.join(
    process.cwd(),
    "artifacts",
    "CriminalEvidence.json"
  );

  const hardhatPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "CriminalEvidence.sol",
    "CriminalEvidence.json"
  );

  if (fs.existsSync(simplePath)) {
    return simplePath;
  }

  if (fs.existsSync(hardhatPath)) {
    return hardhatPath;
  }

  throw new Error(
    "CriminalEvidence.json not found. Checked artifacts/CriminalEvidence.json and artifacts/contracts/CriminalEvidence.sol/CriminalEvidence.json"
  );
}

async function main() {
  const rpcUrl = process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545";
  let privateKey = process.env.GANACHE_PRIVATE_KEY || "";

  if (
    !privateKey ||
    privateKey.includes("PASTE") ||
    privateKey.includes("your") ||
    privateKey.includes("YOUR")
  ) {
    throw new Error("Please add your real GANACHE_PRIVATE_KEY in .env.local");
  }

  privateKey = privateKey.trim();

  if (!privateKey.startsWith("0x")) {
    privateKey = `0x${privateKey}`;
  }

  const artifactPath = findArtifactPath();

  console.log("Using artifact:", artifactPath);

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  if (!artifact.abi || !artifact.bytecode) {
    throw new Error("CriminalEvidence.json must contain abi and bytecode");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);

  console.log("Connected to Ganache.");
  console.log("RPC URL:", rpcUrl);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deploying from:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("This Ganache account has 0 ETH.");
  }

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("Deploying CriminalEvidence contract...");

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed successfully.");
  console.log("CriminalEvidence address:", address);

  updateEnvFile("EVIDENCE_CONTRACT_ADDRESS", address);

  const simpleArtifactPath = path.join(
    process.cwd(),
    "artifacts",
    "CriminalEvidence.json"
  );

  if (artifactPath !== simpleArtifactPath) {
    fs.copyFileSync(artifactPath, simpleArtifactPath);
    console.log("Copied artifact to artifacts/CriminalEvidence.json");
  }

  console.log(".env.local updated with EVIDENCE_CONTRACT_ADDRESS");
  console.log("");
  console.log("Now restart Next.js:");
  console.log("Ctrl + C");
  console.log("npm run dev");
}

main().catch((error) => {
  console.error("");
  console.error("Deploy failed:");
  console.error(error.message);
  process.exit(1);
});