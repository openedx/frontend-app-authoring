import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AccessManagedXBlockDataTypes } from '@src/data/types';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import * as authzApi from '@src/authz/data/api';
import initializeStore from '../../store';
import ConfigureModal from './ConfigureModal';
import {
  currentSectionMock,
  currentSubsectionMock,
  currentUnitMock,
  currentXBlockMock,
} from './__mocks__';
import messages from './messages';

let store;
let queryClient;
const mockPathname = '/foo-bar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const onCloseMock = jest.fn();
const onConfigureSubmitMock = jest.fn();

/**
 * Common setup. Note `mockWaffleFlags()` leaves authz disabled, so
 * `useCourseUserPermissions` synchronously falls back to granting every permission
 * (`canEditCourseContent === true`). Tests that need the denied path re-enable authz
 * and mock `validateUserPermissions` explicitly.
 */
const setupMocks = () => {
  initializeMockApp({
    authenticatedUser: {
      userId: 3,
      username: 'abc123',
      administrator: true,
      roles: [],
    },
  });
  store = initializeStore();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  mockWaffleFlags();
};

// AppProvider supplies the Router that CourseAuthoringProvider (useNavigate) needs; the
// QueryClientProvider is required for the course-details/permissions queries it runs.
const withProviders = (ui: React.ReactNode) => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient}>
        <CourseAuthoringProvider courseId={'courseId'}>
          {ui}
        </CourseAuthoringProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

const renderComponent = () =>
  render(withProviders(
    <ConfigureModal
      isOpen
      onClose={onCloseMock}
      onConfigureSubmit={onConfigureSubmitMock}
      currentItemData={currentSectionMock as unknown as AccessManagedXBlockDataTypes}
      isSelfPaced={false}
    />,
  ));

describe('<ConfigureModal /> for Section', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('renders ConfigureModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();
    expect(getByText(`${currentSectionMock.displayName} settings`)).toBeInTheDocument();
    expect(getByText(messages.basicTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.visibilityTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseDate.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseTimeUTC.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('switches to the Visibility tab and renders correctly', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderComponent();

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    await user.click(visibilityTab);
    expect(getByText('Section visibility')).toBeInTheDocument();
    expect(getByText(messages.hideFromLearners.defaultMessage)).toBeInTheDocument();
  });
});

const renderSubsectionComponent = (props?: object) =>
  render(withProviders(
    <ConfigureModal
      isOpen
      onClose={onCloseMock}
      onConfigureSubmit={onConfigureSubmitMock}
      currentItemData={currentSubsectionMock as unknown as AccessManagedXBlockDataTypes}
      isSelfPaced={false}
      {...props}
    />,
  ));

describe('<ConfigureModal /> for Subsection', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('renders subsection ConfigureModal component correctly', () => {
    const { getByText, getByRole } = renderSubsectionComponent();
    expect(getByText(`${currentSubsectionMock.displayName} settings`)).toBeInTheDocument();
    expect(getByText(messages.basicTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.visibilityTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.advancedTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseDate.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseTimeUTC.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.grading.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradeAs.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.dueDate.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.dueTimeUTC.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('hides release and due dates for self paced courses', () => {
    const { queryByText } = renderSubsectionComponent({ isSelfPaced: true });
    expect(queryByText(messages.releaseDate.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.releaseTimeUTC.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.dueDate.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.dueTimeUTC.defaultMessage)).not.toBeInTheDocument();
  });

  it('switches to the subsection Visibility tab and renders correctly', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderSubsectionComponent();

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    await user.click(visibilityTab);
    expect(getByText('Subsection visibility')).toBeInTheDocument();
    expect(getByText(messages.showEntireSubsection.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.showEntireSubsectionDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideContentAfterDue.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideContentAfterDueDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideEntireSubsection.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideEntireSubsectionDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.assessmentResultsVisibility.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.alwaysShowAssessmentResults.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.alwaysShowAssessmentResultsDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.neverShowAssessmentResults.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.neverShowAssessmentResultsDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.showAssessmentResultsPastDue.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.showAssessmentResultsPastDueDescription.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.neverShowAssessmentResultsButIncludeGrade.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.neverShowAssessmentResultsButIncludeGradeDescription.defaultMessage)).toBeInTheDocument();
  });

  it('switches to the subsection Advanced tab and renders correctly', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderSubsectionComponent();

    const advancedTab = getByRole('tab', { name: messages.advancedTabTitle.defaultMessage });
    await user.click(advancedTab);
    expect(getByText(messages.setSpecialExam.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.none.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.timed.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.timedDescription.defaultMessage)).toBeInTheDocument();
  });
});

const renderUnitComponent = (props?: object) =>
  render(withProviders(
    <ConfigureModal
      isOpen
      onClose={onCloseMock}
      onConfigureSubmit={onConfigureSubmitMock}
      currentItemData={currentUnitMock as unknown as AccessManagedXBlockDataTypes}
      {...props}
    />,
  ));

describe('<ConfigureModal /> for Unit', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('renders unit ConfigureModal component correctly', async () => {
    const user = userEvent.setup();
    const {
      getByText,
      queryByText,
      getByRole,
      getByTestId,
    } = renderUnitComponent();
    expect(getByText(`${currentUnitMock.displayName} settings`)).toBeInTheDocument();
    expect(getByText(messages.unitVisibility.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideFromLearners.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.discussionEnabledCheckbox.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.restrictAccessTo.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.unitSelectGroupType.defaultMessage)).toBeInTheDocument();

    expect(queryByText(messages.unitSelectGroup.defaultMessage)).not.toBeInTheDocument();
    const input = getByTestId('group-type-select');

    await user.selectOptions(input, '0');
    expect(getByText(messages.unitSelectGroup.defaultMessage)).toBeInTheDocument();
    currentUnitMock
      .userPartitionInfo
      .selectablePartitions['0'].groups
      .forEach(g => expect(getByText(g.name)).toBeInTheDocument());

    await user.selectOptions(input, '1');
    expect(getByText(messages.unitSelectGroup.defaultMessage)).toBeInTheDocument();
    currentUnitMock
      .userPartitionInfo
      .selectablePartitions['1'].groups
      .forEach(g => expect(getByText(g.name)).toBeInTheDocument());

    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();

    expect(queryByText(messages.discussionEnabledSectionTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.discussionEnabledCheckbox.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.discussionEnabledDescription.defaultMessage)).toBeInTheDocument();
  });
});

const renderXBlockComponent = (props?: object) =>
  render(withProviders(
    <ConfigureModal
      isOpen
      isXBlockComponent
      onClose={onCloseMock}
      onConfigureSubmit={onConfigureSubmitMock}
      currentItemData={currentXBlockMock as unknown as AccessManagedXBlockDataTypes}
      {...props}
    />,
  ));

describe('<ConfigureModal /> for XBlock', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('renders unit ConfigureModal component correctly', async () => {
    const user = userEvent.setup();
    const {
      getByText,
      queryByText,
      getByRole,
      getByTestId,
    } = renderXBlockComponent();
    expect(getByText(`Editing access for: ${currentUnitMock.displayName}`)).toBeInTheDocument();
    expect(queryByText(messages.unitVisibility.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.hideFromLearners.defaultMessage)).not.toBeInTheDocument();
    expect(getByText(messages.restrictAccessTo.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.unitSelectGroupType.defaultMessage)).toBeInTheDocument();

    expect(queryByText(messages.unitSelectGroup.defaultMessage)).not.toBeInTheDocument();
    const input = getByTestId('group-type-select');

    await user.selectOptions(input, '0');
    expect(getByText(messages.unitSelectGroup.defaultMessage)).toBeInTheDocument();
    currentUnitMock
      .userPartitionInfo
      .selectablePartitions['0'].groups
      .forEach(g => expect(getByText(g.name)).toBeInTheDocument());

    await user.selectOptions(input, '1');
    expect(getByText(messages.unitSelectGroup.defaultMessage)).toBeInTheDocument();
    currentUnitMock
      .userPartitionInfo
      .selectablePartitions['1'].groups
      .forEach(g => expect(getByText(g.name)).toBeInTheDocument());

    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();

    expect(queryByText(messages.discussionEnabledSectionTitle.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.discussionEnabledCheckbox.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.discussionEnabledDescription.defaultMessage)).not.toBeInTheDocument();
  });
});

describe('<ConfigureModal /> permission gating', () => {
  let validateUserPermissionsMock;

  beforeEach(() => {
    setupMocks();
    // Enable authz so `canEditCourseContent` is driven by the mocked permissions API.
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = jest.spyOn(authzApi, 'validateUserPermissions');
  });

  it('disables the unit visibility, access and discussion controls when the user cannot edit', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: false });
    const { getByTestId, getByRole } = renderUnitComponent();

    await waitFor(() => expect(getByTestId('unit-visibility-checkbox')).toBeDisabled());
    expect(getByTestId('group-type-select')).toBeDisabled();
    expect(
      getByRole('checkbox', { name: messages.discussionEnabledCheckbox.defaultMessage }),
    ).toBeDisabled();
  });

  it('enables the unit visibility and access controls when the user can edit', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: true });
    const { getByTestId } = renderUnitComponent();

    await waitFor(() => expect(getByTestId('unit-visibility-checkbox')).not.toBeDisabled());
    expect(getByTestId('group-type-select')).not.toBeDisabled();
  });

  it('disables the group type select for an xblock when the user cannot edit', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: false });
    const { getByTestId } = renderXBlockComponent();

    await waitFor(() => expect(getByTestId('group-type-select')).toBeDisabled());
  });

  it('hides the footer Cancel and Save buttons when the user cannot edit', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: false });
    const { getByTestId, queryByRole } = renderUnitComponent();

    // Wait for the modal body to render (the visibility checkbox is always present), then
    // confirm the permission-gated footer actions are absent.
    await waitFor(() => expect(getByTestId('unit-visibility-checkbox')).toBeInTheDocument());
    expect(queryByRole('button', { name: messages.cancelButton.defaultMessage })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: messages.saveButton.defaultMessage })).not.toBeInTheDocument();
  });

  it('shows the footer Cancel and Save buttons when the user can edit', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: true });
    const { findByRole, getByRole } = renderUnitComponent();

    expect(await findByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
  });
});

describe('<ConfigureModal /> with enableTimedExams prop', () => {
  beforeEach(() => {
    setupMocks();
  });

  const renderWithTimedExamsProps = (enableTimedExams = true) =>
    render(withProviders(
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentSubsectionMock as unknown as AccessManagedXBlockDataTypes}
        enableTimedExams={enableTimedExams}
        isSelfPaced={false}
      />,
    ));

  it('passes enableTimedExams=true to AdvancedTab', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderWithTimedExamsProps(true);

    const advancedTab = getByRole('tab', {
      name: messages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);

    expect(
      getByText(messages.setSpecialExam.defaultMessage),
    ).toBeInTheDocument();

    const noneRadio = getByRole('radio', {
      name: messages.none.defaultMessage,
    });
    const timedRadio = getByRole('radio', {
      name: messages.timed.defaultMessage,
    });

    expect(noneRadio).not.toBeDisabled();
    expect(timedRadio).not.toBeDisabled();
  });

  it('passes enableTimedExams=false to AdvancedTab and shows disabled state', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderWithTimedExamsProps(false);

    const advancedTab = getByRole('tab', {
      name: messages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);

    expect(
      getByText(messages.setSpecialExam.defaultMessage),
    ).toBeInTheDocument();

    const noneRadio = getByRole('radio', {
      name: messages.none.defaultMessage,
    });
    const timedRadio = getByRole('radio', {
      name: messages.timed.defaultMessage,
    });

    expect(noneRadio).toBeDisabled();
    expect(timedRadio).toBeDisabled();
  });

  it('shows tooltip when enableTimedExams is false', async () => {
    const user = userEvent.setup();
    const { getByRole } = renderWithTimedExamsProps(false);

    const advancedTab = getByRole('tab', {
      name: messages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);

    const buttons = getByRole('tab', {
      name: messages.advancedTabTitle.defaultMessage,
    }).parentElement?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  it('defaults enableTimedExams to false when not provided', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(withProviders(
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentSubsectionMock as unknown as AccessManagedXBlockDataTypes}
        isSelfPaced={false}
      />,
    ));

    const advancedTab = getByRole('tab', {
      name: messages.advancedTabTitle.defaultMessage,
    });
    await user.click(advancedTab);

    const noneRadio = getByRole('radio', {
      name: messages.none.defaultMessage,
    });
    const timedRadio = getByRole('radio', {
      name: messages.timed.defaultMessage,
    });

    expect(noneRadio).toBeDisabled();
    expect(timedRadio).toBeDisabled();
  });
});
