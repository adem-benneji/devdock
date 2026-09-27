import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface ApiError { code: string; message: string; fields: Record<string, string>; }
export interface SnippetSummary { id: string; title: string; language: 'JSON' | 'TEXT'; version: number; updatedAt: string; }
export interface Snippet extends SnippetSummary { content: string; createdAt: string; }
export interface SnippetPage { items: SnippetSummary[]; limit: number; offset: number; hasNext: boolean; }
export interface SnippetDraft { title: string; content: string; language: 'JSON' | 'TEXT'; }
export type JsonMode = 'FORMAT' | 'MINIFY';

export function apiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') return error.error;
  return { code: 'NETWORK_ERROR', message: 'Could not reach DevDock. Check the local services and try again.', fields: {} };
}

@Injectable({ providedIn: 'root' })
export class DevDockApi {
  private readonly http = inject(HttpClient);
  transform(input: string, mode: JsonMode) {
    return this.http.post<{ toolId: string; mode: JsonMode; output: string }>('/api/tools/json-formatter', { input, mode });
  }
  list(offset = 0) { return this.http.get<SnippetPage>('/api/snippets', { params: { limit: 20, offset } }); }
  get(id: string) { return this.http.get<Snippet>(`/api/snippets/${id}`); }
  create(draft: SnippetDraft) { return this.http.post<Snippet>('/api/snippets', draft); }
  update(id: string, draft: SnippetDraft, version: number) { return this.http.put<Snippet>(`/api/snippets/${id}`, { ...draft, version }); }
  delete(id: string, version: number) { return this.http.delete<void>(`/api/snippets/${id}`, { params: { version } }); }
}
