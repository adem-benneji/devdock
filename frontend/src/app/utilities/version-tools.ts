import { SemVer, compare, inc, satisfies, validRange } from 'semver';
export function versionTool(input: string, mode: string, reference = ''): string {
  const text = input.trim();
  let version: SemVer;
  try {
    if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(text) || text.length > 256) throw new Error();
    version = new SemVer(text, { loose: false });
  } catch { throw new Error('Enter a strict semantic version, such as 1.2.3 or 1.2.3-beta.1+build.7.'); }
  if (mode === 'inspect') return JSON.stringify({ version: text, major: version.major, minor: version.minor, patch: version.patch, prerelease: version.prerelease, build: version.build }, null, 2);
  if (['major', 'minor', 'patch'].includes(mode)) {
    const next = inc(text, mode as 'major');
    try { if (!next) throw new Error(); new SemVer(next); }
    catch { throw new Error('The incremented version exceeds the supported numeric range.'); }
    return next!;
  }
  if (reference.length > 1000 || !reference.trim()) throw new Error('Enter a comparison version or npm-compatible range, up to 1,000 characters.');
  if (mode === 'range') {
    const normalized = validRange(reference, { loose: false });
    if (normalized === null) throw new Error('Enter a valid npm-compatible semantic-version range.');
    return JSON.stringify({ version: text, range: reference, normalizedRange: normalized, satisfies: satisfies(text, reference, { includePrerelease: false }) }, null, 2);
  }
  if (mode === 'compare') {
    versionTool(reference, 'inspect');
    const result = compare(text, reference.trim());
    return JSON.stringify({ version: text, other: reference.trim(), precedence: result < 0 ? 'lower' : result > 0 ? 'higher' : 'equal', buildMetadataIgnored: true }, null, 2);
  }
  throw new Error('Choose a supported version operation.');
}
