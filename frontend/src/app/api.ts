import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import type { components as Tools } from './generated/tools-api';
import type { components as Snippets } from './generated/snippets-api';
export type ApiError = Tools['schemas']['ApiError'];
export type SnippetSummary = Snippets['schemas']['Summary'];
export type Snippet = Snippets['schemas']['Snippet'];
export type SnippetPage = Snippets['schemas']['Page'];
export type SnippetDraft = Snippets['schemas']['CreateRequest'];
export type JsonMode = Tools['schemas']['JsonRequest']['mode'];

export function apiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') return error.error;
  return { code: 'NETWORK_ERROR', message: 'Could not reach DevDock. Check the local services and try again.', fields: {} };
}

@Injectable({ providedIn: 'root' })
export class DevDockApi {
  private readonly http = inject(HttpClient);
  transform(input: string, mode: JsonMode) {
    return this.http.post<Tools['schemas']['JsonResult']>('/api/tools/json-formatter', { input, mode });
  }
  list(offset = 0) { return this.http.get<SnippetPage>('/api/snippets', { params: { limit: 20, offset } }); }
  get(id: string) { return this.http.get<Snippet>(`/api/snippets/${id}`); }
  create(draft: SnippetDraft) { return this.http.post<Snippet>('/api/snippets', draft); }
  update(id: string, draft: SnippetDraft, version: number) { return this.http.put<Snippet>(`/api/snippets/${id}`, { ...draft, version }); }
  delete(id: string, version: number) { return this.http.delete<void>(`/api/snippets/${id}`, { params: { version } }); }
}
