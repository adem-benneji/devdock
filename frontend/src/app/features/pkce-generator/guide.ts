import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "generate": {
    "input": "For Generate, leave the editor empty; a fresh verifier is created. For Derive, paste your existing verifier exactly.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "JSON containing codeVerifier, codeChallenge, and codeChallengeMethod S256. Keep the verifier with your OAuth flow until token exchange.",
    "exampleInput": "",
    "exampleOutput": "A new random verifier and its S256 challenge on each run.",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  },
  "derive": {
    "input": "For Generate, leave the editor empty; a fresh verifier is created. For Derive, paste your existing verifier exactly.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "JSON containing codeVerifier, codeChallenge, and codeChallengeMethod S256. Keep the verifier with your OAuth flow until token exchange.",
    "exampleInput": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    "exampleOutput": "codeChallenge: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    "exampleFields": {},
    "exampleLabel": "Example (output summary)"
  }
};
