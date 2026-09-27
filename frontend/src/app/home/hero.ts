import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodePreview } from './code-preview';
import { Icon } from '../shared/icon';
import { CATEGORIES, TOOLS } from '../catalog/catalog';
@Component({ selector: 'dd-hero', imports: [RouterLink, Icon, CodePreview], templateUrl: './hero.html', styleUrl: './hero.scss' })
export class Hero { readonly count = TOOLS.length; readonly categories = CATEGORIES.length; }
