import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './shared/icon';
import { ToolCatalog } from './catalog/catalog';
@Component({ imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon], selector: 'app-root', styleUrl: './app.scss', templateUrl: './app.html' })
export class App {
  readonly catalog = inject(ToolCatalog);
  readonly menuOpen = signal(false);
}
