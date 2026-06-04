import {
  screen,
  within,
} from '@src/testUtils';

import userEvent from '@testing-library/user-event';
import {
  mockAcceptLibBlockChanges as mockUseAcceptLibraryBlockChanges,
  mockCardAuthoringContext,
  mockIgnoreLibBlockChanges as mockUseIgnoreLibraryBlockChanges,
  mockOpenPublishModal,
  mockCourseOutlineContextOverrides,
  renderCard,
  setupCardTestMocks,
} from '../__mocks__/testSetup';
import { mockSection as section, mockSubsection as subsection, mockUnit as unit } from '../__mocks__/testSetup';
import { describeCard, type CardTestConfig } from '../__mocks__/card-test-factory';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';

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

const renderUnitCard = (props?: Record<string, unknown>) => {
  const result = renderCard(
    <UnitCard
      section={section}
      subsection={subsection}
      unit={unit}
      index={1}
      getPossibleMoves={jest.fn()}
      onOrderChange={jest.fn()}
      onOpenDeleteModal={jest.fn()}
      onOpenConfigureModal={jest.fn()}
      isSelfPaced={false}
      isCustomRelativeDatesActive={false}
      discussionsSettings={{ providerType: '', enableGradedUnits: false }}
      {...props}
    />,
    {
      path: '/course/:courseId',
      params: { courseId: '5' },
    },
  );
  return { ...result, container: result.container as HTMLElement };
};

// ─── Shared tests via factory ─────────────────────────────────────────
describeCard(
  {
    name: 'UnitCard',
    testId: 'unit-card',
    headerTestId: 'unit-card-header',
    mockBlock: unit,
    blockPropKey: 'unit',
    syncNodeName: 'unit name',
    hasExpandCollapse: false,
    render: renderUnitCard,
    skipActionsHideTest: true,
    extraRenderAssertions: () => {
      const link = screen.getByTestId('unit-card-header__title-link');
      expect(link).toHaveAttribute('href', '/some/block-v1:UNIX+UX1+2025_T3+type@unit+block@0');
    },
    // UnitCard needs subsectionId + sectionId in the align payload
    alignAssert: (mockSetSelectedContainerState: jest.Mock) => {
      expect(mockSetSelectedContainerState).toHaveBeenCalledWith({
        currentId: unit.id,
        subsectionId: subsection.id,
        sectionId: section.id,
        index: 1,
      });
    },
  } satisfies CardTestConfig,
);

// ─── Unique tests ─────────────────────────────────────────────────────
describe('<UnitCard />', () => {
  beforeEach(() => {
    setupCardTestMocks();
  });

  it('hides duplicate & delete option based on duplicable & deletable action flag', async () => {
    const user = userEvent.setup();
    renderUnitCard({
      unit: {
        ...unit,
        actions: { draggable: true, childAddable: false, deletable: false, duplicable: false },
      },
    });
    const element = await screen.findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await user.click(menu);
    expect(within(element).queryByTestId('unit-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('unit-card-header__menu-delete-button')).not.toBeInTheDocument();
  });

  it('hides move, duplicate & delete options if parent was imported from library', async () => {
    const user = userEvent.setup();
    // Need to render within the test after setupCardTestMocks resets
    renderUnitCard({
      subsection: {
        ...subsection,
        upstreamInfo: {
          readyToSync: true,
          upstreamRef: 'lct:org1:lib1:subsection:1',
          versionSynced: 1,
        },
      },
    });
    const element = await screen.findByTestId('unit-card');
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
    renderUnitCard({
      unit: {
        ...unit,
        enableCopyPasteUnits: true,
      },
    });
    const element = await screen.findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await user.click(menu);
    expect(within(element).queryByText(cardMessages.menuCopy.defaultMessage)).toBeInTheDocument();
  });

  it('hides status badge for unscheduled units', async () => {
    const { queryByRole } = renderUnitCard({
      unit: {
        ...unit,
        visibilityState: 'unscheduled',
        hasChanges: false,
      },
    });
    expect(queryByRole('status')).not.toBeInTheDocument();
  });
});
