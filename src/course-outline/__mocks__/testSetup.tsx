import React from 'react';
import { initializeMocks, render, type RouteOptions, type WrapperOptions, type RenderResult } from '@src/testUtils';
import { CourseOutlineProvider } from '../CourseOutlineContext';
import { OutlineSidebarProvider } from '../outline-sidebar/OutlineSidebarContext';
import type { XBlock } from '@src/data/types';

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

/**
 * Calls initializeMocks() and returns axiosMock + queryClient.
 * Use in each test's beforeEach:
 *   let axiosMock, queryClient;
 *   beforeEach(() => ({ axiosMock, queryClient } = setupCardTestMocks()));
 *
 * Accepts an optional overrides parameter reserved for future mock customization.
 * Mock factories (jest.mock calls at module top level) are hoisted by Jest
 * and must stay in the test file; this helper only handles runtime mocks.
 */
export function setupCardTestMocks(overrides?: Record<string, unknown>) {
  const mocks = initializeMocks();
  return overrides ? { ...mocks, ...overrides } : mocks;
}
