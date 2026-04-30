/**
 * Shared types for the Advanced Settings subsystem.
 */

export interface SettingData {
  deprecated?: boolean;
  help?: string;
  displayName: string;
  value?: string | boolean | number | Record<string, unknown> | unknown[];
}

/** A [settingKey, settingData] tuple as returned by Object.entries on the settings map. */
export type SettingEntry = [string, SettingData];

/** Callback signatures shared across input components and section components. */
export type SetEditedSettings = (
  updater: (prev: Record<string, string>) => Record<string, string>,
) => void;
