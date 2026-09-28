package com.devtools.tools.features.ipv4cidr;

import static com.devtools.tools.utilities.UtilitySupport.*;

import com.devtools.tools.utilities.ToolProcessor;
import java.util.*;

/** Backend implementation of the ipv4-cidr tool. */
public final class Ipv4CidrTool implements ToolProcessor {
  @Override
  public String id() {
    return "ipv4-cidr";
  }

  @Override
  public String execute(String input, String mode, Map<String, String> fields) throws Exception {
    return cidr(input, fields.getOrDefault("member", ""));
  }

  static long ip(String text) {
    String[] p = text.split("\\.", -1);
    if (p.length != 4) throw invalid("Enter four IPv4 octets from 0 to 255.");
    long n = 0;
    for (String part : p) {
      if (!part.matches("0|[1-9][0-9]{0,2}") || Integer.parseInt(part) > 255)
        throw invalid("Enter IPv4 octets without leading zeros.");
      n = n * 256 + Integer.parseInt(part);
    }
    return n;
  }

  static String ip(long n) {
    return ((n >>> 24) & 255)
        + "."
        + ((n >>> 16) & 255)
        + "."
        + ((n >>> 8) & 255)
        + "."
        + (n & 255);
  }

  static String cidr(String input, String member) {
    String[] parts = input.strip().split("/", -1);
    if (parts.length != 2) throw invalid("Enter IPv4/prefix, such as 192.168.1.42/24.");
    int prefix = integer(parts[1], 0, 32);
    long address = ip(parts[0]),
        size = 1L << (32 - prefix),
        network = address / size * size,
        last = network + size - 1;
    var result = new LinkedHashMap<String, Object>();
    result.put("inputAddress", parts[0]);
    result.put("cidr", ip(network) + "/" + prefix);
    result.put("network", ip(network));
    result.put("lastAddress", ip(last));
    result.put("netmask", ip((1L << 32) - size));
    result.put("wildcard", ip(size - 1));
    result.put("totalAddresses", size);
    result.put("usableHostCount", prefix >= 31 ? size : size - 2);
    result.put("firstHost", ip(prefix >= 31 ? network : network + 1));
    result.put("lastHost", ip(prefix >= 31 ? last : last - 1));
    if (!member.isBlank()) {
      long test = ip(member.strip());
      result.put(
          "membership",
          Map.of("address", member.strip(), "inSubnet", test >= network && test <= last));
    }
    return json(result);
  }
}
