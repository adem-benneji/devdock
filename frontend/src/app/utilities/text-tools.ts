export function lines(input: string, mode: string): string {
  if (!input) return '';
  const ending = /(?:\r\n|\r|\n)$/.test(input);
  let values = input.split(/\r\n|\r|\n/);
  if (ending) values.pop();
  switch (mode) {
    case 'unique': values = [...new Set(values)]; break;
    case 'sort': values.sort(); break;
    case 'reverse': values.reverse(); break;
    case 'trim': values = values.map(value => value.trim()); break;
    case 'nonblank': values = values.filter(value => value.trim()); break;
    default: throw new Error('Choose a supported line operation.');
  }
  return values.join('\n') + (ending && values.length ? '\n' : '');
}
export function numberBases(input: string, mode: string): string {
  const radix = { binary: 2, octal: 8, decimal: 10, hex: 16 }[mode];
  if (!radix) throw new Error('Choose a supported source base.');
  const text = input.trim();
  const digits = text.replace(/^[+-]/, '');
  if (!digits.length || digits.length > 4096) throw new Error('Enter an integer of 1–4,096 digits, without a base prefix.');
  let value = 0n;
  for (const char of digits.toLowerCase()) {
    const digit = '0123456789abcdef'.indexOf(char);
    if (digit < 0 || digit >= radix) throw new Error(`Enter valid base-${radix} digits without prefixes, separators, or fractions.`);
    value = value * BigInt(radix) + BigInt(digit);
  }
  if (text.startsWith('-')) value = -value;
  return JSON.stringify({ decimal: value.toString(10), hexadecimal: value.toString(16).toUpperCase(), binary: value.toString(2), octal: value.toString(8) }, null, 2);
}
