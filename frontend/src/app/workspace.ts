import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './shared/icon';
import { ToolGuide, UsageGuide } from './shared/tool-guide';
import { ToolCatalog } from './catalog/catalog';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { ApiError, apiError, DevDockApi, JsonMode, Snippet, SnippetPage } from './api';

@Component({
  selector: 'app-workspace', imports: [FormsModule, DatePipe, RouterLink, Icon, ToolGuide],
  templateUrl: './workspace.html', styleUrl: './workspace.scss',
})
export class Workspace implements OnInit, OnDestroy {
  private readonly api = inject(DevDockApi);
  readonly catalog = inject(ToolCatalog);
  readonly guide: UsageGuide = {
    input: 'Paste a complete JSON value. Use double quotes for keys and strings, with no comments or trailing commas.',
    action: 'Click Format JSON for readable indentation, or Minify JSON to remove extra whitespace.',
    output: 'The same JSON values in a readable or compact layout. Invalid JSON shows an error. To keep a result, enter a snippet title and click Save snippet.',
    exampleInput: '{ "name": "DevDock", "ready": true }',
    exampleOutput: '{"name":"DevDock","ready":true}',
    exampleLabel: 'Example: Minify JSON',
  };
  readonly input = signal('');
  readonly output = signal('');
  readonly title = signal('');
  readonly selected = signal<Snippet | null>(null);
  readonly page = signal<SnippetPage>({ items: [], offset: 0, limit: 20, hasNext: false });
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<ApiError | null>(null);
  readonly listError = signal('');
  readonly notice = signal('');
  readonly dirty = signal(false);
  private libraryRequest?: Subscription;

  ngOnInit() { this.load(); }
  ngOnDestroy() { this.libraryRequest?.unsubscribe(); }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent) {
    if (this.dirty()) event.preventDefault();
  }
  load(offset = this.page().offset) {
    this.libraryRequest?.unsubscribe();
    this.loading.set(true); this.listError.set('');
    this.libraryRequest = this.api.list(offset).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: page => this.page.set(page), error: e => this.listError.set(apiError(e).message),
    });
  }
  editInput(value: string) {
    this.input.set(value); this.output.set(''); this.dirty.set(true); this.error.set(null); this.notice.set('');
  }
  editTitle(value: string) { this.title.set(value); this.dirty.set(true); this.error.set(null); this.notice.set(''); }
  transform(mode: JsonMode) {
    if (this.busy()) return;
    if (!this.input().trim() || this.input().length > 100_000) {
      this.error.set({ code: 'VALIDATION_ERROR', message: 'Enter JSON up to 100,000 characters.', fields: { input: 'JSON input is required (maximum 100,000 characters).' } }); return;
    }
    this.busy.set(true); this.error.set(null); this.notice.set(''); this.output.set('');
    this.api.transform(this.input(), mode).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: result => { this.output.set(result.output); this.dirty.set(true); this.notice.set('JSON is valid. Result is ready.'); },
      error: e => this.error.set(apiError(e)),
    });
  }
  save() {
    if (this.busy() || !this.output()) return;
    if (!this.title().trim() || this.title().length > 120) {
      this.error.set({ code: 'VALIDATION_ERROR', message: 'Give this snippet a title.', fields: { title: 'Use 1–120 characters.' } }); return;
    }
    this.busy.set(true); this.error.set(null); this.notice.set('');
    const draft = { title: this.title().trim(), content: this.output(), language: 'JSON' as const };
    const current = this.selected();
    const request = current ? this.api.update(current.id, draft, current.version) : this.api.create(draft);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: snippet => { this.accept(snippet); this.notice.set('Snippet saved.'); this.load(0); },
      error: e => this.error.set(apiError(e)),
    });
  }
  open(id: string) {
    if (this.busy() || !this.mayDiscard()) return;
    this.busy.set(true); this.error.set(null); this.notice.set('');
    this.api.get(id).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: snippet => this.accept(snippet), error: e => this.error.set(apiError(e)),
    });
  }
  newSnippet() {
    if (this.busy() || !this.mayDiscard()) return;
    this.selected.set(null); this.input.set(''); this.output.set(''); this.title.set('');
    this.dirty.set(false); this.error.set(null); this.notice.set('');
  }
  remove() {
    const current = this.selected();
    if (!current || this.busy() || !window.confirm(`Delete “${current.title}”? This cannot be undone.`)) return;
    this.busy.set(true); this.error.set(null); this.notice.set('');
    this.api.delete(current.id, current.version).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.selected.set(null); this.input.set(''); this.output.set(''); this.title.set(''); this.dirty.set(false);
        this.notice.set('Snippet deleted.'); this.load(0);
      }, error: e => this.error.set(apiError(e)),
    });
  }
  private accept(snippet: Snippet) {
    this.selected.set(snippet); this.title.set(snippet.title); this.input.set(snippet.content);
    this.output.set(snippet.content); this.dirty.set(false);
  }
  canLeave() { return !this.busy() && this.mayDiscard(); }
  private mayDiscard() { return !this.dirty() || window.confirm('Discard unsaved changes?'); }
}
