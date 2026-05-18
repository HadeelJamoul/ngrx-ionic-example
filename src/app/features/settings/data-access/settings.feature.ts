import { createFeature } from "@ngrx/store";
import { settingsReducer } from "./settings.reducer";

export const settingsFeature = createFeature({
    name: 'settings',
    reducer: settingsReducer,
});

export const {
    name: settingsFeatureKey,
    reducer,
    selectSettingsState,
    selectDisplayName,
    selectTheme,
    selectStatus,
    selectError,
} = settingsFeature;