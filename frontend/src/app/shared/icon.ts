import { Component, input } from '@angular/core';
const paths: Record<string, string> = {
  search: 'm21 21-4.4-4.4 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
  arrow: 'M5 12h14 m-6-6 6 6-6 6', diagonal: 'M6 18 18 6 M6 6h12v12',
  code: 'm8 7-5 5 5 5 m8-10 5 5-5 5 m-3-14-2 18',
  braces: 'M8 3H6a2 2 0 0 0-2 2v4l-2 3 2 3v4a2 2 0 0 0 2 2h2 M16 3h2a2 2 0 0 1 2 2v4l2 3-2 3v4a2 2 0 0 1-2 2h-2',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
  shield: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z m-4 10 3 3 5-6',
  link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',
  hash: 'M9 3 7 21 M17 3l-2 18 M3 9h18 M2 15h18',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  text: 'M3 5h12 M9 5v14 M5 19h8 M15 12h6 M18 12v7',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
  book: 'M4 3h14a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V5a2 2 0 0 1 1-2 M3 17h17 M8 7h7 M8 11h5',
  check: 'm5 12 4 4L19 6', close: 'm6 6 12 12 M6 18 18 6',
  copy: 'M9 9h12v12H9z M15 5V3H3v12h2', menu: 'M4 6h16 M4 12h16 M4 18h16',
  bolt: 'm13 2-9 12h7l-1 8L21 9h-8z', heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
};
@Component({ selector: 'dd-icon', template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()" /></svg>`, styles: `:host{display:inline-flex;width:1.25em;height:1.25em;flex-shrink:0}svg{width:100%;height:100%}` })
export class Icon { readonly name = input('code'); path() { return paths[this.name()] ?? paths['code']; } }
