/**
 * Derives all category-related exports from SETTINGS_CONFIG.
 * This file exists for backward compatibility — consumers can import
 * directly from settingsConfig.ts in the future.
 */
import { SETTINGS_CONFIG } from './settingsConfig';

export const SETTINGS_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  SETTINGS_CONFIG.flatMap((cat) => cat.fields.map((f) => [f.key, cat.id])),
);

export const CATEGORY_ORDER: string[] = SETTINGS_CONFIG.map((cat) => cat.id);

export const UNCATEGORIZED = 'Other';

export const CATEGORY_GENERAL_SETTING = 'General Setting';
export const CATEGORY_CONTENT_BLOCKS = 'Content Blocks';
export const CATEGORY_GRADING = 'Grading';
export const CATEGORY_SCHEDULE = 'Schedule';
export const CATEGORY_CERTIFICATES = 'Certificates';
export const CATEGORY_ENROLLMENT_PAGE = 'Enrollment Page';
export const CATEGORY_PAGES_AND_RESOURCES = 'Pages & Resources';
export const CATEGORY_SPECIAL_EXAMS = 'Special Exams';
export const CATEGORY_MOBILE = 'Mobile';
export const CATEGORY_INSTRUCTORS = 'Instructors';
export const CATEGORY_LEGACY_DISCUSSION = 'Legacy Discussion';
export const CATEGORY_LIBRARIES = 'Libraries';
export const CATEGORY_OTHER = 'Other';

const contentBlocksCat = SETTINGS_CONFIG.find((cat) => cat.id === CATEGORY_CONTENT_BLOCKS)!;

export const CONTENT_BLOCKS_SUBCATEGORY_MAP: Record<string, string> = Object.fromEntries(
  contentBlocksCat.fields
    .filter((f) => f.subcategory)
    .map((f) => [f.key, f.subcategory!]),
);

export const CONTENT_BLOCKS_SUBCATEGORY_ORDER: string[] = contentBlocksCat.subcategoryOrder ?? [];
