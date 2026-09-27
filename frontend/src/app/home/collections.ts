import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToolCatalog } from '../catalog/catalog';
import { Icon } from '../shared/icon';
@Component({ selector: 'dd-collections', imports: [RouterLink, Icon], templateUrl: './collections.html', styleUrl: './collections.scss' })
export class Collections { readonly catalog = inject(ToolCatalog); count(id: string) { return this.catalog.tools.filter(tool => tool.category === id).length; } }
