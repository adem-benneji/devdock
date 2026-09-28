import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "calculate": {
    "input": "Enter an IPv4 CIDR such as 192.168.1.42/24. Optionally enter another address to test membership.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "Normalized network, netmask, wildcard, last address, usable-host range/count, and optional membership.",
    "exampleInput": "192.168.1.42/24",
    "exampleOutput": "cidr: 192.168.1.0/24; usableHostCount: 254; inSubnet: true",
    "exampleFields": {
      "member": "192.168.1.200"
    },
    "exampleLabel": "Example (output summary)"
  }
};
