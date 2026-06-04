/**
 * Shared test helpers for course-outline tests.
 *
 * Provides `buildTestOutline` — a factory that produces a full `CourseOutline`
 * structure with sensible defaults, replacing the 3,201-line static mock for
 * most test scenarios.
 *
 * Also provides `buildOutlineIndex` — a typed wrapper returning the exact
 * `CourseOutline` interface from `data/types.ts`.
 */

import type { CourseOutline } from '../data/types';

// ---------------------------------------------------------------------------
// NodeSpec — shorthand for a single tree node
// ---------------------------------------------------------------------------
export interface NodeSpec {
  id: string;
  displayName?: string;
  children?: NodeSpec[];
  /** Per-node field overrides merged on top of defaults. */
  overrides?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Typed return shape — reduces `as any` casts in test callers
// ---------------------------------------------------------------------------
/** Strongly-typed view of the fields buildTestOutline always produces. */
export interface TestCourseOutline {
  courseReleaseDate: string;
  courseStructure: {
    id: string;
    displayName: string;
    hasChildren: boolean;
    highlightsEnabledForMessaging: boolean;
    videoSharingEnabled: boolean;
    videoSharingOptions: string;
    start: string;
    end: string;
    actions: Record<string, boolean>;
    hasChanges: boolean;
    enableProctoredExams: boolean;
    enableTimedExams: boolean;
    childInfo: {
      displayName: string;
      /** Typed loosely — individual nodes are Record so overrides don't conflict. */
      children: Record<string, unknown>[];
    };
  };
  deprecatedBlocksInfo: Record<string, unknown>;
  discussionsIncontextLearnmoreUrl: string;
  initialState: Record<string, unknown>;
  initialUserClipboard: Record<string, unknown>;
  languageCode: string;
  lmsLink: string;
  mfeProctoredExamSettingsUrl: string;
  notificationDismissUrl: string;
  proctoringErrors: unknown[];
  reindexLink: string;
  rerunNotificationId: null;
  /** Allow top-level overrides without cast. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Default field values (drawn from courseOutlineIndex mock)
// ---------------------------------------------------------------------------
const BASE_NODE_FIELDS = {
  locator: '',
  usageKey: '',
  editedOn: '2023-08-23T12:35:00Z',
  editedOnRaw: '2023-08-23T12:35:00Z',
  published: true,
  publishedOn: '2023-08-23T11:32:00Z',
  studioUrl: '',
  releasedToStudents: false,
  releaseDate: '',
  visibilityState: '',
  hasExplicitStaffLock: false,
  start: '',
  graded: false,
  dueDate: '',
  hasChanges: false,
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  userPartitions: [],
  showCorrectness: 'always' as const,
  highlights: [],
  highlightsEnabled: false,
  highlightsPreviewOnly: false,
  highlightsDocUrl: '',
  ancestorHasStaffLock: false,
  staffOnlyMessage: false,
  hasPartitionGroupComponents: false,
  enableCopyPasteUnits: false,
  isHeaderVisible: true,
  groupAccess: {},
};

// ---------------------------------------------------------------------------
// Default tree — 4 sections with uneven nesting, enough for section-list tests
// ---------------------------------------------------------------------------
const DEFAULT_SECTIONS: NodeSpec[] = [
  {
    id: 'block-v1:test+course+2025+type@chapter+block@section-1',
    displayName: 'Section 1',
    children: [
      {
        id: 'block-v1:test+course+2025+type@sequential+block@subsection-1a',
        displayName: 'Subsection 1A',
        children: [
          { id: 'block-v1:test+course+2025+type@vertical+block@unit-1a1', displayName: 'Unit 1A1' },
        ],
      },
    ],
  },
  {
    id: 'block-v1:test+course+2025+type@chapter+block@section-2',
    displayName: 'Section 2',
    children: [
      { id: 'block-v1:test+course+2025+type@sequential+block@subsection-2a', displayName: 'Subsection 2A' },
      {
        id: 'block-v1:test+course+2025+type@sequential+block@subsection-2b',
        displayName: 'Subsection 2B',
        children: [
          { id: 'block-v1:test+course+2025+type@vertical+block@unit-2b1', displayName: 'Unit 2B1' },
          { id: 'block-v1:test+course+2025+type@vertical+block@unit-2b2', displayName: 'Unit 2B2' },
        ],
      },
    ],
  },
  {
    id: 'block-v1:test+course+2025+type@chapter+block@section-3',
    displayName: 'Section 3',
  },
  {
    id: 'block-v1:test+course+2025+type@chapter+block@section-4',
    displayName: 'Section 4',
    children: [],
  },
];

// ---------------------------------------------------------------------------
// Internal node builder
// ---------------------------------------------------------------------------
function buildNode(spec: NodeSpec, category: string): Record<string, unknown> {
  const childCategory = category === 'chapter' ? 'sequential' : 'vertical';
  const children = (spec.children || []).map((c) => buildNode(c, childCategory));
  const displayName = spec.displayName || spec.id;

  const node: Record<string, unknown> = {
    ...BASE_NODE_FIELDS,
    id: spec.id,
    locator: spec.id,
    usageKey: spec.id,
    displayName,
    category,
    hasChildren: children.length > 0,
    ...(spec.overrides || {}),
  };

  // Every node gets childInfo — leaf nodes get empty children array.
  node.childInfo = { displayName, children, category };

  return node;
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

/**
 * Build a `CourseOutline`-shaped object for tests.
 *
 * Calling conventions (all produce the same shape):
 *
 *   // No args — 4 default sections
 *   buildTestOutline()
 *
 *   // Shorthand — array of top-level sections
 *   buildTestOutline([{ id: 'sec-1' }, { id: 'sec-2', children: [{ id: 'sub-1' }] }])
 *
 *   // Options — explicit sections + top-level overrides
 *   buildTestOutline({
 *     sections: [{ id: 'sec-1', overrides: { hasExplicitStaffLock: true } }],
 *     overrides: { languageCode: 'fr' },
 *   })
 *
 * Top-level `overrides.courseStructure` is deep-merged (shallow copy at
 * courseStructure level) so that childInfo and actions defaults are preserved.
 */
export function buildTestOutline(
  arg?: NodeSpec[] | { sections?: NodeSpec[]; overrides?: Record<string, unknown>; },
): TestCourseOutline {
  let sections: NodeSpec[];
  let topOverrides: Record<string, unknown>;

  if (!arg) {
    sections = DEFAULT_SECTIONS;
    topOverrides = {};
  } else if (Array.isArray(arg)) {
    sections = arg;
    topOverrides = {};
  } else {
    sections = arg.sections ?? DEFAULT_SECTIONS;
    topOverrides = arg.overrides ?? {};
  }

  const children = sections.map((s) => buildNode(s, 'chapter'));

  const result: TestCourseOutline = {
    courseReleaseDate: '',
    courseStructure: {
      id: 'block-v1:test+course+2025+type@course+block@course',
      displayName: 'Test Course',
      hasChildren: children.length > 0,
      highlightsEnabledForMessaging: false,
      videoSharingEnabled: false,
      videoSharingOptions: 'per-video',
      start: '',
      end: '',
      actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
      hasChanges: false,
      enableProctoredExams: false,
      enableTimedExams: false,
      childInfo: { displayName: 'Course', children },
    },
    deprecatedBlocksInfo: { deprecatedEnabledBlockTypes: [], blocks: [] },
    discussionsIncontextLearnmoreUrl: '',
    initialState: { expandedLocators: [], locatorToShow: '' },
    initialUserClipboard: {},
    languageCode: 'en',
    lmsLink: '',
    mfeProctoredExamSettingsUrl: '',
    notificationDismissUrl: '',
    proctoringErrors: [],
    reindexLink: '',
    rerunNotificationId: null,
  };

  // Shallow-merge top-level overrides (courseStructure handled separately)
  const { courseStructure: csOverride, ...restOverrides } = topOverrides;
  Object.assign(result, restOverrides);

  // Deep-merge courseStructure to preserve childInfo, actions and other defaults
  if (csOverride && typeof csOverride === 'object' && !Array.isArray(csOverride)) {
    Object.assign(result.courseStructure as Record<string, unknown>, csOverride as Record<string, unknown>);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Typed wrapper — returns exact CourseOutline type
// ---------------------------------------------------------------------------

/**
 * Build a `CourseOutline`-typed object for tests.
 *
 * Thin typed wrapper around `buildTestOutline` that returns the exact
 * `CourseOutline` interface from `data/types.ts`. All calling conventions
 * from `buildTestOutline` are supported:
 *
 *   // No args — 4 default sections
 *   buildOutlineIndex()
 *
 *   // Shorthand — array of top-level sections
 *   buildOutlineIndex([{ id: 'sec-1' }, ...])
 *
 *   // Options — explicit sections + top-level overrides
 *   buildOutlineIndex({ sections: [...], overrides: { ... } })
 *
 * Optional `CourseOutline` fields (discussionsSettings, advanceSettingsUrl,
 * isCustomRelativeDatesActive, createdOn) are absent by default; tests that
 * need them pass them via `overrides`.
 */
export function buildOutlineIndex(
  arg?: NodeSpec[] | { sections?: NodeSpec[]; overrides?: Record<string, unknown>; },
): CourseOutline {
  const result = buildTestOutline(arg);
  return {
    ...result,
    // Narrow proctoringErrors from unknown[] to string[]
    proctoringErrors: result.proctoringErrors as string[],
  } as unknown as CourseOutline;
}
