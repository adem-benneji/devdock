import { Component, computed, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolCatalog } from '../catalog/catalog';
import { Icon } from '../shared/icon';
import { ToolCard } from './tool-card';
import { Collections } from './collections';
import { Hero } from './hero';
@Component({ imports: [FormsModule, RouterLink, Icon, Hero, ToolCard, Collections], templateUrl: './home.html', styleUrl: './home.scss' })
export class Home {
  readonly catalog = inject(ToolCatalog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly isLanding = this.route.snapshot.data['landing'] === true;
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly query = computed(() => this.params().get('q') ?? '');
  readonly category = computed(() => this.params().get('category') ?? 'all');
  readonly onlyFavorites = computed(() => this.params().get('view') === 'favorites');
  readonly filtered = computed(() => this.catalog.tools.filter(tool =>
    (this.category() === 'all' || tool.category === this.category()) &&
    (!this.onlyFavorites() || this.catalog.favorites().includes(tool.id)) &&
    `${tool.name} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase().includes(this.query().trim().toLowerCase())));
  changeQuery(q: string) { this.update({ q: q || null }); }
  choose(category: string) { this.update({ category: category === 'all' ? null : category }); }
  favorites() { this.update({ view: this.onlyFavorites() ? null : 'favorites' }); }
  reset() { void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true }); }
  private update(params: Record<string, string | null>) { void this.router.navigate([], { relativeTo: this.route, queryParams: params, queryParamsHandling: 'merge', replaceUrl: true }); }
  @HostListener('window:keydown', ['$event'])
  shortcut(event: KeyboardEvent) {
    const typing = (event.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]');
    if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault(); this.searchInput()?.nativeElement.focus(); this.searchInput()?.nativeElement.scrollIntoView({ block: 'center' });
    }
  }
}
