import { getConfig, setConfig } from '@edx/frontend-platform';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import {
  act, fireEvent, initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';
import { XBlock } from '@src/data/types';
import { Info } from '@openedx/paragon/icons';
import userEvent from '@testing-library/user-event';
import { CourseInfoSidebar } from '@src/course-outline/outline-sidebar/info-sidebar/CourseInfoSidebar';
import cardHeaderMessages from '../card-header/messages';
import SubsectionCard from './SubsectionCard';
import * as OutlineSidebarContext from '../outline-sidebar/OutlineSidebarContext';

const containerKey = 'lct:org:lib:unit:1';
const handleOnAddUnitFromLibrary = { mutateAsync: jest.fn(), isPending: false };
const setCurrentSelection = jest.fn();

const mockUseAcceptLibraryBlockChanges = jest.fn();
const mockUseIgnoreLibraryBlockChanges = jest.fn();

jest.mock('@src/course-unit/data/apiHooks', () => ({
  useAcceptLibraryBlockChanges: () => ({
    mutateAsync: mockUseAcceptLibraryBlockChanges,
  }),
  useIgnoreLibraryBlockChanges: () => ({
    mutateAsync: mockUseIgnoreLibraryBlockChanges,
  }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    handleAddAndOpenUnit: handleOnAddUnitFromLibrary,
    handleAddSubsection: {},
    handleAddSection: {},
    setCurrentSelection,
  }),
}));

jest.mock('@src/studio-home/data/selectors', () => ({
  ...jest.requireActual('@src/studio-home/data/selectors'),
  getStudioHomeData: () => ({
    librariesV2Enabled: true,
  }),
}));

// Mock LibraryAndComponentPicker to call onComponentSelected on click
jest.mock('@src/library-authoring/component-picker', () => ({
  LibraryAndComponentPicker: (props) => {
    const onClick = () => {
      // eslint-disable-next-line react/prop-types
      props.onComponentSelected({
        usageKey: containerKey,
        blockType: 'unit',
      });
    };
    return (
      <button type="submit" onClick={onClick}>
        Dummy button
      </button>
    );
  },
}));

const unit = {
  id: 'unit-1',
};

const subsection: XBlock = {
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
    children: [unit],
  } as any, // 'as any' because we are omitting a lot of fields from 'childInfo'
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

const section: XBlock = {
  id: 'block-v1:UNIX+UX1+2025_T3+type@section+block@0',
  displayName: 'Section Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  childInfo: {
    children: [subsection],
  } as any, // 'as any' because we are omitting a lot of fields from 'childInfo'
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
} satisfies Partial<XBlock> as XBlock;

const renderComponent = (props?: object, entry = '/course/:courseId') => render(
  <SubsectionCard
    section={section}
    subsection={subsection}
    index={1}
    isSelfPaced={false}
    getPossibleMoves={jest.fn()}
    onOrderChange={jest.fn()}
    onOpenDeleteModal={jest.fn()}
    isCustomRelativeDatesActive={false}
    onDuplicateSubmit={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    onPasteClick={jest.fn()}
    resetScrollState={jest.fn()}
    isSectionsExpanded={false}
    {...props}
  >
    <span>children</span>
  </SubsectionCard>,
  {
    path: '/course/:courseId',
    params: { courseId: '5' },
    routerProps: {
      initialEntries: [entry],
    },
    extraWrapper: OutlineSidebarContext.OutlineSidebarProvider,
  },
);

describe('<SubsectionCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render SubsectionCard component correctly', () => {
    renderComponent();

    expect(screen.getByTestId('subsection-card-header')).toBeInTheDocument();

    // The card is not selected
    const card = screen.getByTestId('subsection-card');
    expect(card).not.toHaveClass('outline-card-selected');
  });

  it('render SubsectionCard component in selected state', () => {
    setConfig({
      ...getConfig(),
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
    });
    const { container } = renderComponent();

    expect(screen.getByTestId('subsection-card-header')).toBeInTheDocument();

    // The card is not selected
    const card = screen.getByTestId('subsection-card');
    expect(card).not.toHaveClass('outline-card-selected');

    // Get the <Row> that contains the card and click it to select the card
    const el = container.querySelector('div.row.mx-0') as HTMLInputElement;
    expect(el).not.toBeNull();
    fireEvent.click(el!);

    // The card is selected
    expect(card).toHaveClass('outline-card-selected');
  });

  it('expands/collapses the card when the subsection button is clicked', async () => {
    renderComponent();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).not.toBeInTheDocument();
  });

  it('updates current section, subsection and item', async () => {
    renderComponent();

    const menu = await screen.findByTestId('subsection-card-header__menu');
    fireEvent.click(menu);
    expect(setCurrentSelection).toHaveBeenCalledWith({
      currentId: subsection.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  });

  it('hides header based on isHeaderVisible flag', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        isHeaderVisible: false,
      },
    });
    expect(screen.queryByTestId('subsection-card-header')).not.toBeInTheDocument();
  });

  it('hides add new, duplicate & delete option based on childAddable, duplicable & deletable action flag', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        actions: {
          draggable: true,
          childAddable: false,
          deletable: false,
          duplicable: false,
        },
      },
    });
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('subsection-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('subsection-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).not.toBeInTheDocument();
  });

  it('hides move, duplicate & delete options if parent was imported from library', async () => {
    renderComponent({
      section: {
        ...section,
        upstreamInfo: {
          readyToSync: true,
          upstreamRef: 'lct:org1:lib1:section:1',
          versionSynced: 1,
        },
      },
    });
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('subsection-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('subsection-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(
      await within(element).findByTestId('subsection-card-header__menu-move-up-button'),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      await within(element).findByTestId('subsection-card-header__menu-move-down-button'),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders live status', async () => {
    renderComponent();
    expect(await screen.findByText(cardHeaderMessages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders published but live status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: true,
        visibilityState: 'ready',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders staff status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'staff_only',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('renders draft status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'needs_attention',
        hasChanges: true,
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('check extended subsection when URL "show" param in subsection', async () => {
    renderComponent(undefined, `/course/:courseId?show=${unit.id}`);

    const cardUnits = await screen.findByTestId('subsection-card__units');
    const newUnitButton = await screen.findByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeInTheDocument();
    expect(newUnitButton).toBeInTheDocument();
  });

  it('check not extended subsection when URL "show" param not in subsection', async () => {
    const randomId = 'random-id';
    renderComponent(undefined, `/course/:courseId?show=${randomId}`);

    const cardUnits = screen.queryByTestId('subsection-card__units');
    const newUnitButton = screen.queryByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeNull();
    expect(newUnitButton).toBeNull();
  });

  it('should add unit from library', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'false',
    });
    const user = userEvent.setup();
    renderComponent();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);

    const useUnitFromLibraryButton = screen.getByRole('button', {
      name: /use unit from library/i,
    });
    expect(useUnitFromLibraryButton).toBeInTheDocument();
    await user.click(useUnitFromLibraryButton);

    expect(await screen.findByText('Select unit'));

    // click dummy button to execute onComponentSelected prop.
    const dummyBtn = await screen.findByRole('button', { name: 'Dummy button' });
    await user.click(dummyBtn);

    expect(handleOnAddUnitFromLibrary.mutateAsync).toHaveBeenCalledWith({
      type: COMPONENT_TYPES.libraryV2,
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@0',
      category: 'vertical',
      libraryContentKey: containerKey,
    });
  });

  it('should sync subsection changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('subsection-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: subsection name/i })).toBeInTheDocument();

    // Click on accept changes
    const acceptChangesButton = screen.getByText(/accept changes/i);
    fireEvent.click(acceptChangesButton);

    await waitFor(() => expect(mockUseAcceptLibraryBlockChanges).toHaveBeenCalled());
  });

  it('should decline sync subsection changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('subsection-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: subsection name/i })).toBeInTheDocument();

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

  it('should open legacy manage tags', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'false',
    });
    renderComponent();
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menu);

    const manageTagsBtn = await within(element).findByTestId('subsection-card-header__menu-manage-tags-button');
    expect(manageTagsBtn).toBeInTheDocument();

    fireEvent.click(manageTagsBtn);

    const drawer = await screen.findByRole('alert');
    expect(within(drawer).getByText(/manage tags/i));
  });

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
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
    });
    renderComponent();
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await user.click(menu);

    const manageTagsBtn = await within(element).findByTestId('subsection-card-header__menu-manage-tags-button');
    expect(manageTagsBtn).toBeInTheDocument();

    await user.click(manageTagsBtn);

    await waitFor(() => {
      expect(mockSetCurrentPageKey).toHaveBeenCalledWith('align');
    });
    expect(setCurrentSelection).toHaveBeenCalledWith({
      currentId: subsection.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
    expect(mockSetSelectedContainerState).toHaveBeenCalledWith({
      currentId: subsection.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  });
});
