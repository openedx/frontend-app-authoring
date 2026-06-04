/**
 * Shared card test factory for SectionCard / SubsectionCard / UnitCard.
 *
 * Extracts ~8 structurally identical test blocks into a parameterized
 * describeCard() call so each card test file keeps only its unique tests.
 *
 * NOTE: jest.mock() calls remain in each test file (Jest hoisting
 * requirement). This module provides the test bodies and beforeEach
 * setup, closing over mutable handles from testSetup.
 */
import React from 'react';
import { getConfig, setConfig } from '@edx/frontend-platform';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import { userEvent } from '@testing-library/user-event';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import { Info } from '@openedx/paragon/icons';
import { CourseInfoSidebar } from '@src/course-outline/outline-sidebar/info-sidebar/CourseInfoSidebar';
import * as OutlineSidebarContext from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import {
  mockAcceptLibBlockChanges,
  mockIgnoreLibBlockChanges,
  setupCardTestMocks,
} from './testSetup';

/** Props that can be passed through to the card under test. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = Record<string, any>;

export interface CardTestConfig {
  /** Display name in describe() — e.g. 'SectionCard'. */
  name: string;
  /** data-testid on the card root — e.g. 'section-card'. */
  testId: string;
  /** data-testid on the card header — e.g. 'section-card-header'. */
  headerTestId: string;
  /** The primary mock block (section / subsection / unit). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockBlock: any;
  /**
   * Render the card with optional prop overrides and URL entry.
   * Must call renderCard from testSetup so the component is wrapped with
   * CourseOutlineProvider + OutlineSidebarProvider.
   */
  render: (props?: AnyProps, entry?: string) => { container: HTMLElement; };
  /** data-testid for child container (expand/collapse) — optional. */
  expandTestId?: string;
  /** aria-label / name for the "add child" button — optional. */
  childAddLabel?: string;
  /** Whether this card has expand/collapse behavior. */
  hasExpandCollapse?: boolean;
  /** NodeName for the sync preview modal heading (e.g. 'section name'). */
  syncNodeName: string;
  /**
   * Custom assertion for the align sidebar test.
   * Default: checks setSelectedContainerState with currentId + sectionId + index.
   * Pass null to skip the setSelectedContainerState check entirely.
   */
  alignAssert?: ((mockSetSelectedContainerState: jest.Mock) => void) | null;
  /** Skip the align sidebar test entirely (e.g. when OutlineSidebarContext is pre-mocked). */
  skipAlignTest?: boolean;
  /** Extra assertions to run inside the "renders correctly" test. */
  extraRenderAssertions?: () => void;
  /** Skip the "hides actions by flag" test (UnitCard has no childAddable). */
  skipActionsHideTest?: boolean;
  /**
   * Custom assertion for the "hide actions" test after the menu opens.
   * Default: checks duplicate + delete buttons hidden.
   */
  extraActionsHideAssertions?: () => void;
  /** The prop key used to pass the primary block (e.g. 'section', 'subsection', 'unit'). */
  blockPropKey: string;
}

/**
 * Define the 8 shared card tests inside a describe() block.
 */
export function describeCard(config: CardTestConfig): void {
  describe(`<${config.name}>`, () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let axiosMock: any;

    beforeEach(() => {
      const mocks = setupCardTestMocks();
      axiosMock = mocks.axiosMock;
      // Seed the item cache so the card's useCourseItemData resolves
      axiosMock
        .onGet(getXBlockApiUrl(config.mockBlock.id))
        .reply(200, config.mockBlock);
    });

    // ─── 1. renders correctly ──────────────────────────────────────
    it(`render ${config.name} component correctly`, () => {
      const { container } = config.render();

      expect(screen.getByTestId(config.headerTestId)).toBeInTheDocument();
      const card = screen.getByTestId(config.testId);
      expect(card).not.toHaveClass('outline-card-selected');
      config.extraRenderAssertions?.();
      void container;
    });

    // ─── 2. renders in selected state ───────────────────────────────
    it(`render ${config.name} component in selected state`, async () => {
      const user = userEvent.setup();
      const { container } = config.render();

      expect(screen.getByTestId(config.headerTestId)).toBeInTheDocument();
      const card = screen.getByTestId(config.testId);
      expect(card).not.toHaveClass('outline-card-selected');

      const el = container.querySelector('div.row.mx-0') as HTMLElement;
      expect(el).not.toBeNull();
      await user.click(el!);

      expect(card).toHaveClass('outline-card-selected');
    });

    // ─── 3. menu does not select ────────────────────────────────────
    it(`does not select ${config.name.toLowerCase()} when menu opens`, async () => {
      const user = userEvent.setup();
      config.render();

      const card = screen.getByTestId(config.testId);
      const menuButton = await screen.findByTestId(`${config.headerTestId}__menu-button`);
      await user.click(menuButton);

      expect(card).not.toHaveClass('outline-card-selected');
    });

    // ─── 4. hides header ────────────────────────────────────────────
    it('hides header based on isHeaderVisible flag', () => {
      config.render({
        [config.blockPropKey]: { ...config.mockBlock, isHeaderVisible: false },
      });
      expect(screen.queryByTestId(config.headerTestId)).not.toBeInTheDocument();
    });

    // ─── 5. hides actions based on flags ────────────────────────────
    if (!config.skipActionsHideTest) {
      it('hides add new, duplicate & delete option based on childAddable, duplicable & deletable action flag', async () => {
        const mockData = {
          ...config.mockBlock,
          actions: { draggable: true, childAddable: false, deletable: false, duplicable: false },
        };
        axiosMock
          .onGet(getXBlockApiUrl(config.mockBlock.id))
          .reply(200, mockData);
        config.render({ [config.blockPropKey]: mockData });

        const element = await screen.findByTestId(config.testId);
        const menu = await within(element).findByTestId(`${config.headerTestId}__menu-button`);
        await act(async () => fireEvent.click(menu));
        expect(within(element).queryByTestId(`${config.headerTestId}__menu-duplicate-button`))
          .not.toBeInTheDocument();
        expect(within(element).queryByTestId(`${config.headerTestId}__menu-delete-button`))
          .not.toBeInTheDocument();

        if (config.childAddLabel) {
          expect(screen.queryByRole('button', { name: config.childAddLabel }))
            .not.toBeInTheDocument();
        }
        config.extraActionsHideAssertions?.();
      });
    }

    // ─── 6. sync upstream ───────────────────────────────────────────
    it(`should sync ${config.name.toLowerCase()} changes from upstream`, async () => {
      config.render();

      expect(await screen.findByTestId(config.headerTestId)).toBeInTheDocument();

      const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
      fireEvent.click(syncButton);

      expect(screen.getByRole('heading', {
        name: new RegExp(`preview changes: ${config.syncNodeName}`, 'i'),
      })).toBeInTheDocument();

      const acceptChangesButton = screen.getByText(/accept changes/i);
      fireEvent.click(acceptChangesButton);

      await waitFor(() => expect(mockAcceptLibBlockChanges).toHaveBeenCalled());
    });

    // ─── 7. decline upstream ────────────────────────────────────────
    it(`should decline sync ${config.name.toLowerCase()} changes from upstream`, async () => {
      config.render();

      expect(await screen.findByTestId(config.headerTestId)).toBeInTheDocument();

      const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
      fireEvent.click(syncButton);

      expect(screen.getByRole('heading', {
        name: new RegExp(`preview changes: ${config.syncNodeName}`, 'i'),
      })).toBeInTheDocument();

      const ignoreChangesButton = screen.getByRole('button', { name: /ignore changes/i });
      fireEvent.click(ignoreChangesButton);

      expect(screen.getByRole('heading', { name: /ignore these changes\?/i })).toBeInTheDocument();

      const ignoreButton = screen.getByRole('button', { name: /ignore/i });
      fireEvent.click(ignoreButton);

      await waitFor(() => expect(mockIgnoreLibBlockChanges).toHaveBeenCalled());
    });

    // ─── 8. open align sidebar ──────────────────────────────────────
    if (!config.skipAlignTest) {
      it('should open align sidebar', async () => {
        const user = userEvent.setup();
        const mockSetCurrentPageKey = jest.fn();
        const mockSetSelectedContainerState = jest.fn();

        const testSidebarPage = {
          component: CourseInfoSidebar,
          icon: Info,
          title: '',
        };

        jest
          .spyOn(OutlineSidebarContext, 'useOutlineSidebarContext')
          .mockImplementation(() => ({
            setCurrentPageKey: mockSetCurrentPageKey,
            currentPageKey: 'info',
            sidebarPages: {
              info: testSidebarPage,
              help: testSidebarPage,
              add: testSidebarPage,
            },
            currentTabKey: 'info',
            setCurrentTabKey: jest.fn(),
            openContainerSidebar: jest.fn(),
            isOpen: true,
            open: jest.fn(),
            toggle: jest.fn(),
            currentFlow: undefined,
            startCurrentFlow: jest.fn(),
            stopCurrentFlow: jest.fn(),
            openContainerInfoSidebar: jest.fn(),
            clearSelection: jest.fn(),
            setSelectedContainerState: mockSetSelectedContainerState,
          }));
        setConfig({
          ...getConfig(),
          ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
        });
        config.render();
        const element = await screen.findByTestId(config.testId);
        const menu = await within(element).findByTestId(`${config.headerTestId}__menu-button`);
        await user.click(menu);

        const manageTagsBtn = await within(element).findByTestId(`${config.headerTestId}__menu-manage-tags-button`);
        expect(manageTagsBtn).toBeInTheDocument();

        await user.click(manageTagsBtn);

        await waitFor(() => {
          expect(mockSetCurrentPageKey).toHaveBeenCalledWith('align');
        });

        if (config.alignAssert) {
          config.alignAssert(mockSetSelectedContainerState);
        } else if (config.alignAssert !== null) {
          // Default: check setSelectedContainerState with currentId + sectionId + index
          expect(mockSetSelectedContainerState).toHaveBeenCalledWith({
            currentId: config.mockBlock.id,
            sectionId: config.mockBlock.id,
            index: 1,
          });
        }
      });
    }
  });
}
