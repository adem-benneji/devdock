import { Component, input } from '@angular/core';

export interface UsageGuide {
  input: string;
  action: string;
  output: string;
  exampleInput: string;
  exampleOutput: string;
  exampleLabel?: string;
  exampleFields?: Record<string, string>;
}

@Component({
  selector: 'dd-tool-guide',
  template: `
    <details open>
      <summary>How to use</summary>
      <div class="steps">
        <div><h3>What to enter</h3><p>{{ guide().input }}</p></div>
        <div><h3>What to do</h3><p>{{ guide().action }}</p></div>
        <div><h3>What you get</h3><p>{{ guide().output }}</p></div>
      </div>
      <div class="example" aria-label="Input and output example">
        <span class="example-label">{{ guide().exampleLabel ?? 'Example' }}</span>
        <div><span>Input</span><code>{{ guide().exampleInput }}</code></div>
        <div><span>Output</span><code>{{ guide().exampleOutput }}</code></div>
      </div>
    </details>
  `,
  styles: `
    :host{display:block;margin-bottom:22px;min-width:0}
    details{background:#f3f6ee;border:1px solid #dfe7d6;border-radius:8px;padding:14px 16px}
    summary{font-size:12px;font-weight:650;color:var(--green);cursor:pointer}
    .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px;margin:16px 0}
    h3{font-size:11px;margin:0 0 6px;color:var(--ink);font-weight:650}
    p{font-size:12px;line-height:1.7;color:#62715b;margin:0}
    .example{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 16px;border-top:1px solid #dfe7d6;padding-top:12px}
    .example-label{grid-column:1/-1;font-size:10px;font-weight:650;color:#62715b}
    .example>div{min-width:0}.example>div>span{display:block;font-size:10px;color:#62715b;margin-bottom:5px}
    code{display:block;background:#ffffffb3;border-radius:4px;padding:8px;font:11px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--ink)}
    @media(max-width:650px){.steps{grid-template-columns:1fr;gap:12px}.example{grid-template-columns:1fr}}
  `,
})
export class ToolGuide { readonly guide = input.required<UsageGuide>(); }
