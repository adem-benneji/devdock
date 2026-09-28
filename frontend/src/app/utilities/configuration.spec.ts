import { CONFIG } from './utility-config';
import { UTILITY_GUIDES } from './usage-guides';
import { TOOLS } from '../catalog/catalog';

describe('tool presentation modules', () => {
  it('gives each utility a catalog entry, form and mode-specific guide', () => {
    const ids = TOOLS.filter(tool => tool.utility).map(tool => tool.id).sort();
    expect(Object.keys(CONFIG).sort()).toEqual(ids);
    expect(Object.keys(UTILITY_GUIDES).sort()).toEqual(ids);
    for (const id of ids) {
      expect(Object.keys(UTILITY_GUIDES[id]).sort()).toEqual(CONFIG[id].modes.map(mode => mode.value).sort());
      for (const guide of Object.values(UTILITY_GUIDES[id])) {
        expect(guide.input).toBeTruthy(); expect(guide.action).toBeTruthy(); expect(guide.output).toBeTruthy();
        expect(typeof guide.exampleInput).toBe('string'); expect(typeof guide.exampleOutput).toBe('string');
      }
    }
  });
  it('does not promise browser-only processing or the old JavaScript regex engine', () => {
    const text = JSON.stringify({ CONFIG, UTILITY_GUIDES });
    expect(text).not.toMatch(/Nothing is stored or transmitted|your device clock|JavaScript regular expressions|3-second worker/);
  });
});
