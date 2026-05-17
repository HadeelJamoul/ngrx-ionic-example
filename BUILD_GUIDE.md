# ngrx-ionic-example — Complete Build Guide

A step-by-step guide to build this learning project from scratch.  
**Stack:** Angular 20 (standalone) · Ionic 8 · Tailwind CSS 4 · NgRx Global Store · NgRx SignalStore · SCSS

**Estimated time:** 4–5 hours

---

## Table of contents

1. [What you are building](#1-what-you-are-building)
2. [Prerequisites](#2-prerequisites)
3. [Phase 1 — Create the Ionic app](#phase-1--create-the-ionic-app)
4. [Phase 2 — Tailwind CSS (with SCSS)](#phase-2--tailwind-css-with-scss)
5. [Phase 3 — Folder structure, shell tabs, feature pages](#phase-3--folder-structure-shell-tabs-feature-pages)
6. [Phase 4 — Storage service](#phase-4--storage-service)
7. [Phase 5 — NgRx Global Store (Settings)](#phase-5--ngrx-global-store-settings)
8. [Phase 6 — NgRx SignalStore (Tasks)](#phase-6--ngrx-signalstore-tasks)
9. [Phase 7 — README and cleanup](#phase-7--readme-and-cleanup)
10. [Final folder structure](#final-folder-structure)
11. [Troubleshooting](#troubleshooting)
12. [Export this guide as PDF](#export-this-guide-as-pdf)

---

## 1. What you are building

A small Ionic app with **two tabs**. Each tab teaches a different state pattern:

| Tab | Feature | State pattern | Teaches |
|-----|---------|---------------|---------|
| **Settings** | Display name, light/dark theme | **NgRx Global Store** + Effects | App-wide state, persistence, DevTools |
| **Tasks** | Todo list (add / remove) | **NgRx SignalStore** + `rxMethod` | Feature-local state, signals |

**Design rules**

- **Ionic** → UI components (tabs, lists, inputs, buttons).
- **Tailwind** → layout and spacing in HTML templates (`class="..."`).
- **SCSS** → `global.scss` + optional `*.page.scss` when Tailwind is not enough.
- **No comparison** — each NgRx style solves a different scope (global vs feature).
- **Persistence** → `localStorage` via a small `StorageService` (Capacitor later).

```text
┌─────────────────────────────────────────┐
│  Settings page  OR  Tasks page          │  ← features/settings | features/tasks
├─────────────────────────────────────────┤
│  [ Settings ]    [ Tasks ]              │  ← shell/tabs (TabsPage)
└─────────────────────────────────────────┘
         ↑
   app.routes → shell/tabs/tabs.routes
```

---

## 2. Prerequisites

Install on your machine:

- **Node.js** LTS (20 or 22): https://nodejs.org
- **Ionic CLI:** `npm install -g @ionic/cli`

Verify:

```bash
node -v
npm -v
ionic -v
```

---

## Phase 1 — Create the Ionic app

**Goal:** Fresh Ionic Angular **standalone** app with the default tabs template.

### 1.1 Create project

```bash
cd ~/Desktop
ionic start ngrx-ionic-example tabs --type=angular-standalone --capacitor=false
cd ngrx-ionic-example
```

### 1.2 Run and verify

```bash
npm start
```

Open the browser. You should see **Tab 1, Tab 2, Tab 3**.

### 1.3 Git (recommended)

```bash
git init
git add .
git commit -m "Initial Ionic Angular standalone tabs app"
```

### 1.4 `app.config.ts` (modern Angular)

Move providers out of `main.ts` into `src/app/app.config.ts`:

**`src/app/app.config.ts`**

```typescript
import { ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
} from '@angular/router';
import {
  provideIonicAngular,
  IonicRouteStrategy,
} from '@ionic/angular/standalone';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
};
```

**`src/main.ts`**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);
```

**Why?** `main.ts` only boots the app; `app.config.ts` holds all root providers (router, Ionic, later NgRx).

**Commit:** `Add app.config.ts`

---

## Phase 2 — Tailwind CSS (with SCSS)

**Goal:** Tailwind utilities in templates; keep SCSS for global and Ionic styles.

### 2.1 Install packages

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

### 2.2 PostCSS config (project root)

Create **`.postcssrc.json`** next to `package.json`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Angular’s build runs PostCSS on your styles so `@import "tailwindcss"` works.

### 2.3 Update `src/global.scss`

At the **top** of the file, add:

```scss
@import "tailwindcss";
```

For **class-based** dark mode (needed for NgRx theme toggle in Phase 5), use:

```scss
@import "@ionic/angular/css/palettes/dark.class.css";
```

Remove or comment out:

```scss
@import '@ionic/angular/css/palettes/dark.system.css';
```

Keep all other Ionic `@import` lines as they are.

### 2.4 Quick test

On any tab page, inside `ion-content`:

```html
<div class="p-4 text-red-500">Tailwind works</div>
```

Run `npm start`. Red text = success. Remove the test div.

**Commit:** `Add Tailwind via PostCSS`

---

## Phase 3 — Folder structure, shell tabs, feature pages

**Goal:** Replace Tab1/2/3 with **Settings** and **Tasks**; one tab shell in `shell/tabs`.

### 3.1 Target structure

```text
src/app/
  app.component.ts
  app.component.html
  app.routes.ts
  app.config.ts
  core/
    models/
      app-settings.model.ts
      todo.model.ts
    storage/
      storage.service.ts          ← Phase 4
  shell/
    tabs/
      tabs.page.ts                ← tab bar component
      tabs.page.html
      tabs.page.scss
      tabs.routes.ts              ← routes for /tabs/*
  features/
    settings/
      settings.page.ts
      settings.page.html
      settings.page.scss
    tasks/
      tasks.page.ts
      tasks.page.html
      tasks.page.scss
```

### 3.2 Create folders

Create: `core/models`, `core/storage`, `shell/tabs`, `features/settings`, `features/tasks`.

### 3.3 Models

**`core/models/app-settings.model.ts`**

```typescript
export type AppTheme = 'light' | 'dark';

export interface AppSettings {
  displayName: string;
  theme: AppTheme;
}
```

**`core/models/todo.model.ts`**

```typescript
export interface Todo {
  id: string;
  content: string;
}
```

### 3.4 Order of work (important)

Do these **in order**:

| Step | Files | Purpose |
|------|-------|---------|
| **3.5** | `shell/tabs/tabs.page.ts` | Tab bar component class |
| **3.6** | `shell/tabs/tabs.page.html` | Settings + Tasks buttons |
| **3.7** | `shell/tabs/tabs.routes.ts` | URLs → feature pages |
| **3.8** | `app.routes.ts` | App entry → shell routes |
| **3.9** | Feature pages | Standalone Settings + Tasks |
| **3.10** | Delete old template | Remove tab1–3, old `app/tabs` |

You **cannot** write `tabs.routes.ts` before `tabs.page.ts` exists — routes import `TabsPage` from `./tabs.page`.

---

### 3.5 Shell — `shell/tabs/tabs.page.ts`

Copy from old `src/app/tabs/tabs.page.ts`, then change:

- Icons: `settingsOutline`, `checkboxOutline` from `ionicons/icons`
- `addIcons({ settingsOutline, checkboxOutline })`
- `templateUrl: './tabs.page.html'`, `styleUrls: ['./tabs.page.scss']`
- Optional: `changeDetection: ChangeDetectionStrategy.OnPush`
- Remove `EnvironmentInjector` if unused

**Example:**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  constructor() {
    addIcons({ settingsOutline, checkboxOutline });
  }
}
```

---

### 3.6 Shell — `shell/tabs/tabs.page.html`

```html
<ion-tabs>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="settings" href="/tabs/settings">
      <ion-icon aria-hidden="true" name="settings-outline"></ion-icon>
      <ion-label>Settings</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="tasks" href="/tabs/tasks">
      <ion-icon aria-hidden="true" name="checkbox-outline"></ion-icon>
      <ion-label>Tasks</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
```

Copy `tabs.page.scss` from old `app/tabs/` (can stay empty).

**Rule:** `href` must match routes: `/tabs/settings`, `/tabs/tasks`.

---

### 3.7 Shell — `shell/tabs/tabs.routes.ts`

**What it does:** Under `/tabs`, show `TabsPage`; load Settings or Tasks as child routes.

```typescript
import { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'settings',
        loadComponent: () =>
          import('../../features/settings/settings.page').then(
            (m) => m.SettingsPage
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('../../features/tasks/tasks.page').then((m) => m.TasksPage),
      },
      {
        path: '',
        redirectTo: '/tabs/settings',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/settings',
    pathMatch: 'full',
  },
];
```

**Notes:**

- `import('../../features/...')` — from `shell/tabs/`, go up to `app/`, then into `features/`.
- `.then((m) => m.SettingsPage)` — must match **exact** `export class` name in that file.
- `loadComponent` requires **standalone** pages with `imports: [...]` on `@Component`.

---

### 3.8 Update `app.routes.ts`

Point the app at the **new** shell routes (not old `app/tabs/`):

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./shell/tabs/tabs.routes').then((m) => m.routes),
  },
];
```

**Chain:**

```text
app.routes.ts  →  shell/tabs/tabs.routes.ts  →  TabsPage + SettingsPage | TasksPage
```

---

### 3.9 Feature pages (standalone)

Each page needs Ionic `imports` on the component (same pattern as old `tab1.page.ts`).

**`features/settings/settings.page.ts`**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class SettingsPage {}
```

**`features/settings/settings.page.html`** — use Ionic structure + Tailwind on a wrapper `<div>`:

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Settings</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="ion-padding">
  <div class="mx-auto max-w-lg space-y-4 py-4">
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">App settings</h1>
    <p class="text-sm text-zinc-600 dark:text-zinc-400">NgRx global store — Phase 5</p>
  </div>
</ion-content>
```

**`features/tasks/tasks.page.ts`** — same pattern, `export class TasksPage`, selector `app-tasks`.

**`features/tasks/tasks.page.html`** — similar placeholder for Tasks / SignalStore Phase 6.

Fix `styleUrls`: use `'./settings.page.scss'` (not `settings.page.component.scss`).

---

### 3.10 Delete old Ionic template

**Only after** `npm start` shows Settings + Tasks tabs:

Delete folders:

- `src/app/tabs/`
- `src/app/tab1/`, `tab2/`, `tab3/`
- `src/app/explore-container/`

**Commit:** `Restructure: shell tabs, settings and tasks features`

---

## Phase 4 — Storage service

**Goal:** Save/load JSON from `localStorage`.

**`core/storage/storage.service.ts`**

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
```

**Keys:**

- `'app-settings'` → `{ displayName, theme }`
- `'todos'` → `Todo[]`

**Commit:** `Add StorageService`

---

## Phase 5 — NgRx Global Store (Settings)

**Goal:** App-wide settings with Effects and persistence.

### 5.1 Install

```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### 5.2 Files under `features/settings/data-access/`

| File | Role |
|------|------|
| `settings.state.ts` | State interface + initial state |
| `settings.actions.ts` | `createActionGroup` |
| `settings.reducer.ts` | `createReducer` + `on(...)` |
| `settings.feature.ts` | `createFeature` + selectors |
| `settings.effects.ts` | Load/save via `StorageService` |

**State shape:**

```typescript
export interface SettingsState {
  displayName: string;
  theme: 'light' | 'dark';
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}
```

**Actions (example group):**

- `init`, `load`, `loadSuccess`, `loadFailure`
- `setDisplayName`, `setTheme`

**Effects:**

- On `init` → dispatch `load`
- On `load` → read `app-settings` from storage → `loadSuccess` or `loadFailure`
- On `setDisplayName` / `setTheme` → write to storage (fire-and-forget effect with `{ dispatch: false }` or save after state updates)

### 5.3 Register in `app.config.ts`

```typescript
import { isDevMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { settingsFeature } from './features/settings/data-access/settings.feature';
import { SettingsEffects } from './features/settings/data-access/settings.effects';

// Add to providers:
provideStore({ [settingsFeature.name]: settingsFeature.reducer }),
provideEffects([SettingsEffects]),
provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
```

### 5.4 Init on startup

In `AppComponent`, inject `Store` and dispatch `SettingsActions.init()` once.

### 5.5 Apply theme to document

Use `effect()` + `selectSignal(selectTheme)`:

```typescript
effect(() => {
  const isDark = this.theme() === 'dark';
  document.documentElement.classList.toggle('ion-palette-dark', isDark);
  document.documentElement.classList.toggle('dark', isDark);
});
```

### 5.6 Settings UI

- `inject(Store)`, `selectSignal` for name and theme
- `ion-input` for display name → dispatch `setDisplayName`
- Two buttons or `ion-segment` for light / dark → dispatch `setTheme`
- Tailwind for layout only

### 5.7 Verify

- Change name and theme → refresh → values persist
- Redux DevTools shows actions

**Commit:** `Add NgRx global store for settings`

---

## Phase 6 — NgRx SignalStore (Tasks)

**Goal:** Feature-local todo list with SignalStore (no root store for todos).

### 6.1 Install

```bash
npm install @ngrx/signals
```

### 6.2 `features/tasks/data-access/todo.store.ts`

Use:

- `signalStore`, `withState`, `withComputed`, `withMethods`
- `rxMethod` for load/save with `StorageService`
- State: `todos`, `status`, `error`
- Methods: `addTodo`, `removeTodo`, `loadTodos`, persist after mutations

### 6.3 Provide store on route only

In `shell/tabs/tabs.routes.ts`, on the `tasks` route:

```typescript
{
  path: 'tasks',
  loadComponent: () => import('...').then((m) => m.TasksPage),
  providers: [TodoStore],
},
```

### 6.4 Tasks page

```typescript
readonly todoStore = inject(TodoStore);
```

Template:

- `ion-input` + button → `addTodo`
- `@for (todo of todoStore.todos(); track todo.id)` → `ion-item`, tap to remove
- `@if (todoStore.isEmpty())` empty state
- `ngOnInit` → `todoStore.loadTodos()`

### 6.5 Verify

- Add/remove tasks, refresh → list persists
- Settings tab unaffected

**Commit:** `Add NgRx SignalStore for tasks`

---

## Phase 7 — README and cleanup

Create **`README.md`** with:

1. Project purpose (learning repo)
2. `npm install` / `npm start`
3. Architecture diagram (Settings = global store, Tasks = SignalStore)
4. Folder map
5. Links to NgRx and Ionic docs
6. Phase 2 ideas: filters, Capacitor Preferences, `system` theme

Update `package.json` description.

**Commit:** `Add README`

---

## Final folder structure

```text
ngrx-ionic-example/
├── .postcssrc.json
├── angular.json
├── BUILD_GUIDE.md          ← this file
├── package.json
├── src/
│   ├── global.scss
│   ├── main.ts
│   └── app/
│       ├── app.component.ts
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── core/
│       │   ├── models/
│       │   └── storage/
│       ├── shell/tabs/
│       ├── features/
│       │   ├── settings/
│       │   │   ├── data-access/    ← Phase 5
│       │   │   └── settings.page.*
│       │   └── tasks/
│       │       ├── data-access/    ← Phase 6
│       │       └── tasks.page.*
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Still see Tab 1/2/3 | `app.routes` still points to `./tabs/tabs.routes` | Use `./shell/tabs/tabs.routes` |
| `TabsPage` not found | Empty `shell/tabs/tabs.page.ts` | Complete step 3.5 first |
| Lazy route error | Wrong export name in `.then((m) => m.X)` | Match `export class` name exactly |
| Blank page | Page not standalone | Add `imports: [Ion...]` on `@Component` |
| Tailwind not working | Missing `.postcssrc.json` or `@import "tailwindcss"` | Check Phase 2 |
| Dark mode stuck | Still using `dark.system.css` | Switch to `dark.class.css` + toggle `dark` class |
| Two tab systems | Old `app/tabs` not deleted | Delete after new shell works |

---

## Export this guide as PDF

**Option A — VS Code / Cursor**

1. Open `BUILD_GUIDE.md`
2. Install extension “Markdown PDF” (optional)
3. Or: **Markdown: Print (Markdown PDF)** / right-click → Open Preview → Print → Save as PDF

**Option B — Browser**

1. Push to GitHub and view the rendered README, or use a Markdown preview
2. Print page → **Save as PDF**

**Option C — Command line (if `pandoc` installed)**

```bash
cd ~/Desktop/ngrx-ionic-example
pandoc BUILD_GUIDE.md -o BUILD_GUIDE.pdf
```

---

## Progress checklist

- [ ] Phase 1 — Ionic app runs
- [ ] Phase 2 — Tailwind works
- [ ] Phase 3.5 — `shell/tabs/tabs.page.ts`
- [ ] Phase 3.6 — `shell/tabs/tabs.page.html`
- [ ] Phase 3.7 — `shell/tabs/tabs.routes.ts`
- [ ] Phase 3.8 — `app.routes.ts` → shell
- [ ] Phase 3.9 — Settings + Tasks standalone pages
- [ ] Phase 3.10 — Delete old tab1–3, `app/tabs`
- [ ] Phase 4 — StorageService
- [ ] Phase 5 — NgRx global settings
- [ ] Phase 6 — NgRx SignalStore tasks
- [ ] Phase 7 — README

---

*Old Angular 12 tutorial code is reference only — this guide uses modern standalone Angular throughout.*
