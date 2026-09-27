import { parseTree, type ParseError, type Node } from 'jsonc-parser';

export function parseJson(input: string): unknown {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  let depth = 0, quoted = false, escaped = false;
  for (const char of input) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{' || char === '[') {
      if (++depth > 64) throw new Error('JSON may be nested at most 64 levels deep.');
    } else if (char === '}' || char === ']') depth--;
  }
  const errors: ParseError[] = [];
  const root = parseTree(input, errors, { disallowComments: true, allowTrailingComma: false });
  if (!root || errors.length) throw new Error('Enter valid JSON without comments or trailing commas.');
  const pending: Node[] = [root];
  while (pending.length) {
    const node = pending.pop()!;
    if (node.type === 'object') {
      const keys = node.children?.map(property => property.children![0].value) ?? [];
      if (new Set(keys).size !== keys.length) throw new Error('Remove duplicate JSON property names.');
    }
    if (node.type === 'number' && (!Number.isFinite(node.value) || (Number.isInteger(node.value) && !Number.isSafeInteger(node.value)))) {
      throw new Error('Numbers must be finite and integers must be within the JavaScript safe range. Quote large identifiers as strings.');
    }
    pending.push(...node.children ?? []);
  }
  // JSON.parse preserves keys such as __proto__ as ordinary own properties.
  return JSON.parse(input);
}
export function boundedOutput(output: string): string {
  if (output.length > 1_000_000) throw new Error('Result exceeds 1,000,000 characters. Use a smaller input or a narrower query.');
  return output;
}
