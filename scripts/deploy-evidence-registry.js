const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
require("dotenv").config({ path: ".env.local" });

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

async function main() {
  if (
    !process.env.GANACHE_PRIVATE_KEY ||
    process.env.GANACHE_PRIVATE_KEY.includes("PASTE") ||
    process.env.GANACHE_PRIVATE_KEY.includes("your") ||
    process.env.GANACHE_PRIVATE_KEY.includes("YOUR")
  ) {
    throw new Error("Please add your real GANACHE_PRIVATE_KEY in .env.local");
  }

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying CriminalEvidence...");
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("This Ganache account has 0 ETH.");
  }

  const Evidence = await hre.ethers.getContractFactory("CriminalEvidence");
  const evidence = await Evidence.deploy();

  await evidence.waitForDeployment();

  const address = await evidence.getAddress();

  console.log("CriminalEvidence deployed to:", address);

  updateEnvFile("EVIDENCE_CONTRACT_ADDRESS", address);

  const hardhatArtifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "CriminalEvidence.sol",
    "CriminalEvidence.json"
  );

  const simpleArtifactPath = path.join(
    process.cwd(),
    "artifacts",
    "CriminalEvidence.json"
  );

  if (fs.existsSync(hardhatArtifactPath)) {
    fs.copyFileSync(hardhatArtifactPath, simpleArtifactPath);
    console.log("Copied artifact to artifacts/CriminalEvidence.json");
  }

  console.log(".env.local updated with EVIDENCE_CONTRACT_ADDRESS");
  console.log("");
  console.log("Restart Next.js after deployment:");
  console.log("Ctrl + C");
  console.log("npm run dev");
}

main().catch((error) => {
  console.error("");
  console.error("Deploy failed:");
  console.error(error.message);
  process.exitCode = 1;
});