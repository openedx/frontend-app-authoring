/**
 * Field-type helpers for Advanced Settings.
 *
 * The input type and the enum options for each setting come from the backend
 * Advanced Settings API (the `type` and `options` fields on each setting), not
 * from a hardcoded frontend table. `getFieldType` maps that backend metadata to
 * the concrete input component the page should render.
 */

export const FIELD_TYPE = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  ENUM: 'enum',
  STRING: 'string',
  JSON: 'json',
} as const;

export type FieldType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];

/** A single choice for an enum field, as returned by the backend (`options`). */
export interface EnumOption {
  value: string;
  displayName?: string;
}

/** The subset of a setting's data needed to decide its input type. */
export interface FieldTypeInput {
  type?: string;
  options?: unknown;
  value?: unknown;
}

/** A setting is an enum when the backend gives it a non-empty list of options. */
export function hasEnumOptions(options: unknown): options is EnumOption[] {
  return Array.isArray(options) && options.length > 0;
}

/**
 * Infers the field type from the value's shape. Used only as a fallback when
 * the backend does not provide a recognized `type` (e.g. an older backend or a
 * custom XBlock field class).
 */
function inferTypeFromValue(value: unknown): FieldType {
  if (typeof value === 'boolean') { return FIELD_TYPE.BOOLEAN; }
  if (typeof value === 'number') { return FIELD_TYPE.NUMBER; }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) { return FIELD_TYPE.JSON; }
  return FIELD_TYPE.STRING;
}

/**
 * Returns the input type for a setting, preferring the backend-provided
 * metadata. The backend `type` (the XBlock field class name) takes precedence:
 * a Boolean stays a toggle and a number stays a number even though XBlock gives
 * those fields a default `values` list. Only string-like fields with a
 * non-empty `options` list become enums. Falls back to inferring from the
 * value's shape for unknown or missing types.
 */
export function getFieldType({ type, options, value }: FieldTypeInput): FieldType {
  switch (type) {
    case 'Boolean':
      return FIELD_TYPE.BOOLEAN;
    case 'Integer':
    case 'Float':
      return FIELD_TYPE.NUMBER;
    case 'List':
    case 'Dict':
      return FIELD_TYPE.JSON;
    case 'String':
    case 'Date':
    case 'Timedelta':
      return hasEnumOptions(options) ? FIELD_TYPE.ENUM : FIELD_TYPE.STRING;
    default:
      // Unknown or missing backend type (e.g. older backend, custom field class).
      if (hasEnumOptions(options)) { return FIELD_TYPE.ENUM; }
      return inferTypeFromValue(value);
  }
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
