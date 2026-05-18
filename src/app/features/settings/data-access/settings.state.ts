import { AppTheme } from 'src/app/core/models/app-settings.model';

export interface SettingsState {
  displayName: string;
  theme: AppTheme;
  status: 'idle' | 'loading' | 'error' | 'success';
  error: string | null;
}

export const initialSettingsState: SettingsState = {
  displayName: '',
  theme: 'light',
  status: 'idle',
  error: null,
};
