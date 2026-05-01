/**
 * Derives all field-type-related exports from SETTINGS_CONFIG.
 * This file exists for backward compatibility — consumers can import
 * directly from settingsConfig.ts in the future.
 */
import { FIELD_TYPE, SETTINGS_CONFIG } from './settingsConfig';
import type { FieldType } from './settingsConfig';

export type { FieldType, EnumOption } from './settingsConfig';
export { FIELD_TYPE };

/**
 * NOTE: The `label` field in each option is an English-only fallback used when
 * a value has no entry in ENUM_LABEL_MESSAGES (fieldTypeMessages.ts).
 * All current values are covered there. When adding new options, always add
 * a corresponding i18n message — never rely on `label` for user-visible text.
 */
export const ENUM_OPTIONS: Record<string, Array<{ value: string; label: string }>> = Object.fromEntries(
  SETTINGS_CONFIG.flatMap((cat) => cat.fields
    .filter((f) => f.enumOptions)
    .map((f) => [f.key, f.enumOptions!])),
);

const BOOLEAN_KEYS = new Set<string>(
  SETTINGS_CONFIG.flatMap((cat) => cat.fields
    .filter((f) => f.type === FIELD_TYPE.BOOLEAN)
    .map((f) => f.key)),
);

const NUMBER_KEYS = new Set<string>(
  SETTINGS_CONFIG.flatMap((cat) => cat.fields
    .filter((f) => f.type === FIELD_TYPE.NUMBER)
    .map((f) => f.key)),
);

/**
 * Returns the field type for a given setting key and its current value.
 * Key-based overrides are checked first to handle null/empty API values correctly.
 */
export function getFieldType(key: string, value: unknown): FieldType {
  if (BOOLEAN_KEYS.has(key)) { return FIELD_TYPE.BOOLEAN; }
  if (NUMBER_KEYS.has(key)) { return FIELD_TYPE.NUMBER; }
  if (ENUM_OPTIONS[key]) { return FIELD_TYPE.ENUM; }
  if (typeof value === 'boolean') { return FIELD_TYPE.BOOLEAN; }
  if (typeof value === 'number') { return FIELD_TYPE.NUMBER; }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) { return FIELD_TYPE.JSON; }
  return FIELD_TYPE.STRING;
}

/**
 * Serializes a native value back to a JSON-compatible string
 * that can be stored in editedSettings and processed by parseArrayOrObjectValues.
 */
export function serializeValue(nativeValue: unknown, fieldType: FieldType): string {
  if (fieldType === FIELD_TYPE.BOOLEAN) { return String(nativeValue); }
  if (fieldType === FIELD_TYPE.NUMBER) { return String(nativeValue); }
  if (fieldType === FIELD_TYPE.ENUM || fieldType === FIELD_TYPE.STRING) {
    return JSON.stringify(nativeValue);
  }
  return nativeValue as string; // JSON type — already a string
}
