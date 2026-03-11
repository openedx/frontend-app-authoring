import {
  act, fireEvent, initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';
import { getConfig } from '@edx/frontend-platform';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

import { XBlock } from '@src/data/types';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';

const mockUseAcceptLibraryBlockChanges = jest.fn();
const mockUseIgnoreLibraryBlockChanges = jest.fn();
const mockUseUnitHandler = jest.fn();

jest.mock('@src/course-unit/data/apiHooks', () => ({
  useAcceptLibraryBlockChanges: () => ({
    mutateAsync: mockUseAcceptLibraryBlockChanges,
  }),
  useIgnoreLibraryBlockChanges: () => ({
    mutateAsync: mockUseIgnoreLibraryBlockChanges,
  }),
}));

jest.mock('./data/hooks', () => ({
  useUnitHandler: (...args: unknown[]) => mockUseUnitHandler(...args),
}));

const section = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@section+block@0',
  displayName: 'Section Name',
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
} satisfies Partial<XBlock> as XBlock;

const subsection = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@0',
  displayName: 'Subsection Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
} satisfies Partial<XBlock> as XBlock;

const unit = {
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
  },
} satisfies Partial<XBlock> as XBlock;

const renderComponent = (props?: object) => render(
  <UnitCard
    section={section}
    subsection={subsection}
    unit={unit}
    index={1}
    getPossibleMoves={jest.fn()}
    onOrderChange={jest.fn()}
    onOpenPublishModal={jest.fn()}
    onOpenDeleteModal={jest.fn()}
    onOpenUnlinkModal={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    onEditSubmit={jest.fn()}
    onDuplicateSubmit={jest.fn()}
    getTitleLink={(id) => `/some/${id}`}
    isSelfPaced={false}
    isCustomRelativeDatesActive={false}
    discussionsSettings={{
      providerType: '',
      enableGradedUnits: false,
    }}
    {...props}
  />,
  {
    path: '/course/:courseId',
    params: { courseId: '5' },
  },
);

describe('<UnitCard />', () => {
  beforeEach(() => {
    initializeMocks();
    mockWaffleFlags({ enableUnitExpandedView: true });
    mockUseUnitHandler.mockReset();
    mockUseUnitHandler.mockReturnValue({
      data: undefined, isLoading: false, isError: false, error: null,
    });
  });

  it('render UnitCard component correctly', async () => {
    const { findByTestId } = renderComponent();

    expect(await findByTestId('unit-card-header')).toBeInTheDocument();
  });

  it('hides header based on isHeaderVisible flag', async () => {
    const { queryByTestId } = renderComponent({
      unit: {
        ...unit,
        isHeaderVisible: false,
      },
    });
    expect(queryByTestId('unit-card-header')).not.toBeInTheDocument();
  });

  it('hides duplicate & delete option based on duplicable & deletable action flag', async () => {
    const { findByTestId } = renderComponent({
      unit: {
        ...unit,
        actions: {
          draggable: true,
          childAddable: false,
          deletable: false,
          duplicable: false,
        },
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('unit-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('unit-card-header__menu-delete-button')).not.toBeInTheDocument();
  });

  it('hides move, duplicate & delete options if parent was imported from library', async () => {
    const { findByTestId } = renderComponent({
      subsection: {
        ...subsection,
        upstreamInfo: {
          readyToSync: true,
          upstreamRef: 'lct:org1:lib1:subsection:1',
          versionSynced: 1,
        },
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('unit-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('unit-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(
      await within(element).findByTestId('unit-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      await within(element).findByTestId('unit-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows copy option based on enableCopyPasteUnits flag', async () => {
    const { findByTestId } = renderComponent({
      unit: {
        ...unit,
        enableCopyPasteUnits: true,
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByText(cardMessages.menuCopy.defaultMessage)).toBeInTheDocument();
  });

  it('hides status badge for unscheduled units', async () => {
    const { queryByRole } = renderComponent({
      unit: {
        ...unit,
        visibilityState: 'unscheduled',
        hasChanges: false,
      },
    });
    expect(queryByRole('status')).not.toBeInTheDocument();
  });

  it('should sync unit changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();

    // Click on accept changes
    const acceptChangesButton = screen.getByText(/accept changes/i);
    fireEvent.click(acceptChangesButton);

    await waitFor(() => expect(mockUseAcceptLibraryBlockChanges).toHaveBeenCalled());
  });

  it('should decline sync unit changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();

    // Click on ignore changes
    const ignoreChangesButton = screen.getByRole('button', { name: /ignore changes/i });
    fireEvent.click(ignoreChangesButton);

    // Should open the confirmation modal
    expect(screen.getByRole('heading', { name: /ignore these changes\?/i })).toBeInTheDocument();

    // Click on ignore button
    const ignoreButton = screen.getByRole('button', { name: /ignore/i });
    fireEvent.click(ignoreButton);

    await waitFor(() => expect(mockUseIgnoreLibraryBlockChanges).toHaveBeenCalled());
  });

  it('shows an error alert when unit components fail to load', async () => {
    const errorMessage = 'Failed to load unit components';
    mockUseUnitHandler.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
    });

    renderComponent();

    const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
    fireEvent.click(expandButton);

    expect(await screen.findByText(/unable to load unit components/i)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  describe('component editor links', () => {
    const htmlComponent = {
      blockId: 'block-v1:test+type@html+block@1',
      blockType: 'html',
      displayName: 'HTML Component',
    };
    const oraComponent = {
      blockId: 'block-v1:test+type@openassessment+block@2',
      blockType: 'openassessment',
      displayName: 'ORA Component',
    };

    const setupExpandedView = async (components: any[]) => {
      mockUseUnitHandler.mockReturnValue({
        data: { components },
        isLoading: false,
        isError: false,
        error: null,
      });

      renderComponent();

      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);
    };

    it('renders component names as links to the unit page', async () => {
      await setupExpandedView([htmlComponent]);

      const link = await screen.findByTestId('component-name-link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', `/some/${unit.id}#${htmlComponent.blockId}`);
      expect(link).toHaveTextContent('HTML Component');
    });

    it('renders edit button with correct href for MFE-supported types', async () => {
      await setupExpandedView([htmlComponent]);

      const editButton = await screen.findByTestId('component-edit-button');
      expect(editButton.tagName).toBe('A');
      expect(editButton).toHaveAttribute('href', `/course/5/editor/html/${htmlComponent.blockId}`);
    });

    it('renders edit button with legacy Studio URL for non-MFE types', async () => {
      await setupExpandedView([oraComponent]);

      const editButton = await screen.findByTestId('component-edit-button');
      const returnTo = encodeURIComponent(`${getConfig().STUDIO_BASE_URL}/container/${unit.id}`);
      expect(editButton).toHaveAttribute(
        'href',
        `${getConfig().STUDIO_BASE_URL}/xblock/${oraComponent.blockId}/action/edit?returnTo=${returnTo}`,
      );
    });

    it('opens modal editor on plain left-click on edit button (does not navigate)', async () => {
      await setupExpandedView([htmlComponent]);

      const editButton = await screen.findByTestId('component-edit-button');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(clickEvent, 'metaKey', { value: false });
      Object.defineProperty(clickEvent, 'ctrlKey', { value: false });
      Object.defineProperty(clickEvent, 'button', { value: 0 });

      const prevented = !editButton.dispatchEvent(clickEvent);
      expect(prevented).toBe(true);
    });

    it('allows Ctrl+click on edit button to open in new tab (does not prevent default)', async () => {
      await setupExpandedView([htmlComponent]);

      const editButton = await screen.findByTestId('component-edit-button');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });

      const prevented = !editButton.dispatchEvent(clickEvent);
      expect(prevented).toBe(false);
    });
  });
});
