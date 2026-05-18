// actions do noy update the state themselves but they only describe what happens

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AppSettings, AppTheme } from 'src/app/core/models/app-settings.model';

export const SettingsActions = createActionGroup({
  source: 'Settings',
  events: {
    Init: emptyProps(),
    load: emptyProps(),
    'Load Success': props<{ settings: AppSettings }>(),
    'Load Failure': props<{ error: string }>(),
    'Set Display Name': props<{ displayName: string }>(),
    'Set Theme': props<{ theme: AppTheme }>(),
  },
});
