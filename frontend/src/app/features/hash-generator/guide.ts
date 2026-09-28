import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "sha256": {
    "input": "Enter the exact text you want to hash. Spaces, line breaks, and letter case matter.",
    "action": "Click Run tool, then use Copy result to copy the digest.",
    "output": "A 64-character hexadecimal SHA-256 digest. Identical input gives the same digest; hashing cannot recover the original text.",
    "exampleInput": "hello",
    "exampleOutput": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
  },
  "sha384": {
    "input": "Enter the exact text you want to hash. Spaces, line breaks, and letter case matter.",
    "action": "Click Run tool, then use Copy result to copy the digest.",
    "output": "A 96-character lowercase hexadecimal SHA-384 digest of your exact UTF-8 input.",
    "exampleInput": "hello",
    "exampleOutput": "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f"
  },
  "sha512": {
    "input": "Enter the exact text you want to hash. Spaces, line breaks, and letter case matter.",
    "action": "Click Run tool, then use Copy result to copy the digest.",
    "output": "A 128-character lowercase hexadecimal SHA-512 digest of your exact UTF-8 input.",
    "exampleInput": "hello",
    "exampleOutput": "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
  }
};
