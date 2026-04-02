import {
  act, fireEvent, initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';
import { getConfig } from '@edx/frontend-platform';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

import { XBlock } from '@src/data/types';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';
import componentMessages from './messages';

const mockUseAcceptLibraryBlockChanges = jest.fn();
const mockUseIgnoreLibraryBlockChanges = jest.fn();
const mockUseUnitHandler = jest.fn();
const mockUseComponentTemplates = jest.fn();
const mockCreateXBlock = jest.fn();
const mockPasteBlock = jest.fn();
const mockCopyToClipboard = jest.fn();
const mockShowPasteXBlock = { current: false };

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
  useComponentTemplates: (...args: unknown[]) => mockUseComponentTemplates(...args),
  useCreateXBlockInUnit: () => ({
    mutateAsync: mockCreateXBlock,
    isPending: false,
  }),
}));

// Mock pasteBlock API call used by handlePasteComponent
jest.mock('@src/course-outline/data/api', () => ({
  ...jest.requireActual('@src/course-outline/data/api'),
  pasteBlock: (...args: unknown[]) => mockPasteBlock(...args),
  setCourseItemOrderList: jest.fn(),
}));

// Mock useClipboard hook to control showPasteXBlock
jest.mock('@src/generic/clipboard', () => ({
  useClipboard: () => ({
    copyToClipboard: mockCopyToClipboard,
    showPasteXBlock: mockShowPasteXBlock.current,
  }),
}));

// Mock fetchCourseSectionQuery thunk (returns a plain action object)
jest.mock('@src/course-outline/data/thunk', () => ({
  ...jest.requireActual('@src/course-outline/data/thunk'),
  fetchCourseSectionQuery: jest.fn(() => ({ type: 'MOCK_FETCH_SECTION' })),
}));

// Mock EditorPage to avoid heavy editor dependencies
jest.mock('@src/editors/EditorPage', () => function MockEditorPage() {
  return <div data-testid="mock-editor-page" />;
});

// Mock ModalIframe to simplify legacy editor testing
jest.mock('@src/generic/modal-iframe', () => function MockModalIframe({ title }: { title: string }) {
  return <div data-testid="mock-modal-iframe">{title}</div>;
});

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
  let mockShowToast: jest.Mock;

  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast as jest.Mock;
    mockWaffleFlags({ enableUnitExpandedView: true });
    mockUseUnitHandler.mockReset();
    mockUseUnitHandler.mockReturnValue({
      data: undefined, isLoading: false, isError: false, error: null, refetch: jest.fn(),
    });
    mockUseComponentTemplates.mockReset();
    mockUseComponentTemplates.mockReturnValue({ data: undefined });
    mockPasteBlock.mockReset();
    mockCreateXBlock.mockReset();
    mockShowPasteXBlock.current = false;
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
      refetch: jest.fn(),
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
        refetch: jest.fn(),
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

  describe('preview button', () => {
    it('shows Preview option in the kebab menu', async () => {
      const { findByTestId } = renderComponent();
      const element = await findByTestId('unit-card');
      const menu = await within(element).findByTestId('unit-card-header__menu-button');
      await act(async () => fireEvent.click(menu));

      const previewButton = within(element).getByTestId('unit-card-header__menu-preview-button');
      expect(previewButton).toBeInTheDocument();
      expect(previewButton).toHaveTextContent(cardMessages.menuPreview.defaultMessage);
    });

    it('opens the correct LMS preview URL in a new tab', async () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      const { findByTestId } = renderComponent();
      const element = await findByTestId('unit-card');
      const menu = await within(element).findByTestId('unit-card-header__menu-button');
      await act(async () => fireEvent.click(menu));

      const previewButton = within(element).getByTestId('unit-card-header__menu-preview-button');
      await act(async () => fireEvent.click(previewButton));

      const expectedUrl = `${getConfig().LMS_BASE_URL}/courses/5/jump_to/${unit.id}?preview=1`;
      expect(windowOpenSpy).toHaveBeenCalledWith(expectedUrl, '_blank');
      windowOpenSpy.mockRestore();
    });
  });

  describe('add component widget', () => {
    const componentTemplates = [
      {
        type: 'html',
        displayName: 'Text',
        templates: [{ displayName: 'Text', category: 'html', boilerplateName: undefined }],
        supportLegend: {},
      },
    ];

    it('renders AddComponentWidget when enableOutlineComponentCreation flag is true', async () => {
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: { components: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({ data: componentTemplates });

      renderComponent();

      // Expand the unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      expect(await screen.findByTestId('add-component-widget')).toBeInTheDocument();
    });

    it('hides AddComponentWidget when enableOutlineComponentCreation flag is false', async () => {
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: false });
      mockUseUnitHandler.mockReturnValue({
        data: { components: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({ data: componentTemplates });

      renderComponent();

      // Expand the unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Wait for components area to render, then check widget is absent
      await waitFor(() => {
        expect(screen.queryByTestId('add-component-widget')).not.toBeInTheDocument();
      });
    });

    it('hides AddComponentWidget when there are no component templates', async () => {
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: { components: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({ data: [] });

      renderComponent();

      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.queryByTestId('add-component-widget')).not.toBeInTheDocument();
      });
    });

    it('passes showPasteXBlock=true to AddComponentWidget when clipboard has content', async () => {
      // Enable the clipboard paste indicator
      mockShowPasteXBlock.current = true;
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: {
          components: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({
        data: [{
          type: 'html',
          displayName: 'Text',
          templates: [{ displayName: 'Text', category: 'html', boilerplateName: undefined }],
          supportLegend: {},
        }],
      });

      renderComponent();

      // Expand the unit to show AddComponentWidget
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Open the add-component dropdown
      const toggle = await screen.findByText(componentMessages.addComponentButton.defaultMessage);
      await act(async () => fireEvent.click(toggle));

      // Paste option should be visible when showPasteXBlock is true
      expect(screen.getByTestId('add-component-item-paste')).toBeInTheDocument();
    });

    it('does not show paste option when clipboard is empty', async () => {
      // Clipboard has no pasteable content
      mockShowPasteXBlock.current = false;
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: {
          components: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({
        data: [{
          type: 'html',
          displayName: 'Text',
          templates: [{ displayName: 'Text', category: 'html', boilerplateName: undefined }],
          supportLegend: {},
        }],
      });

      renderComponent();

      // Expand the unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Open the dropdown
      const toggle = await screen.findByText(componentMessages.addComponentButton.defaultMessage);
      await act(async () => fireEvent.click(toggle));

      // Paste option should NOT be visible
      expect(screen.queryByTestId('add-component-item-paste')).not.toBeInTheDocument();
    });

    it('opens MFE editor after creating an MFE-supported component (e.g. html)', async () => {
      // Simulate createXBlock returning a locator for an html component
      mockCreateXBlock.mockResolvedValueOnce({
        locator: 'block-v1:test+type@html+block@new1',
        courseKey: 'course-v1:test+T1+2025',
      });
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: {
          components: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({
        data: [{
          type: 'html',
          displayName: 'Text',
          templates: [{ displayName: 'Text', category: 'html', boilerplateName: undefined }],
          supportLegend: {},
        }],
      });

      renderComponent();

      // Expand unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Open dropdown and click the HTML component type
      const toggle = await screen.findByText(componentMessages.addComponentButton.defaultMessage);
      await act(async () => fireEvent.click(toggle));
      await act(async () => fireEvent.click(screen.getByTestId('add-component-item-html')));

      // The MFE editor modal should appear (mocked EditorPage inside .editor-page div)
      await waitFor(() => {
        expect(screen.getByTestId('mock-editor-page')).toBeInTheDocument();
      });
    });

    it('opens legacy editor after creating a non-MFE component (e.g. openassessment)', async () => {
      // Simulate createXBlock returning a locator for an ORA component
      mockCreateXBlock.mockResolvedValueOnce({
        locator: 'block-v1:test+type@openassessment+block@new2',
        courseKey: 'course-v1:test+T1+2025',
      });
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: {
          components: [],
        },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({
        data: [{
          type: 'openassessment',
          displayName: 'Open Response',
          templates: [{
            displayName: 'Open Response Assessment',
            category: 'openassessment',
            boilerplateName: undefined,
          }],
          supportLegend: {},
        }],
      });

      renderComponent();

      // Expand unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Open dropdown and click the ORA component type
      const toggle = await screen.findByText(componentMessages.addComponentButton.defaultMessage);
      await act(async () => fireEvent.click(toggle));
      await act(async () => fireEvent.click(screen.getByTestId('add-component-item-openassessment')));

      // Legacy editor modal (iframe) should appear — MockModalIframe renders with a title
      await waitFor(() => {
        expect(screen.getByTestId('mock-modal-iframe')).toBeInTheDocument();
      });
    });
  });

  describe('handlePasteComponent', () => {
    const componentTemplates = [{
      type: 'html',
      displayName: 'Text',
      templates: [{ displayName: 'Text', category: 'html', boilerplateName: undefined }],
      supportLegend: {},
    }];

    // Helper to expand the unit and open the add-component dropdown with paste enabled
    const setupPasteScenario = async () => {
      mockShowPasteXBlock.current = true;
      mockWaffleFlags({ enableUnitExpandedView: true, enableOutlineComponentCreation: true });
      mockUseUnitHandler.mockReturnValue({
        data: { components: [] },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      });
      mockUseComponentTemplates.mockReturnValue({ data: componentTemplates });

      renderComponent();

      // Expand the unit
      const expandButton = await screen.findByTestId('unit-card-header__expanded-btn');
      fireEvent.click(expandButton);

      // Open the add-component dropdown
      const toggle = await screen.findByText(componentMessages.addComponentButton.defaultMessage);
      await act(async () => fireEvent.click(toggle));
    };

    it('calls pasteBlock and refreshes data on successful paste', async () => {
      // pasteBlock resolves successfully
      mockPasteBlock.mockResolvedValueOnce({ locator: 'block-v1:pasted' });

      await setupPasteScenario();

      // Click the paste option
      const pasteItem = screen.getByTestId('add-component-item-paste');
      await act(async () => fireEvent.click(pasteItem));

      // pasteBlock should be called with the unit id
      await waitFor(() => {
        expect(mockPasteBlock).toHaveBeenCalledWith(unit.id);
      });
    });

    it('shows an error toast when pasteBlock fails', async () => {
      // pasteBlock rejects with an error
      mockPasteBlock.mockRejectedValueOnce(new Error('Paste failed'));

      await setupPasteScenario();

      // Click the paste option
      const pasteItem = screen.getByTestId('add-component-item-paste');
      await act(async () => fireEvent.click(pasteItem));

      // Error toast should be called with the addComponentError message
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(componentMessages.addComponentError.defaultMessage);
      });
    });
  });
});
