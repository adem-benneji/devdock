import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "IPv4 address/prefix",
  "note": "Enter dotted decimal IPv4 with prefix 0–32; leading-zero octets are rejected. /31 uses point-to-point host counting (2), /32 a single host (1). Results describe address arithmetic, not network reachability. IPv6 is not supported.",
  "modes": [
    {
      "value": "calculate",
      "label": "Calculate subnet"
    }
  ],
  "fields": [
    {
      "key": "member",
      "label": "Address to check (optional)",
      "initial": "",
      "multiline": false,
      "maxLength": 15,
      "secret": false
    }
  ]
};
