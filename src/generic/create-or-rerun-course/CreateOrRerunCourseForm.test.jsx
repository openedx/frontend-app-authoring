import React from 'react';
import { useSelector } from 'react-redux';
import {
  act,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import { studioHomeMock } from '../../studio-home/__mocks__';
import { RequestStatus } from '../../data/constants';
import initializeStore from '../../store';
import messages from './messages';
import { CreateOrRerunCourseForm } from '.';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    courseId: 'course-id-mock',
  }),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

let store;

const onClickCancelMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <CreateOrRerunCourseForm {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  title: 'Mocked title',
  isCreateNewCourse: true,
  initialValues: {
    displayName: '',
    org: '',
    number: '',
    run: '',
  },
  onClickCancel: onClickCancelMock,
};

describe('<CreateOrRerunCourseForm />', () => {
  afterEach(() => jest.clearAllMocks());
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
    useSelector.mockReturnValue(studioHomeMock);
  });

  it('renders form successfully', () => {
    const { getByText, getByPlaceholderText } = render(
      <RootWrapper {...props} />,
    );
    expect(getByText(props.title)).toBeInTheDocument();
    expect(getByText(messages.courseDisplayNameLabel.defaultMessage)).toBeInTheDocument();
    expect(getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.courseOrgLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.courseOrgNoOptions.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.courseNumberLabel.defaultMessage)).toBeInTheDocument();
    expect(getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.courseRunLabel.defaultMessage)).toBeInTheDocument();
    expect(getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage)).toBeInTheDocument();
  });

  it('renders create course form with help text successfully', () => {
    const { getByText, getByRole } = render(<RootWrapper {...props} />);
    expect(getByText(messages.courseDisplayNameCreateHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText('The name of the organization sponsoring the course.', { exact: false })).toBeInTheDocument();
    expect(getByText('The unique number that identifies your course within your organization.', { exact: false })).toBeInTheDocument();
    expect(getByText('The term in which your course will run.', { exact: false })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.createButton.defaultMessage })).toBeInTheDocument();
  });

  it('renders rerun course form with help text successfully', () => {
    const initialProps = { ...props, isCreateNewCourse: false };
    const { getByText, getByRole } = render(
      <RootWrapper {...initialProps} />,
    );
    expect(getByText(messages.courseDisplayNameRerunHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText('The name of the organization sponsoring the new course. (This name is often the same as the original organization name.)', { exact: false })).toBeInTheDocument();
    expect(getByText(messages.courseNumberRerunHelpText.defaultMessage)).toBeInTheDocument();
    expect(getByText('The term in which the new course will run. (This value is often different than the original course run value.)', { exact: false })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.rerunCreateButton.defaultMessage })).toBeInTheDocument();
  });

  it('should call handleOnClickCancel if button cancel clicked', async () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const cancelBtn = getByRole('button', { name: messages.cancelButton.defaultMessage });
    act(() => {
      fireEvent.click(cancelBtn);
    });
    expect(onClickCancelMock).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      {
        payload: {},
        type: 'generic/updatePostErrors',
      },
    );
  });

  it('should call handleOnClickCreate if button create clicked', async () => {
    const { getByPlaceholderText, getByText, getByRole } = render(<RootWrapper {...props} />);
    const displayNameInput = getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage);
    const orgInput = getByText(messages.courseOrgNoOptions.defaultMessage);
    const numberInput = getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);
    const runInput = getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage);
    const createBtn = getByRole('button', { name: messages.createButton.defaultMessage });

    act(() => {
      fireEvent.change(displayNameInput, { target: { value: 'foo course name' } });
      fireEvent.click(orgInput);
      fireEvent.change(numberInput, { target: { value: '777' } });
      fireEvent.change(runInput, { target: { value: '1' } });
      fireEvent.click(createBtn);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      {
        payload: {},
        type: 'generic/updatePostErrors',
      },
    );
  });

  it('should be disabled create button if form not filled', () => {
    const { getByRole } = render(<RootWrapper {...props} />);
    const createBtn = getByRole('button', { name: messages.createButton.defaultMessage });
    expect(createBtn).toBeDisabled();
  });

  it('should be disabled rerun button if form not filled', () => {
    const initialProps = { ...props, isCreateNewCourse: false };
    const { getByRole } = render(<RootWrapper {...initialProps} />);
    const rerunBtn = getByRole('button', { name: messages.rerunCreateButton.defaultMessage });
    expect(rerunBtn).toBeDisabled();
  });

  it('should be disabled create button if form has error', () => {
    const { getByRole, getByPlaceholderText, getByText } = render(<RootWrapper {...props} />);
    const createBtn = getByRole('button', { name: messages.createButton.defaultMessage });
    const displayNameInput = getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage);
    const orgInput = getByText(messages.courseOrgNoOptions.defaultMessage);
    const numberInput = getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);
    const runInput = getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage);

    act(() => {
      fireEvent.change(displayNameInput, { target: { value: 'foo course name' } });
      fireEvent.click(orgInput);
      fireEvent.change(numberInput, { target: { value: 'number with invalid (+) symbol' } });
      fireEvent.change(runInput, { target: { value: 'number with invalid (=) symbol' } });
    });

    waitFor(() => {
      expect(createBtn).toBeDisabled();
    });
  });

  it('shows typeahead dropdown with allowed to create org permissions', () => {
    useSelector.mockReturnValue({ ...studioHomeMock, allowToCreateNewOrg: true });
    const { getByPlaceholderText } = render(<RootWrapper {...props} />);
    expect(getByPlaceholderText(messages.courseOrgPlaceholder.defaultMessage));
  });

  it('shows button pending state', () => {
    useSelector.mockReturnValue(RequestStatus.PENDING);
    const { getByRole } = render(<RootWrapper {...props} />);
    expect(getByRole('button', { name: messages.creatingButton.defaultMessage })).toBeInTheDocument();
  });
  it('shows alert error if postErrors presents', () => {
    useSelector.mockReturnValue({
      errMsg: 'aaa',
      orgErrMsg: 'bbb',
      courseErrMsg: 'ccc',
    });
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText('aaa')).toBeInTheDocument();
  });
});
