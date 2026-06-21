import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({ path: ".env.local" });

const rpcUrl = process.env.GANACHE_RPC_URL || "http://127.0.0.1:7545";

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const block = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    console.log("Ganache RPC connected successfully.");
    console.log("RPC URL:", rpcUrl);
    console.log("Network chainId:", network.chainId.toString());
    console.log("Current block number:", block);
  } catch (error) {
    console.error("Ganache RPC test failed:", error.message);
    process.exit(1);
  }
}

main();