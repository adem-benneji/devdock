import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "parse": {
    "input": "Enter a complete web address starting with http:// or https://.",
    "action": "Click Run tool. The address is parsed in this tab without opening or fetching it.",
    "output": "Protocol, origin, hostname, port, path, query entries, and fragment. Repeated parameters stay separate; credentials are omitted.",
    "exampleInput": "https://example.com/search?q=dev+dock&tag=api&tag=json#results",
    "exampleOutput": "\"hostname\": \"example.com\"\n\"pathname\": \"/search\"\n\"query\": [{\"name\":\"q\",\"value\":\"dev dock\"},{\"name\":\"tag\",\"value\":\"api\"},{\"name\":\"tag\",\"value\":\"json\"}]\n\"fragment\": \"results\"",
    "exampleLabel": "Example (output excerpt)"
  }
};
