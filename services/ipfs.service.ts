export async function uploadFileToPinata(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    console.warn("PINATA_JWT is missing. IPFS upload skipped.");
    return null;
  }

  const formData = new FormData();

  const blob = new Blob([new Uint8Array(params.buffer)], {
    type: params.mimeType || "application/octet-stream",
  });

  formData.append("file", blob, params.fileName);

  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: params.fileName,
    })
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Pinata upload failed: ${message}`);
  }

  const data = (await response.json()) as {
    IpfsHash?: string;
  };

  return data.IpfsHash || null;
}