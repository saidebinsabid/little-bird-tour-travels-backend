/**
 * Verify a Firebase ID token WITHOUT the Admin SDK.
 *
 * Firebase ID tokens are RS256 JWTs signed by Google's secure-token service.
 * Verification only needs:
 *   - Google's public x509 certs (public URL, cached per cache-control)
 *   - the project id (public — it's in the web config)
 * So Google sign-in works with just the public Firebase config; no service
 * account / private key required.
 */
const jwt = require("jsonwebtoken");

const CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cache = { certs: null, exp: 0 };

async function getCerts() {
  const now = Date.now();
  if (cache.certs && now < cache.exp) return cache.certs;

  const res = await fetch(CERT_URL); // Node 18+ has global fetch
  if (!res.ok) throw new Error("Failed to fetch Google certs");
  const certs = await res.json();

  const cc = res.headers.get("cache-control") || "";
  const m = cc.match(/max-age=(\d+)/);
  const ttl = m ? parseInt(m[1], 10) * 1000 : 3600 * 1000;
  cache = { certs, exp: now + ttl };
  return certs;
}

// Returns the decoded payload (email, name, picture, sub/uid) if valid; throws otherwise.
async function verifyFirebaseToken(idToken, projectId) {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header?.kid) throw new Error("Malformed token");

  const certs = await getCerts();
  const cert = certs[decoded.header.kid];
  if (!cert) throw new Error("Unknown signing key");

  return jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });
}

module.exports = { verifyFirebaseToken };
