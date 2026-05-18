// when the action happen how the state should change
import { createReducer, on } from '@ngrx/store';
import { initialSettingsState } from './settings.state';
import { SettingsActions } from './settings.actions';

export const settingsReducer = createReducer(
  initialSettingsState,
  on(SettingsActions.load, (state) => ({
    ...state,
    status: 'loading',
    error: null,
  })),
  on(SettingsActions.loadSuccess, (state, { settings }) => ({
    ...state,
    status: 'success',
    displayName: settings.displayName,
    theme: settings.theme,
    error: null,
  })),
  on(SettingsActions.loadFailure, (state, { error }) => ({
    ...state,
    status: 'error',
    error,
  })),

  on(SettingsActions.setDisplayName, (state, { displayName }) => ({
    ...state,
    displayName,
  })),

  on(SettingsActions.setTheme, (state, { theme }) => ({
    ...state,
    theme,
  })),
);
