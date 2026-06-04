import React from 'react';
import { initializeMocks, render, type RouteOptions, type WrapperOptions, type RenderResult } from '@src/testUtils';
import { CourseOutlineProvider } from '../CourseOutlineContext';
import { OutlineSidebarProvider } from '../outline-sidebar/OutlineSidebarContext';
import type { XBlock } from '@src/data/types';

// ─── Shared jest.mock handles ───────────────────────────────────────────
// Test files that share common jest.mock() boilerplate can import these
// handles instead of defining their own jest.fn() variables. The jest.mock()
// calls themselves must stay in each test file (Jest hoisting requires it),
// but the mutable handles are centralized here for consistent reset behavior.

export const mockAcceptLibBlockChanges = jest.fn();
export const mockIgnoreLibBlockChanges = jest.fn();
export const mockOpenPublishModal = jest.fn();
export const mockHandleAddAndOpenUnit = { mutateAsync: jest.fn(), isPending: false };
export const mockHandleAddBlock = { isPending: false, mutateAsync: jest.fn(), mutate: jest.fn() };

/**
 * Shared mutable context for the CourseAuthoringContext mock.
 * Test files set `jest.mock('@src/CourseAuthoringContext', () => ({
 *   useCourseAuthoringContext: () => mockCardAuthoringContext,
 * }))` and then mutate this object per-test.
 */
export const mockCardAuthoringContext: Record<string, unknown> = {
  courseId: '5',
  getUnitUrl: (id: string) => `/some/${id}`,
  openUnlinkModal: jest.fn(),
};

/**
 * Extra fields merged into the useCourseOutlineContext return value.
 * Test-specific jest.mock factories for CourseOutlineContext should spread
 * this object so per-test overrides take effect:
 *
 *   jest.mock('@src/course-outline/CourseOutlineContext', () => {
 *     const realModule = jest.requireActual('...');
 *     return {
 *       ...realModule,
 *       useCourseOutlineContext: () => ({
 *         ...realModule.useCourseOutlineContext(),
 *         openPublishModal: mockOpenPublishModal,
 *         ...mockCourseOutlineContextOverrides,
 *       }),
 *     };
 *   });
 */
export const mockCourseOutlineContextOverrides: Record<string, unknown> = {};

// ─── Shared provider wrapper ─────────────────────────────────────────────

interface CardTestProvidersProps {
  children: React.ReactNode;
}

/**
 * Wraps children with the providers needed by card component tests:
 * CourseOutlineProvider + OutlineSidebarProvider.
 */
export const CardTestProviders = ({ children }: CardTestProvidersProps) => (
  <CourseOutlineProvider>
    <OutlineSidebarProvider>
      {children}
    </OutlineSidebarProvider>
  </CourseOutlineProvider>
);

// ─── Common block mocks ──────────────────────────────────────────────────

/** Minimal module-level mock unit block. */
export const mockUnit: XBlock = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@unit+block@0',
  displayName: 'unit Name',
  category: 'vertical',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
  isHeaderVisible: true,
  upstreamInfo: {
    readyToSync: true,
    upstreamRef: 'lct:org1:lib1:unit:1',
    versionSynced: 1,
    versionAvailable: 2,
    versionDeclined: null,
    errorMessage: null,
    downstreamCustomized: [] as string[],
    upstreamName: 'Upstream',
  },
} satisfies Partial<XBlock> as XBlock;

/** Minimal module-level mock subsection block. */
export const mockSubsection: XBlock = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@0',
  displayName: 'Subsection Name',
  category: 'sequential',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
  isHeaderVisible: true,
  releasedToStudents: true,
  childInfo: {
    children: [mockUnit],
  } as any,
  upstreamInfo: {
    readyToSync: true,
    upstreamRef: 'lct:org1:lib1:subsection:1',
    versionSynced: 1,
    versionAvailable: 2,
    versionDeclined: null,
    errorMessage: null,
    downstreamCustomized: [] as string[],
    upstreamName: 'Upstream',
  },
} satisfies Partial<XBlock> as XBlock;

/** Minimal module-level mock section block. */
export const mockSection: XBlock = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@section+block@0',
  displayName: 'Section Name',
  category: 'chapter',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
  isHeaderVisible: true,
  childInfo: {
    children: [mockSubsection],
  } as any,
  upstreamInfo: {
    readyToSync: true,
    upstreamRef: 'lct:org1:lib1:section:1',
    versionSynced: 1,
    versionAvailable: 2,
    versionDeclined: null,
    errorMessage: null,
    downstreamCustomized: [] as string[],
    upstreamName: 'Upstream',
  },
} satisfies Partial<XBlock> as XBlock;

// ─── renderCard — one-stop render with providers ───────────────────────

/** Options accepted by renderCard, combining testUtils render + wrapper options. */
export interface RenderCardOptions extends WrapperOptions, RouteOptions {}

/**
 * Render a component wrapped with CardTestProviders.
 *
 * Composes the caller's extraWrapper (if any) **outside** CardTestProviders,
 * so the wrapper nesting is:
 *   [standard testUtils providers] → callerExtraWrapper → CardTestProviders → ui
 *
 * Forward route options (path, params, routerProps) to @src/testUtils render.
 *
 * Import this instead of `render` from @src/testUtils in card/header tests.
 * Mock factories (jest.mock calls) remain at module top level due to hoisting;
 * this function only handles provider composition.
 *
 * @example
 *   renderCard(<UnitCard ... />, { path: '/course/:courseId', params: { courseId: '5' } })
 *
 *   // With custom wrapper outside CardTestProviders:
 *   renderCard(<HeaderActions ... />, {
 *     extraWrapper: ({ children }) => <CourseAuthoringProvider courseId="1">{children}</CourseAuthoringProvider>,
 *   })
 */
export function renderCard(ui: React.ReactElement, options: RenderCardOptions = {}): RenderResult {
  const { extraWrapper: callerExtraWrapper, ...routeOptions } = options;

  return render(ui, {
    ...routeOptions,
    extraWrapper: ({ children }) => {
      let content = <CardTestProviders>{children}</CardTestProviders>;
      if (callerExtraWrapper) {
        content = React.createElement(callerExtraWrapper, undefined, content);
      }
      return content;
    },
  });
}

// ─── Test setup helper ───────────────────────────────────────────────────

/** Options for setupCardTestMocks(). */
export interface SetupCardTestMocksOptions {
  /** Override the default courseId in the CourseAuthoringContext mock. */
  courseId?: string | number;
  /**
   * Partial fields merged into mockCardAuthoringContext.
   * Use e.g. `{ getUnitUrl: (id) => '/custom/${id}' }`.
   */
  authoringContext?: Record<string, unknown>;
  /**
   * Extra fields merged into the useCourseOutlineContext return value.
   * Shorthand for mutating `mockCourseOutlineContextOverrides` directly.
   */
  courseOutlineContext?: Record<string, unknown>;
  /** Override default handleAddAndOpenUnit (default: { mutateAsync: jest.fn(), isPending: false }). */
  handleAddAndOpenUnit?: { mutateAsync: jest.Mock; isPending: boolean; };
  /** Override default handleAddBlock (default: { mutateAsync: jest.fn(), mutate: jest.fn(), isPending: false }). */
  handleAddBlock?: { mutateAsync: jest.Mock; mutate: jest.Mock; isPending: boolean; };
}

/**
 * Calls initializeMocks() and resets shared mock handles to defaults.
 * Use in each test's beforeEach:
 *   let axiosMock, queryClient;
 *   beforeEach(() => ({ axiosMock, queryClient } = setupCardTestMocks()));
 *
 * Accepts optional overrides for per-test customisation:
 *   setupCardTestMocks({ courseId: 123, courseOutlineContext: { handleAddBlock: {} } })
 *
 * Mock factories (jest.mock calls) must remain at module top level in each
 * test file (Jest hoisting requirement), but the mutable handles they close
 * over are reset here.
 */
export function setupCardTestMocks(overrides?: SetupCardTestMocksOptions): ReturnType<typeof initializeMocks> {
  // Reset shared mock handles so per-test mutations don't bleed
  mockAcceptLibBlockChanges.mockReset();
  mockIgnoreLibBlockChanges.mockReset();
  mockOpenPublishModal.mockReset();
  mockHandleAddAndOpenUnit.mutateAsync.mockReset();
  mockHandleAddAndOpenUnit.isPending = false;
  mockHandleAddBlock.mutateAsync.mockReset();
  mockHandleAddBlock.mutate.mockReset();
  mockHandleAddBlock.isPending = false;

  // Reset authoring context fields to defaults
  mockCardAuthoringContext.courseId = '5';
  mockCardAuthoringContext.getUnitUrl = (id: string) => `/some/${id}`;

  // Remove any extra keys added by per-test overrides
  Object.keys(mockCardAuthoringContext).forEach((k) => {
    if (!['courseId', 'getUnitUrl', 'openUnlinkModal'].includes(k)) {
      delete mockCardAuthoringContext[k];
    }
  });

  // Reset course outline context overrides
  Object.keys(mockCourseOutlineContextOverrides).forEach(
    (k) => delete mockCourseOutlineContextOverrides[k],
  );

  // Apply per-test overrides
  if (overrides) {
    if (overrides.courseId !== undefined) {
      mockCardAuthoringContext.courseId = overrides.courseId;
    }
    if (overrides.authoringContext) {
      Object.assign(mockCardAuthoringContext, overrides.authoringContext);
    }
    if (overrides.courseOutlineContext) {
      Object.assign(mockCourseOutlineContextOverrides, overrides.courseOutlineContext);
    }
    if (overrides.handleAddAndOpenUnit) {
      mockHandleAddAndOpenUnit.mutateAsync = overrides.handleAddAndOpenUnit.mutateAsync;
      mockHandleAddAndOpenUnit.isPending = overrides.handleAddAndOpenUnit.isPending;
    }
    if (overrides.handleAddBlock) {
      Object.assign(mockHandleAddBlock, overrides.handleAddBlock);
    }
  }

  return initializeMocks();
}
