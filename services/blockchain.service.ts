import { ethers } from "ethers";
import CriminalEvidenceArtifact from "@/artifacts/CriminalEvidence.json";

function normalizePrivateKey(privateKey: string) {
  return privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
}

export async function submitEvidenceToBlockchain(params: {
  caseCode: string;
  description: string | null;
  evidenceHash: string;
}) {
  const rpcUrl = process.env.GANACHE_RPC_URL;
  const privateKey = process.env.GANACHE_PRIVATE_KEY;
  const contractAddress = process.env.EVIDENCE_CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    console.warn("Blockchain environment variables are missing.");
    return null;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(normalizePrivateKey(privateKey), provider);

  const contract = new ethers.Contract(
    contractAddress,
    CriminalEvidenceArtifact.abi,
    wallet
  );

  const tx = await contract.submitEvidence(
    params.caseCode,
    params.description || "",
    params.evidenceHash
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.hash || tx.hash,
  };
}

export async function getBlockchainEvidence(recordId: string | number) {
  const rpcUrl = process.env.GANACHE_RPC_URL;
  const contractAddress = process.env.EVIDENCE_CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress) {
    return null;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const contract = new ethers.Contract(
    contractAddress,
    CriminalEvidenceArtifact.abi,
    provider
  );

  const evidence = await contract.getEvidence(recordId);

  return {
    id: evidence.id.toString(),
    caseId: evidence.caseId,
    description: evidence.description,
    documentHash: evidence.documentHash,
    submittedBy: evidence.submittedBy,
    submittedAt: evidence.submittedAt.toString(),
    approved: evidence.approved,
    reviewedBy: evidence.reviewedBy,
    active: evidence.active,
  };
}