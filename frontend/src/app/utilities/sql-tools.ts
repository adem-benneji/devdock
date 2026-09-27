import { format, type SqlLanguage } from 'sql-formatter';
import { boundedOutput } from './strict-json';
export function formatSql(input: string, dialect: string): string {
  if (!input.trim() || input.length > 100_000) throw new Error('Enter SQL up to 100,000 characters.');
  if (!['sql', 'postgresql', 'mysql', 'sqlite', 'tsql'].includes(dialect)) throw new Error('Choose a supported SQL dialect.');
  try { return boundedOutput(format(input, { language: dialect as SqlLanguage, keywordCase: 'upper', tabWidth: 2, linesBetweenQueries: 1 })); }
  catch { throw new Error('Could not format this SQL within the output limit. Check the dialect and syntax; this tool does not execute or fully validate queries.'); }
}
