import { getConfig, setConfig } from '@edx/frontend-platform';
import {
  initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';

import { XBlock } from '@src/data/types';
import { Info } from '@openedx/paragon/icons';
import userEvent from '@testing-library/user-event';
import { CourseInfoSidebar } from '@src/course-outline/outline-sidebar/info-sidebar/CourseInfoSidebar';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';
import * as OutlineSidebarContext from '../outline-sidebar/OutlineSidebarContext';

const mockUseAcceptLibraryBlockChanges = jest.fn();
const mockUseIgnoreLibraryBlockChanges = jest.fn();
const setCurrentSelection = jest.fn();

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
    getUnitUrl: (id: string) => `/some/${id}`,
    setCurrentSelection,
  }),
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
    upstreamName: 'Upstream',
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
    onOpenDeleteModal={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    onDuplicateSubmit={jest.fn()}
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
    extraWrapper: OutlineSidebarContext.OutlineSidebarProvider,
  },
);

describe('<UnitCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render UnitCard component correctly', async () => {
    const { findByTestId } = renderComponent();

    expect(await findByTestId('unit-card-header')).toBeInTheDocument();
    expect(await findByTestId('unit-card-header__title-link')).toHaveAttribute(
      'href',
      '/some/block-v1:UNIX+UX1+2025_T3+type@unit+block@0',
    );

    // The card is not selected
    const card = screen.getByTestId('unit-card');
    expect(card).not.toHaveClass('outline-card-selected');
  });

  it('render UnitCard component in selected state', async () => {
    const user = userEvent.setup();
    setConfig({
      ...getConfig(),
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
    });

    const { container } = renderComponent();

    expect(screen.getByTestId('unit-card-header')).toBeInTheDocument();

    // The card is not selected
    const card = screen.getByTestId('unit-card');
    expect(card).not.toHaveClass('outline-card-selected');

    // Get the <Row> that contains the card and click it to select the card
    const el = container.querySelector('div.row.mx-0') as HTMLInputElement;
    expect(el).not.toBeNull();
    await user.click(el!);

    // The card is selected
    expect(card).toHaveClass('outline-card-selected');
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
    const user = userEvent.setup();
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
    await user.click(menu);
    expect(within(element).queryByTestId('unit-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('unit-card-header__menu-delete-button')).not.toBeInTheDocument();
  });

  it('hides move, duplicate & delete options if parent was imported from library', async () => {
    const user = userEvent.setup();
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
    await user.click(menu);
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
    const user = userEvent.setup();
    const { findByTestId } = renderComponent({
      unit: {
        ...unit,
        enableCopyPasteUnits: true,
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await user.click(menu);
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
    const user = userEvent.setup();
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    await user.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();

    // Click on accept changes
    const acceptChangesButton = screen.getByText(/accept changes/i);
    await user.click(acceptChangesButton);

    await waitFor(() => expect(mockUseAcceptLibraryBlockChanges).toHaveBeenCalled());
  });

  it('should decline sync unit changes from upstream', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    await user.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();

    // Click on ignore changes
    const ignoreChangesButton = screen.getByRole('button', { name: /ignore changes/i });
    await user.click(ignoreChangesButton);

    // Should open the confirmation modal
    expect(screen.getByRole('heading', { name: /ignore these changes\?/i })).toBeInTheDocument();

    // Click on ignore button
    const ignoreButton = screen.getByRole('button', { name: /ignore/i });
    await user.click(ignoreButton);

    await waitFor(() => expect(mockUseIgnoreLibraryBlockChanges).toHaveBeenCalled());
  });

  it('should open legacy manage tags', async () => {
    const user = userEvent.setup();
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'false',
    });
    renderComponent();
    const element = await screen.findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await user.click(menu);

    const manageTagsBtn = await within(element).findByTestId('unit-card-header__menu-manage-tags-button');
    expect(manageTagsBtn).toBeInTheDocument();

    await user.click(manageTagsBtn);

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
    const element = await screen.findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await user.click(menu);

    const manageTagsBtn = await within(element).findByTestId('unit-card-header__menu-manage-tags-button');
    expect(manageTagsBtn).toBeInTheDocument();

    await user.click(manageTagsBtn);

    await waitFor(() => {
      expect(mockSetCurrentPageKey).toHaveBeenCalledWith('align');
    });
    expect(setCurrentSelection).toHaveBeenCalledWith({
      currentId: unit.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
    expect(mockSetSelectedContainerState).toHaveBeenCalledWith({
      currentId: unit.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  });
});
