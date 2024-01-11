import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import ConfigureModal from './ConfigureModal';
import messages from './messages';

// eslint-disable-next-line no-unused-vars
let axiosMock;
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

const currentSectionMock = {
  displayName: 'Section1',
  category: 'chapter',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  format: 'Not Graded',
  childInfo: {
    displayName: 'Subsection',
    children: [
      {
        displayName: 'Subsection 1',
        id: 1,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 11,
              displayName: 'Subsection_1 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 2',
        id: 2,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 21,
              displayName: 'Subsection_2 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 3',
        id: 3,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          children: [],
        },
      },
    ],
  },
};

const onCloseMock = jest.fn();
const onConfigureSubmitMock = jest.fn();

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    useSelector.mockReturnValue(currentSectionMock);
  });

  it('renders ConfigureModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();
    expect(getByText(`${currentSectionMock.displayName} Settings`)).toBeInTheDocument();
    expect(getByText(messages.basicTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.visibilityTabTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseDate.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.releaseTimeUTC.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('switches to the Visibility tab and renders correctly', () => {
    const { getByRole, getByText } = renderComponent();

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    expect(getByText('Section Visibility')).toBeInTheDocument();
    expect(getByText(messages.hideFromLearners.defaultMessage)).toBeInTheDocument();
  });

  it('disables the Save button and enables it if there is a change', () => {
    const { getByRole, getByPlaceholderText, getByTestId } = renderComponent();

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();

    const input = getByPlaceholderText('MM/DD/YYYY');
    fireEvent.change(input, { target: { value: '12/15/2023' } });

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    const checkbox = getByTestId('visibility-checkbox');
    fireEvent.click(checkbox);
    expect(saveButton).not.toBeDisabled();
  });
});

const currentSubsectionMock = {
  displayName: 'Subsection 1',
  id: 1,
  category: 'sequential',
  due: '',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  defaultTimeLimitMinutes: null,
  hideAfterDue: false,
  showCorrectness: false,
  format: 'Homework',
  courseGraders: ['Homework', 'Exam'],
  childInfo: {
    displayName: 'Unit',
    children: [
      {
        id: 11,
        displayName: 'Subsection_1 Unit 1',
      },
      {
        id: 12,
        displayName: 'Subsection_1 Unit 2',
      },
    ],
  },
};

const renderSubsectionComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    useSelector.mockReturnValue(currentSubsectionMock);
  });

  it('renders subsection ConfigureModal component correctly', () => {
    const { getByText, getByRole } = renderSubsectionComponent();
    expect(getByText(`${currentSubsectionMock.displayName} Settings`)).toBeInTheDocument();
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

  it('switches to the subsection Visibility tab and renders correctly', () => {
    const { getByRole, getByText } = renderSubsectionComponent();

    const visibilityTab = getByRole('tab', { name: messages.visibilityTabTitle.defaultMessage });
    fireEvent.click(visibilityTab);
    expect(getByText('Subsection Visibility')).toBeInTheDocument();
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
  });

  it('switches to the subsection Advanced tab and renders correctly', () => {
    const { getByRole, getByText } = renderSubsectionComponent();

    const advancedTab = getByRole('tab', { name: messages.advancedTabTitle.defaultMessage });
    fireEvent.click(advancedTab);
    expect(getByText(messages.setSpecialExam.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.none.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.timed.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.timedDescription.defaultMessage)).toBeInTheDocument();
  });

  it('disables the Save button and enables it if there is a change', () => {
    const { getByRole, getByTestId } = renderSubsectionComponent();

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();

    const input = getByTestId('grader-type-select');
    fireEvent.change(input, { target: { value: 'Exam' } });
    expect(saveButton).not.toBeDisabled();
  });
});

const currentUnitMock = {
  displayName: 'Unit 1',
  id: 1,
  category: 'vertical',
  due: '',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  defaultTimeLimitMinutes: null,
  hideAfterDue: false,
  showCorrectness: false,
  userPartitionInfo: {
    selectablePartitions: [
      {
        id: 50,
        name: 'Enrollment Track Groups',
        scheme: 'enrollment_track',
        groups: [
          {
            id: 6,
            name: 'Honor',
            selected: false,
            deleted: false,
          },
          {
            id: 2,
            name: 'Verified',
            selected: false,
            deleted: false,
          },
        ],
      },
      {
        id: 1508065533,
        name: 'Content Groups',
        scheme: 'cohort',
        groups: [
          {
            id: 1224170703,
            name: 'Content Group 1',
            selected: false,
            deleted: false,
          },
        ],
      },
    ],
    selectedPartitionIndex: -1,
    selectedGroupsLabel: '',
  },
};

const renderUnitComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <ConfigureModal
        isOpen
        onClose={onCloseMock}
        onConfigureSubmit={onConfigureSubmitMock}
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    useSelector.mockReturnValue(currentUnitMock);
  });

  it('renders unit ConfigureModal component correctly', () => {
    const {
      getByText, queryByText, getByRole, getByTestId,
    } = renderUnitComponent();
    expect(getByText(`${currentUnitMock.displayName} Settings`)).toBeInTheDocument();
    expect(getByText(messages.unitVisibility.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.hideFromLearners.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.restrictAccessTo.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.unitSelectGroupType.defaultMessage)).toBeInTheDocument();

    expect(queryByText(messages.unitSelectGroup.defaultMessage)).not.toBeInTheDocument();
    const input = getByTestId('group-type-select');

    [0, 1].forEach(groupeTypeIndex => {
      fireEvent.change(input, { target: { value: groupeTypeIndex } });

      expect(getByText(messages.unitSelectGroup.defaultMessage)).toBeInTheDocument();
      currentUnitMock
        .userPartitionInfo
        .selectablePartitions[groupeTypeIndex].groups
        .forEach(g => expect(getByText(g.name)).toBeInTheDocument());
    });

    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('disables the Save button and enables it if there is a change', () => {
    useSelector.mockReturnValue(
      {
        ...currentUnitMock,
        userPartitionInfo: {
          ...currentUnitMock.userPartitionInfo,
          selectedPartitionIndex: 0,
        },
      },
    );
    const { getByRole, getByTestId } = renderUnitComponent();

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });
    expect(saveButton).toBeDisabled();

    const input = getByTestId('group-type-select');
    // unrestrict access
    fireEvent.change(input, { target: { value: -1 } });
    expect(saveButton).not.toBeDisabled();

    fireEvent.change(input, { target: { value: 0 } });
    expect(saveButton).toBeDisabled();

    const checkbox = getByTestId('unit-visibility-checkbox');
    fireEvent.click(checkbox);
    expect(saveButton).not.toBeDisabled();
  });
});
