import { Routes, CanDeactivateFn } from '@angular/router';
import { TOOLS } from './catalog/catalog';
import type { Workspace } from './features/json-formatter/workspace';
const leaveWorkspace: CanDeactivateFn<Workspace> = component => component.canLeave();
export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./home/home').then(m => m.Home), data: { landing: true }, title: 'DevDock — Your everyday developer toolkit' },
  { path: 'tools', loadComponent: () => import('./home/home').then(m => m.Home), title: 'Explore tools · DevDock' },
  { path: 'tools/json-formatter', loadComponent: () => import('./features/json-formatter/workspace').then(m => m.Workspace), canDeactivate: [leaveWorkspace], title: 'JSON Formatter · DevDock' },
  { path: 'tools/file-converter', loadComponent: () => import('./features/file-converter/file-converter').then(m => m.FileConverter), title: 'File Converter · DevDock' },
  ...TOOLS.filter(tool => tool.utility).map(tool => ({ path: `tools/${tool.id}`, loadComponent: () => import('./utilities/utility').then(m => m.Utility), data: { tool: tool.id }, title: `${tool.name} · DevDock` })),
  { path: '**', redirectTo: '' },
];
