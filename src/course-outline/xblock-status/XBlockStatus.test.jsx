import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import XBlockStatus from './XBlockStatus';
import messages from './messages';

let store;

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const section = {
  id: '123',
  displayName: 'Section Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  category: 'chapter',
  explanatoryMessage: '',
  releasedToStudents: true,
  releaseDate: 'Feb 05, 2013 at 01:00 UTC',
  isProctoredExam: false,
  isOnboardingExam: false,
  isPracticeExam: false,
  staffOnlyMessage: false,
  userPartitionInfo: {
    selectedPartitionIndex: -1,
    selectedGroupsLabel: '',
  },
  hasPartitionGroupComponents: false,
  format: 'Homework',
  dueDate: 'Dec 28, 2023 at 22:00 UTC',
  isTimeLimited: true,
  graded: true,
  courseGraders: ['Homework'],
  hideAfterDue: true,
};

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <XBlockStatus
        isSelfPaced={false}
        isCustomRelativeDatesActive={false}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<XBlockStatus /> for Instructor paced Section', () => {
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

  it('render XBlockStatus with explanatoryMessage', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...section,
        explanatoryMessage: 'some explanatory message',
      },
    });

    expect(queryByTestId('explanatory-message-span')).toBeInTheDocument();
    // when explanatory message is displayed, release date should not be visible
    expect(queryByTestId('release-status-div')).not.toBeInTheDocument();
  });

  it('renders XBlockStatus with release status, grading type, due date etc.', () => {
    const { queryByTestId } = renderComponent({ blockData: section });

    expect(queryByTestId('explanatory-message-span')).not.toBeInTheDocument();
    // when explanatory message is not displayed, release date should be visible
    const releaseStatusDiv = queryByTestId('release-status-div');
    expect(releaseStatusDiv).toBeInTheDocument();
    expect(releaseStatusDiv).toHaveTextContent(
      `${messages.releasedLabel.defaultMessage}${section.releaseDate}`,
    );

    // check grading type
    const gradingTypeDiv = queryByTestId('grading-type-div');
    expect(gradingTypeDiv).toBeInTheDocument();
    expect(gradingTypeDiv).toHaveTextContent(section.format);
    // check exam value label
    const examValue = queryByTestId('exam-value-span');
    expect(examValue).toBeInTheDocument();
    expect(examValue).toHaveTextContent(messages.timedExam.defaultMessage);
    // check due date div
    const dueDateDiv = queryByTestId('due-date-div');
    expect(dueDateDiv).toBeInTheDocument();
    expect(dueDateDiv).toHaveTextContent(
      `${messages.dueLabel.defaultMessage} ${section.dueDate}`,
    );
    // self paced weeks should not be visible as
    // isSelfPaced is false as well as isCustomRelativeDatesActive is false
    expect(queryByTestId('self-paced-relative-due-weeks-div')).not.toBeInTheDocument();

    // check hide after due date message
    const hideAfterDueMessage = queryByTestId('hide-after-due-message');
    expect(hideAfterDueMessage).toBeInTheDocument();
    expect(hideAfterDueMessage).toHaveTextContent(messages.hiddenAfterDueDate.defaultMessage);

    // check status messages
    const statusDiv = queryByTestId('status-messages-div');
    expect(statusDiv).not.toBeInTheDocument();
  });
});

describe('<XBlockStatus /> for self paced Section', () => {
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

  it('renders XBlockStatus with grading type, due weeks etc.', () => {
    const { queryByTestId } = renderComponent({
      isSelfPaced: true,
      isCustomRelativeDatesActive: true,
      blockData: {
        ...section,
        relativeWeeksDue: 2,
      },
    });

    // both explanatoryMessage & releaseStatusDiv should not be visible
    expect(queryByTestId('explanatory-message-span')).not.toBeInTheDocument();
    expect(queryByTestId('release-status-div')).not.toBeInTheDocument();

    // check grading type
    const gradingTypeDiv = queryByTestId('grading-type-div');
    expect(gradingTypeDiv).toBeInTheDocument();
    expect(gradingTypeDiv).toHaveTextContent(section.format);
    // due date should not be visible for self paced courses.
    expect(queryByTestId('due-date-div')).not.toBeInTheDocument();
    // check selfPacedRelativeDueWeeksDiv
    const selfPacedRelativeDueWeeksDiv = queryByTestId('self-paced-relative-due-weeks-div');
    expect(selfPacedRelativeDueWeeksDiv).toBeInTheDocument();
    expect(selfPacedRelativeDueWeeksDiv).toHaveTextContent(
      messages.customDueDateLabel.defaultMessage,
    );

    // check hide after due date message
    const hideAfterDueMessage = queryByTestId('hide-after-due-message');
    expect(hideAfterDueMessage).toBeInTheDocument();
    expect(hideAfterDueMessage).toHaveTextContent(messages.hiddenAfterEndDate.defaultMessage);

    // check status messages
    expect(queryByTestId('status-messages-div')).not.toBeInTheDocument();
  });

  it('renders XBlockStatus with grading mismatch alert', () => {
    const { queryByText } = renderComponent({
      blockData: {
        ...section,
        format: 'Fun',
      },
    });

    // check alert
    const alert = queryByText(messages.gradingPolicyMismatchText.defaultMessage);
    expect(alert).toBeInTheDocument();
  });
});

const subsection = {
  id: '123',
  displayName: 'Subsection Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  category: 'sequential',
  explanatoryMessage: '',
  releasedToStudents: false,
  releaseDate: 'Feb 05, 2025 at 01:00 UTC',
  isProctoredExam: false,
  isOnboardingExam: false,
  isPracticeExam: false,
  prereq: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@dbe8fc0',
  prereqs: [
    {
      blockDisplayName: 'Find your study buddy',
      blockUsageKey: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@dbe8fc0',
    },
    {
      blockDisplayName: 'Something else',
      blockUsageKey: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sdafyrb',
    },
  ],
  staffOnlyMessage: false,
  userPartitionInfo: {
    selectedPartitionIndex: -1,
    selectedGroupsLabel: '',
  },
  hasPartitionGroupComponents: false,
  format: 'Homework',
  dueDate: 'Dec 28, 2023 at 22:00 UTC',
  isTimeLimited: true,
  graded: true,
  courseGraders: ['Homework'],
  hideAfterDue: true,
};

describe('<XBlockStatus /> for Instructor paced Subsection', () => {
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

  it('renders XBlockStatus with release status, grading type, due date etc.', () => {
    const { queryByTestId } = renderComponent({ blockData: subsection });

    expect(queryByTestId('explanatory-message-span')).not.toBeInTheDocument();
    // when explanatory message is not displayed, release date should be visible
    const releaseStatusDiv = queryByTestId('release-status-div');
    expect(releaseStatusDiv).toBeInTheDocument();
    expect(releaseStatusDiv).toHaveTextContent(
      `${messages.scheduledLabel.defaultMessage}${subsection.releaseDate}`,
    );

    // check grading type
    const gradingTypeDiv = queryByTestId('grading-type-div');
    expect(gradingTypeDiv).toBeInTheDocument();
    expect(gradingTypeDiv).toHaveTextContent(subsection.format);
    // check exam value label
    const examValue = queryByTestId('exam-value-span');
    expect(examValue).toBeInTheDocument();
    expect(examValue).toHaveTextContent(messages.timedExam.defaultMessage);
    // check due date div
    const dueDateDiv = queryByTestId('due-date-div');
    expect(dueDateDiv).toBeInTheDocument();
    expect(dueDateDiv).toHaveTextContent(
      `${messages.dueLabel.defaultMessage} ${subsection.dueDate}`,
    );
    // self paced weeks should not be visible as
    // isSelfPaced is false as well as isCustomRelativeDatesActive is false
    expect(queryByTestId('self-paced-relative-due-weeks-div')).not.toBeInTheDocument();

    // check hide after due date message
    const hideAfterDueMessage = queryByTestId('hide-after-due-message');
    expect(hideAfterDueMessage).toBeInTheDocument();
    expect(hideAfterDueMessage).toHaveTextContent(messages.hiddenAfterDueDate.defaultMessage);

    // check status messages
    const statusDiv = queryByTestId('status-messages-div');
    expect(statusDiv).toBeInTheDocument();
    expect(statusDiv).toHaveTextContent(messages.prerequisiteLabel.defaultMessage);
  });

  it('renders XBlockStatus with proctored exam info', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...subsection,
        isProctoredExam: true,
        isOnboardingExam: false,
        isPracticeExam: false,
      },
    });

    // check exam value label
    const examValue = queryByTestId('exam-value-span');
    expect(examValue).toBeInTheDocument();
    expect(examValue).toHaveTextContent(messages.proctoredExam.defaultMessage);
  });

  it('renders XBlockStatus with practice proctored exam info', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...subsection,
        isProctoredExam: true,
        isOnboardingExam: false,
        isPracticeExam: true,
      },
    });

    // check exam value label
    const examValue = queryByTestId('exam-value-span');
    expect(examValue).toBeInTheDocument();
    expect(examValue).toHaveTextContent(messages.practiceProctoredExam.defaultMessage);
  });

  it('renders XBlockStatus with onboarding exam info', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...subsection,
        isProctoredExam: true,
        isOnboardingExam: true,
        isPracticeExam: false,
      },
    });

    // check exam value label
    const examValue = queryByTestId('exam-value-span');
    expect(examValue).toBeInTheDocument();
    expect(examValue).toHaveTextContent(messages.onboardingExam.defaultMessage);
  });

  it('renders XBlockStatus correctly for graded but not time limited subsection', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...subsection,
        isTimeLimited: false,
        graded: true,
      },
    });

    // check grading type
    const gradingTypeDiv = queryByTestId('grading-type-div');
    expect(gradingTypeDiv).toBeInTheDocument();
    expect(gradingTypeDiv).toHaveTextContent(subsection.format);
    // exam value label should not be visible
    expect(queryByTestId('exam-value-span')).not.toBeInTheDocument();
    // check due date div
    const dueDateDiv = queryByTestId('due-date-div');
    expect(dueDateDiv).toBeInTheDocument();
    expect(dueDateDiv).toHaveTextContent(
      `${messages.dueLabel.defaultMessage} ${subsection.dueDate}`,
    );
    // self paced weeks should not be visible as
    // isSelfPaced is false as well as isCustomRelativeDatesActive is false
    expect(queryByTestId('self-paced-relative-due-weeks-div')).not.toBeInTheDocument();
  });
});

describe('<XBlockStatus /> for self paced Subsection', () => {
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

  it('renders XBlockStatus with grading type, due weeks etc.', () => {
    const { queryByTestId } = renderComponent({
      isSelfPaced: true,
      isCustomRelativeDatesActive: true,
      blockData: {
        ...subsection,
        relativeWeeksDue: 2,
      },
    });

    // both explanatoryMessage & releaseStatusDiv should not be visible
    expect(queryByTestId('explanatory-message-span')).not.toBeInTheDocument();
    expect(queryByTestId('release-status-div')).not.toBeInTheDocument();

    // check grading type
    const gradingTypeDiv = queryByTestId('grading-type-div');
    expect(gradingTypeDiv).toBeInTheDocument();
    expect(gradingTypeDiv).toHaveTextContent(subsection.format);
    // due date should not be visible for self paced courses.
    expect(queryByTestId('due-date-div')).not.toBeInTheDocument();
    // check selfPacedRelativeDueWeeksDiv
    const selfPacedRelativeDueWeeksDiv = queryByTestId('self-paced-relative-due-weeks-div');
    expect(selfPacedRelativeDueWeeksDiv).toBeInTheDocument();
    expect(selfPacedRelativeDueWeeksDiv).toHaveTextContent(
      messages.customDueDateLabel.defaultMessage,
    );

    // check hide after due date message
    const hideAfterDueMessage = queryByTestId('hide-after-due-message');
    expect(hideAfterDueMessage).toBeInTheDocument();
    expect(hideAfterDueMessage).toHaveTextContent(messages.hiddenAfterEndDate.defaultMessage);

    // check status messages
    const statusDiv = queryByTestId('status-messages-div');
    expect(statusDiv).toBeInTheDocument();
    expect(statusDiv).toHaveTextContent(messages.prerequisiteLabel.defaultMessage);
  });
});

const unit = {
  id: '123',
  displayName: 'Unit Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  category: 'vertical',
  explanatoryMessage: '',
  releasedToStudents: true,
  releaseDate: 'Feb 05, 2013 at 01:00 UTC',
  isProctoredExam: false,
  isOnboardingExam: false,
  isPracticeExam: false,
  staffOnlyMessage: false,
  userPartitionInfo: {
    selectedPartitionIndex: 1,
    selectedGroupsLabel: 'Some label',
  },
  hasPartitionGroupComponents: false,
  format: 'Homework',
  dueDate: 'Dec 28, 2023 at 22:00 UTC',
  isTimeLimited: true,
  graded: true,
  courseGraders: ['Homework'],
};

describe('<XBlockStatus /> for unit', () => {
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

  it('renders XBlockStatus with status messages', () => {
    const { queryByTestId } = renderComponent({ blockData: unit });

    expect(queryByTestId('explanatory-message-span')).not.toBeInTheDocument();
    expect(queryByTestId('release-status-div')).not.toBeInTheDocument();

    // grading type should not be visible
    expect(queryByTestId('grading-type-div')).not.toBeInTheDocument();
    // due date should not be visible
    expect(queryByTestId('due-date-div')).not.toBeInTheDocument();

    // self paced weeks should not be visible for units
    expect(queryByTestId('self-paced-relative-due-weeks-div')).not.toBeInTheDocument();

    // check hide after due date message
    // hide after due date message should not be visible as the flag is set to false
    expect(queryByTestId('hide-after-due-message')).not.toBeInTheDocument();

    // check status messages for partition info
    const statusDiv = queryByTestId('status-messages-div');
    expect(statusDiv).toBeInTheDocument();
    expect(statusDiv).toHaveTextContent(messages.restrictedUnitAccess.defaultMessage);
  });

  it('renders XBlockStatus with status messages', () => {
    const { queryByTestId } = renderComponent({
      blockData: {
        ...unit,
        hasPartitionGroupComponents: true,
        userPartitionInfo: {
          selectedPartitionIndex: -1,
          selectedGroupsLabel: '',
        },
      },
    });

    // check status messages for partition info
    const statusDiv = queryByTestId('status-messages-div');
    expect(statusDiv).toBeInTheDocument();
    expect(statusDiv).toHaveTextContent(messages.restrictedUnitAccessToSomeContent.defaultMessage);
  });
});
