import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool, ToolCatalog } from '../catalog/catalog';
import { Icon } from '../shared/icon';
@Component({ selector: 'dd-tool-card', imports: [RouterLink, Icon], templateUrl: './tool-card.html', styleUrl: './tool-card.scss' })
export class ToolCard { readonly tool = input.required<Tool>(); readonly catalog = inject(ToolCatalog); }
