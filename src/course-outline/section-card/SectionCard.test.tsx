import {
  fireEvent,
  screen,
} from '@src/testUtils';
import { getXBlockApiUrl } from '@src/course-outline/data/api';
import { courseOutlineQueryKeys } from '@src/course-outline/data/queryKeys';
import {
  mockAcceptLibBlockChanges as mockUseAcceptLibraryBlockChanges,
  mockCardAuthoringContext,
  mockIgnoreLibBlockChanges as mockUseIgnoreLibraryBlockChanges,
  mockOpenPublishModal,
  mockCourseOutlineContextOverrides,
  renderCard,
  setupCardTestMocks,
} from '../__mocks__/testSetup';
import {
  mockSection as section,
  mockSubsection as subsection,
  mockUnit as unit,
} from '../__mocks__/testSetup';
import { describeCard } from '../__mocks__/card-test-factory';
import SectionCard from './SectionCard';

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
        ...mockCourseOutlineContextOverrides,
      };
    },
  };
});

let axiosMock;
let queryClient;
const renderSectionCard = (props?: Record<string, unknown>, entry = '/course/:courseId') => {
  const result = renderCard(
    <SectionCard
      section={section}
      index={1}
      canMoveItem={jest.fn()}
      onOrderChange={jest.fn()}
      onOpenHighlightsModal={jest.fn()}
      onOpenDeleteModal={jest.fn()}
      onOpenConfigureModal={jest.fn()}
      isSectionsExpanded
      isSelfPaced={false}
      isCustomRelativeDatesActive={false}
      {...props}
    >
      <span>children</span>
    </SectionCard>,
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
  name: 'SectionCard',
  testId: 'section-card',
  headerTestId: 'section-card-header',
  mockBlock: section,
  blockPropKey: 'section',
  syncNodeName: 'section name',
  hasExpandCollapse: true,
  expandTestId: 'section-card__subsections',
  childAddLabel: 'New subsection',
  render: renderSectionCard,
  extraRenderAssertions: () => {
    expect(screen.getByTestId('section-card__content')).toBeInTheDocument();
  },
});

// ─── Unique tests ─────────────────────────────────────────────────────
describe('<SectionCard />', () => {
  beforeEach(() => {
    const mocks = setupCardTestMocks();
    axiosMock = mocks.axiosMock;
    queryClient = mocks.queryClient;
    axiosMock
      .onGet(getXBlockApiUrl(section.id))
      .reply(200, section);
  });

  it('expands/collapses the card when the expand button is clicked', () => {
    renderSectionCard();

    const expandButton = screen.getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(screen.queryByTestId('section-card__subsections')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New subsection' })).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByTestId('section-card__subsections')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New subsection' })).toBeInTheDocument();
  });

  it('check extended section when URL "show" param in subsection under section', async () => {
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    const subsectionIdUrl = encodeURIComponent(subsection.id);
    renderSectionCard(collapsedSections as any, `/course/:courseId?show=${subsectionIdUrl}`);

    const cardSubsections = await screen.findByTestId('section-card__subsections');
    const newSubsectionButton = await screen.findByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeInTheDocument();
    expect(newSubsectionButton).toBeInTheDocument();
  });

  it('check extended section when URL "show" param in unit under section', async () => {
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    const unitIdUrl = encodeURIComponent(unit.id);
    renderSectionCard(collapsedSections as any, `/course/:courseId?show=${unitIdUrl}`);

    const cardSubsections = await screen.findByTestId('section-card__subsections');
    const newSubsectionButton = await screen.findByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeInTheDocument();
    expect(newSubsectionButton).toBeInTheDocument();
  });

  it('check not extended section when URL "show" param not in section', async () => {
    const randomId = 'random-id';
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    renderSectionCard(collapsedSections as any, `/course/:courseId?show=${randomId}`);

    const cardSubsections = screen.queryByTestId('section-card__subsections');
    const newSubsectionButton = screen.queryByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeNull();
    expect(newSubsectionButton).toBeNull();
  });

  it('expands collapsed section when scrollState targets a child subsection', async () => {
    queryClient.setQueryData(courseOutlineQueryKeys.scrollToCourseItemId('5'), { id: subsection.id });
    renderSectionCard({ isSectionsExpanded: false });

    expect(await screen.findByTestId('section-card__subsections')).toBeInTheDocument();
  });

  it('expands collapsed section when scrollState targets a unit inside a child subsection', async () => {
    queryClient.setQueryData(courseOutlineQueryKeys.scrollToCourseItemId('5'), { id: unit.id });
    renderSectionCard({ isSectionsExpanded: false });

    expect(await screen.findByTestId('section-card__subsections')).toBeInTheDocument();
  });

  it('does not expand collapsed section when scrollState targets an unrelated id', async () => {
    queryClient.setQueryData(courseOutlineQueryKeys.scrollToCourseItemId('5'), { id: 'unrelated-id' });
    renderSectionCard({ isSectionsExpanded: false });

    expect(screen.queryByTestId('section-card__subsections')).toBeNull();
  });
});
