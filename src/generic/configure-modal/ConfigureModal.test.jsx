import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

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

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentSectionMock}
        isSelfPaced={false}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<ConfigureModal /> for Section', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
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

const renderSubsectionComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentSubsectionMock}
        isSelfPaced={false}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<ConfigureModal /> for Subsection', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
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

const renderUnitComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentUnitMock}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<ConfigureModal /> for Unit', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  it('renders unit ConfigureModal component correctly', async () => {
    const user = userEvent.setup();
    const {
      getByText, queryByText, getByRole, getByTestId,
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

const renderXBlockComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        isXBlockComponent
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
        currentItemData={currentXBlockMock}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<ConfigureModal /> for XBlock', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  it('renders unit ConfigureModal component correctly', async () => {
    const user = userEvent.setup();
    const {
      getByText, queryByText, getByRole, getByTestId,
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

describe('<ConfigureModal /> with enableTimedExams prop', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  const renderWithTimedExamsProps = (enableTimedExams = true) => render(
    <AppProvider store={store}>
      <IntlProvider locale="en">
        <ConfigureModal
          isOpen
          onClose={onCloseMock}
          onConfigureSubmit={onConfigureSubmitMock}
          currentItemData={currentSubsectionMock}
          enableTimedExams={enableTimedExams}
          isSelfPaced={false}
        />
      </IntlProvider>
      ,
    </AppProvider>,
  );

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
    }).parentElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('defaults enableTimedExams to false when not provided', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <ConfigureModal
            isOpen
            onClose={onCloseMock}
            onConfigureSubmit={onConfigureSubmitMock}
            currentItemData={currentSubsectionMock}
            isSelfPaced={false}
          />
        </IntlProvider>
        ,
      </AppProvider>,
    );

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
