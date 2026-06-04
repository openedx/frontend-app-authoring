import { getConfig, setConfig } from '@edx/frontend-platform';
import userEvent from '@testing-library/user-event';

import {
  act,
  fireEvent,
  screen,
  within,
} from '@src/testUtils';
import { ContainerType } from '@src/generic/key-utils';
import {
  mockAcceptLibBlockChanges as mockUseAcceptLibraryBlockChanges,
  mockCardAuthoringContext,
  mockHandleAddAndOpenUnit as handleOnAddUnitFromLibrary,
  mockIgnoreLibBlockChanges as mockUseIgnoreLibraryBlockChanges,
  mockOpenPublishModal,
  mockCourseOutlineContextOverrides,
  renderCard,
  setupCardTestMocks,
} from '../__mocks__/testSetup';
import { mockSection as section, mockSubsection as subsection, mockUnit as unit } from '../__mocks__/testSetup';
import { describeCard } from '../__mocks__/card-test-factory';
import cardHeaderMessages from '../card-header/messages';
import SubsectionCard from './SubsectionCard';

jest.mock('@src/course-unit/data/apiHooks', () => ({
  useAcceptLibraryBlockChanges: () => ({
    mutateAsync: mockUseAcceptLibraryBlockChanges,
  }),
  useIgnoreLibraryBlockChanges: () => ({
    mutateAsync: mockUseIgnoreLibraryBlockChanges,
  }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => mockCardAuthoringContext,
}));

jest.mock('@src/course-outline/CourseOutlineContext', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const realModule = jest.requireActual('@src/course-outline/CourseOutlineContext');
  return {
    ...realModule,
    useCourseOutlineContext: () => {
      const realResult = realModule.useCourseOutlineContext();
      return {
        ...realResult,
        openPublishModal: mockOpenPublishModal,
        handleAddAndOpenUnit: handleOnAddUnitFromLibrary,
        handleAddBlock: {},
        ...mockCourseOutlineContextOverrides,
      };
    },
  };
});

jest.mock('@src/studio-home/data/selectors', () => ({
  ...jest.requireActual('@src/studio-home/data/selectors'),
  getStudioHomeData: () => ({
    librariesV2Enabled: true,
  }),
}));

const startCurrentFlow = jest.fn();

jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('@src/course-outline/outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    startCurrentFlow,
  }),
}));

const renderSubsectionCard = (props?: Record<string, unknown>, entry = '/course/:courseId') => {
  const result = renderCard(
    <SubsectionCard
      section={section}
      subsection={subsection}
      index={1}
      isSelfPaced={false}
      getPossibleMoves={jest.fn()}
      onOrderChange={jest.fn()}
      onOpenDeleteModal={jest.fn()}
      isCustomRelativeDatesActive={false}
      onOpenConfigureModal={jest.fn()}
      onPasteClick={jest.fn()}
      isSectionsExpanded={false}
      {...props}
    >
      <span>children</span>
    </SubsectionCard>,
    {
      path: '/course/:courseId',
      params: { courseId: '5' },
      routerProps: { initialEntries: [entry] },
    },
  );
  return { ...result, container: result.container as HTMLElement };
};

// ─── Shared tests via factory ─────────────────────────────────────────
describeCard({
  name: 'SubsectionCard',
  testId: 'subsection-card',
  headerTestId: 'subsection-card-header',
  mockBlock: subsection,
  blockPropKey: 'subsection',
  syncNodeName: 'subsection name',
  hasExpandCollapse: true,
  expandTestId: 'subsection-card__units',
  childAddLabel: 'New unit',
  render: renderSubsectionCard,
  // SubsectionCard has pre-existing jest.mock for OutlineSidebarContext
  // so the factory's jest.spyOn cannot redefine it.
  skipAlignTest: true,
  alignAssert: null,
});

// ─── Unique tests ─────────────────────────────────────────────────────
describe('<SubsectionCard />', () => {
  beforeEach(() => {
    setupCardTestMocks();
  });

  it('expands/collapses the card when the subsection button is clicked', async () => {
    renderSubsectionCard();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).not.toBeInTheDocument();
  });

  it('hides move, duplicate & delete options if parent was imported from library', async () => {
    renderSubsectionCard({
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
    renderSubsectionCard();
    expect(await screen.findByText(cardHeaderMessages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders published but live status', async () => {
    renderSubsectionCard({
      subsection: {
        ...subsection,
        published: true,
        visibilityState: 'ready',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders staff status', async () => {
    renderSubsectionCard({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'staff_only',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('renders draft status', async () => {
    renderSubsectionCard({
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
    const unitIdUrl = encodeURIComponent(unit.id);
    renderSubsectionCard(undefined, `/course/:courseId?show=${unitIdUrl}`);

    const cardUnits = await screen.findByTestId('subsection-card__units');
    const newUnitButton = await screen.findByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeInTheDocument();
    expect(newUnitButton).toBeInTheDocument();
  });

  it('check not extended subsection when URL "show" param not in subsection', async () => {
    const randomId = 'random-id';
    renderSubsectionCard(undefined, `/course/:courseId?show=${randomId}`);

    const cardUnits = screen.queryByTestId('subsection-card__units');
    const newUnitButton = screen.queryByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeNull();
    expect(newUnitButton).toBeNull();
  });

  it('should open align sidebar', async () => {
    const user = userEvent.setup();
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    renderSubsectionCard();
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await user.click(menu);

    const manageTagsBtn = await within(element).findByTestId('subsection-card-header__menu-manage-tags-button');
    expect(manageTagsBtn).toBeInTheDocument();

    await user.click(manageTagsBtn);

    expect(screen.getByText('Manage tags')).toBeInTheDocument();
  });

  it('should add unit from library', async () => {
    const user = userEvent.setup();
    renderSubsectionCard();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    await user.click(expandButton);

    const useUnitFromLibraryButton = screen.getByRole('button', {
      name: /use unit from library/i,
    });
    expect(useUnitFromLibraryButton).toBeInTheDocument();
    await user.click(useUnitFromLibraryButton);

    expect(startCurrentFlow).toHaveBeenCalledWith({
      flowType: ContainerType.Unit,
      parentLocator: 'block-v1:UNIX+UX1+2025_T3+type@subsection+block@0',
      grandParentLocator: 'block-v1:UNIX+UX1+2025_T3+type@section+block@0',
    });
  });
});
