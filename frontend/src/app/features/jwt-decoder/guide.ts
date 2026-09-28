import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "decode": {
    "input": "Paste a three-part JWT, optionally preceded by Bearer. The example contains a placeholder signature.",
    "action": "Click Run tool to decode the header and payload. Never use this result to authorize a request.",
    "output": "Readable header and claims, signature presence, and expiry information. signatureVerified is always false; decoding does not prove authenticity.",
    "exampleInput": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiRGV2RG9jayJ9.c2lnbmF0dXJl",
    "exampleOutput": "\"signatureVerified\": false\n\"claims\": {\"sub\":\"123\",\"name\":\"DevDock\"}\n\"expiration\": {\"status\":\"not provided\"}",
    "exampleLabel": "Example (output excerpt)"
  }
};
