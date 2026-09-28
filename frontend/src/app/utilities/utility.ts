import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { ToolCatalog } from '../catalog/catalog';
import { runUtility } from './utility-client';
import { CONFIG } from './utility-config';
import { ToolGuide } from '../shared/tool-guide';
import { UTILITY_GUIDES } from './usage-guides';
@Component({ imports: [FormsModule, RouterLink, Icon, ToolGuide], templateUrl: './utility.html', styleUrl: './utility.scss' })
export class Utility implements OnDestroy {
  private cancellation = new AbortController();
  cancel() { this.cancellation.abort(); }
  ngOnDestroy() { this.cancellation.abort(); }
  readonly catalog = inject(ToolCatalog);
  readonly id = inject(ActivatedRoute).snapshot.data['tool'] as string;
  readonly tool = this.catalog.tools.find(tool => tool.id === this.id)!;
  readonly config = CONFIG[this.id];
  readonly input = signal(this.config.initial ?? '');
  readonly fields = signal<Record<string, string>>(Object.fromEntries((this.config.fields ?? []).map(field => [field.key, field.initial])));
  readonly mode = signal(this.config.modes[0].value);
  readonly guide = computed(() => UTILITY_GUIDES[this.id][this.mode()]);
  readonly output = signal<string | null>(null);
  readonly error = signal('');
  readonly notice = signal('');
  readonly busy = signal(false);
  readonly related = computed(() => this.catalog.tools.filter(tool => tool.id !== this.id).slice(0, 3));
  edit(value: string) { this.input.set(value); this.output.set(null); this.error.set(''); this.notice.set(''); }
  changeMode(value: string) { this.mode.set(value); this.output.set(null); this.error.set(''); this.notice.set(''); }
  example() { this.edit(this.guide().exampleInput); this.fields.set(Object.fromEntries((this.config.fields ?? []).map(field => [field.key, this.guide().exampleFields?.[field.key] ?? field.initial]))); }
  editField(key: string, value: string) { this.fields.update(fields => ({ ...fields, [key]: value })); this.edit(this.input()); }
  async run() {
    if (this.busy()) return;
    this.cancellation = new AbortController();
    this.busy.set(true); this.error.set(''); this.notice.set(''); this.output.set(null);
    try { this.output.set(await runUtility(this.id, this.input(), this.mode(), this.fields()['query'] ?? '', this.cancellation.signal, this.fields())); this.notice.set('Done. Your result is ready.'); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Could not complete this operation.'); }
    finally { this.busy.set(false); }
  }
  async copy() {
    try { await navigator.clipboard.writeText(this.output() ?? ''); this.notice.set('Copied to clipboard.'); }
    catch { this.error.set('Clipboard access is unavailable. Select and copy the result manually.'); }
  }
}
