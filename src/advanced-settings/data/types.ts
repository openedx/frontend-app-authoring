/**
 * Shared types for the Advanced Settings subsystem.
 */

import type { EnumOption } from './fieldTypes';

export interface SettingData {
  deprecated?: boolean;
  help?: string;
  displayName: string;
  value?: string | boolean | number | Record<string, unknown> | unknown[];
  /** XBlock field class name from the backend (e.g. "String", "Boolean", "Integer"). */
  type?: string;
  /**
   * Valid choices for the field, from the backend. A list of options for enum
   * fields, a constraints object (e.g. `{ min: 0 }`) for some numeric fields,
   * or null/undefined for free-form fields.
   */
  options?: EnumOption[] | Record<string, unknown> | null;
}

/** A [settingKey, settingData] tuple as returned by Object.entries on the settings map. */
export type SettingEntry = [string, SettingData];

/** Callback signatures shared across input components and section components. */
export type SetEditedSettings = (
  updater: (prev: Record<string, string>) => Record<string, string>,
) => void;
