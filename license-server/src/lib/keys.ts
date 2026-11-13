import crypto from "crypto";

// Developer's Master Ed25519 Keypair (Private Key stays on this server ONLY)
export const DEVELOPER_PRIVATE_KEY_HEX =
  process.env.DEV_PRIVATE_KEY || "59886c805cfb34fe921c8ef9b552c945ed735aa42474064d73db3e8636905720";

export const DEVELOPER_PUBLIC_KEY_HEX =
  process.env.DEV_PUBLIC_KEY || "0c3b91b33c1596b8af5110b0c72074960cc25e92e0137628661d13a2ee6e8770";

export interface LicenseMeta {
  license_id: string;
  licensee: string;
  domain: string;
  tier: "ENTERPRISE" | "COMMERCIAL" | "TRIAL";
  issued_at: string;
  expires_at: string;
  heartbeat_url?: string;
  status: "ACTIVE" | "REVOKED";
}

/**
 * Sign license payload using Ed25519
 */
export function signLicense(meta: Omit<LicenseMeta, "status">): string {
  const payloadJson = JSON.stringify(meta);
  const payloadB64 = Buffer.from(payloadJson).toString("base64url");

  // Reconstruct PKCS#8 DER private key
  const privKeyDer = Buffer.concat([
    Buffer.from("302e020100300506032b657004220420", "hex"),
    Buffer.from(DEVELOPER_PRIVATE_KEY_HEX, "hex"),
  ]);

  const privateKey = crypto.createPrivateKey({
    key: privKeyDer,
    format: "der",
    type: "pkcs8",
  });

  const sig = crypto.sign(null, Buffer.from(payloadJson), privateKey);
  const sigB64 = sig.toString("base64url");

  return `${payloadB64}.${sigB64}`;
}
