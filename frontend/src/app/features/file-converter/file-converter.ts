import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { runExecution } from '../../shared/execution-client';
import { Icon } from '../../shared/icon';
import { ToolCatalog } from '../../catalog/catalog';

import type { components } from '../../generated/tools-api';
type Capabilities = components['schemas']['Capabilities'];
type Inspection = components['schemas']['Inspection'];
@Component({ selector: 'dd-file-converter', imports: [FormsModule, RouterLink, Icon], templateUrl: './file-converter.html', styleUrl: './file-converter.scss' })
export class FileConverter implements OnDestroy {
  private readonly http = inject(HttpClient);
  readonly catalog = inject(ToolCatalog);
  readonly capabilities = signal<Capabilities | null>(null);
  readonly section = signal('data');
  readonly selectedSection = computed(() => this.capabilities()?.sections.find(s => s.id === this.section()));
  readonly file = signal<File | null>(null);
  readonly inspection = signal<Inspection | null>(null);
  readonly sheets = computed(() => { const values = this.inspection()?.details['sheets']; return Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : []; });
  readonly state = signal<'idle' | 'inspecting' | 'ready' | 'converting' | 'done' | 'error'>('idle');
  readonly busy = computed(() => ['inspecting', 'converting'].includes(this.state()));
  readonly error = signal('');
  readonly dragging = signal(false);
  readonly target = signal('');
  readonly choice = computed(() => this.inspection()?.outputs.find(c => c.id === this.target()));
  readonly result = signal<{ url: string; name: string; size: number; format: string } | null>(null);
  readonly preferred = signal('');
  readonly progress = signal<number | null>(null);
  sheet = 0; width = 0; quality = 90;
  private generation = 0;
  private request?: AbortController;
  private catalogRequest?: Subscription;
  constructor() { this.loadCapabilities(); }
  loadCapabilities() {
    this.catalogRequest?.unsubscribe();
    this.catalogRequest = this.http.get<Capabilities>('/api/tools/files/capabilities').subscribe({ next: value => { this.capabilities.set(value); this.error.set(''); }, error: () => this.error.set('Could not load the converter. Check the local services and retry.') });
  }
  choose(event: Event) { const input = event.target as HTMLInputElement; if (input.files?.length) this.select(Array.from(input.files)); input.value = ''; }
  drop(event: DragEvent) { event.preventDefault(); this.dragging.set(false); if (event.dataTransfer?.files.length) this.select(Array.from(event.dataTransfer.files)); }
  select(files: File[]) {
    this.reset();
    if (files.length !== 1) { this.error.set('Choose one file at a time.'); this.state.set('error'); return; }
    const file = files[0]; this.file.set(file);
    if (!file.size || file.size > (this.capabilities()?.maxInputBytes ?? 5_000_000)) { this.error.set('Choose a nonempty file up to 5 MB.'); this.state.set('error'); return; }
    this.inspect();
  }
  async inspect() {
    const file = this.file(); if (!file) return;
    this.request?.abort(); this.request = new AbortController(); const generation = ++this.generation;
    this.error.set(''); this.state.set('inspecting'); this.clearResult(); this.inspection.set(null);
    try {
      const value = await runExecution('/api/tools/files/executions?' + new URLSearchParams({ operation: 'inspect', filename: file.name }),
        { method: 'POST', body: file, headers: { 'Content-Type': 'application/octet-stream' } }, this.request.signal,
        result => result.inspection as Inspection);
      if (generation !== this.generation) return;
      this.inspection.set(value); this.section.set(value.category);
      this.target.set(value.outputs.find(c => c.id === this.preferred())?.id ?? value.outputs[0]?.id ?? ''); this.state.set('ready');
    } catch (error) { await this.fail(error, generation); }
  }
  changeTarget(target: string) { this.target.set(target); this.optionsChanged(); }
  optionsChanged() { this.clearResult(); this.error.set(''); if (this.inspection()) this.state.set('ready'); }
  shortcut(target: string) { this.preferred.set(target); if (this.inspection()?.outputs.some(c => c.id === target)) this.changeTarget(target); }
  async convert() {
    const file = this.file(), choice = this.choice(); if (!file || !choice || this.busy()) return;
    this.clearResult(); this.error.set(''); this.state.set('converting'); this.progress.set(null);
    this.request = new AbortController(); const generation = ++this.generation;
    try {
      const result = await runExecution('/api/tools/files/executions?' + new URLSearchParams({ operation: 'convert', filename: file.name, target: choice.id, sheet: String(this.sheet), width: String(this.width), quality: String(this.quality) }),
        { method: 'POST', body: file, headers: { 'Content-Type': 'application/octet-stream' } }, this.request.signal,
        async (result, download) => ({ body: await download(), name: result.filename ?? 'converted.' + choice.extension }));
      if (generation !== this.generation) return;
      this.result.set({ url: URL.createObjectURL(result.body), name: result.name, size: result.body.size, format: choice.label }); this.state.set('done');
    } catch (error) { await this.fail(error, generation); }
  }
  private async fail(error: unknown, generation: number) {
    let message = 'Could not complete the conversion. Check the local services and try again.';
    if (error instanceof Error) message = error.message;
    if (error instanceof HttpErrorResponse) {
      let body = error.error;
      if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
      if (typeof body?.message === 'string') message = body.message;
    }
    if (generation !== this.generation) return;
    this.error.set(message); this.state.set('error'); this.progress.set(null);
  }
  reset() { this.request?.abort(); ++this.generation; this.clearResult(); this.file.set(null); this.inspection.set(null); this.error.set(''); this.target.set(''); this.state.set('idle'); this.progress.set(null); this.sheet = 0; this.width = 0; this.quality = 90; }
  private clearResult() { const result = this.result(); if (result) URL.revokeObjectURL(result.url); this.result.set(null); }
  size(bytes: number) { return bytes < 1000 ? `${bytes} B` : bytes < 1_000_000 ? `${(bytes / 1000).toFixed(1)} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`; }
  ngOnDestroy() { this.reset(); this.catalogRequest?.unsubscribe(); }
}
