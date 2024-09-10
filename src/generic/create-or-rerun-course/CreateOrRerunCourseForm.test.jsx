import React from 'react';
import {
  fireEvent,
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactDOM from 'react-dom';

import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';

import { studioHomeMock } from '../../studio-home/__mocks__';
import { getStudioHomeApiUrl } from '../../studio-home/data/api';
import { fetchStudioHomeData } from '../../studio-home/data/thunks';
import { RequestStatus } from '../../data/constants';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { updateCreateOrRerunCourseQuery } from '../data/thunks';
import { getCreateOrRerunCourseUrl } from '../data/api';
import messages from './messages';
import { CreateOrRerunCourseForm } from '.';
import { initialState } from './factories/mockApiResponses';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    courseId: 'course-id-mock',
  }),
  useNavigate: () => mockedUsedNavigate,
}));

let axiosMock;
let store;
ReactDOM.createPortal = jest.fn(node => node);

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

const mockStore = async () => {
  axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

  await executeThunk(fetchStudioHomeData, store.dispatch);
};

describe('<CreateOrRerunCourseForm />', () => {
  afterEach(() => jest.clearAllMocks());
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore(initialState);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('renders form successfully', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();

    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(messages.courseDisplayNameLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(messages.courseOrgLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.courseOrgNoOptions.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(messages.courseNumberLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(messages.courseRunLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage)).toBeInTheDocument();
  });

  it('renders create course form with help text successfully', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    expect(screen.getByText(messages.courseDisplayNameCreateHelpText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('The name of the organization sponsoring the course.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('The unique number that identifies your course within your organization.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('The term in which your course will run.', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.createButton.defaultMessage })).toBeInTheDocument();
  });

  it('renders rerun course form with help text successfully', async () => {
    const initialProps = { ...props, isCreateNewCourse: false };
    render(<RootWrapper {...initialProps} />);
    await mockStore();

    expect(screen.getByText(messages.courseDisplayNameRerunHelpText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('The name of the organization sponsoring the new course. (This name is often the same as the original organization name.)', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(messages.courseNumberRerunHelpText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('The term in which the new course will run. (This value is often different than the original course run value.)', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.rerunCreateButton.defaultMessage })).toBeInTheDocument();
  });

  it('should call handleOnClickCancel if button cancel clicked', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    const cancelBtn = screen.getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelBtn);

    expect(onClickCancelMock).toHaveBeenCalled();
  });

  describe('handleOnClickCreate', () => {
    it('should call window.location.assign with url', async () => {
      render(<RootWrapper {...props} />);
      await mockStore();
      const url = '/course/courseId';
      const displayNameInput = screen.getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage);
      const orgInput = screen.getByText(messages.courseOrgNoOptions.defaultMessage);
      const numberInput = screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);
      const runInput = screen.getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage);
      const createBtn = screen.getByRole('button', { name: messages.createButton.defaultMessage });

      userEvent.type(displayNameInput, 'foo course name');
      fireEvent.click(orgInput);
      userEvent.type(numberInput, '777');
      userEvent.type(runInput, '1');
      userEvent.click(createBtn);
      await axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, { url });
      await executeThunk(updateCreateOrRerunCourseQuery({ org: 'testX', run: 'some' }), store.dispatch);

      expect(mockedUsedNavigate).toHaveBeenCalledWith(url);
    });
    it('should call window.location.assign with url and destinationCourseKey', async () => {
      render(<RootWrapper {...props} />);
      await mockStore();
      const url = '/course/';
      const destinationCourseKey = 'courseKey';
      const displayNameInput = screen.getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage);
      const orgInput = screen.getByText(messages.courseOrgNoOptions.defaultMessage);
      const numberInput = screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);
      const runInput = screen.getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage);
      const createBtn = screen.getByRole('button', { name: messages.createButton.defaultMessage });
      await axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, { url, destinationCourseKey });

      userEvent.type(displayNameInput, 'foo course name');
      fireEvent.click(orgInput);
      userEvent.type(numberInput, '777');
      userEvent.type(runInput, '1');
      userEvent.click(createBtn);
      await executeThunk(updateCreateOrRerunCourseQuery({ org: 'testX', run: 'some' }), store.dispatch);

      expect(mockedUsedNavigate).toHaveBeenCalledWith(`${url}${destinationCourseKey}`);
    });
  });

  it('should be disabled create button if form not filled', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    const createBtn = screen.getByRole('button', { name: messages.createButton.defaultMessage });
    expect(createBtn).toBeDisabled();
  });

  it('should be disabled rerun button if form not filled', async () => {
    const initialProps = { ...props, isCreateNewCourse: false };
    render(<RootWrapper {...initialProps} />);
    await mockStore();
    const rerunBtn = screen.getByRole('button', { name: messages.rerunCreateButton.defaultMessage });
    expect(rerunBtn).toBeDisabled();
  });

  it('shows error message when total length exceeds 65 characters', async () => {
    const updatedProps = {
      ...props,
      initialValues: {
        displayName: 'Long Title Course',
        org: 'long-org',
        number: 'number',
        run: '2024',
      },
    };

    render(<RootWrapper {...updatedProps} />);
    await mockStore();
    const numberInput = screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);

    fireEvent.change(numberInput, { target: { value: 'long-name-which-is-longer-than-65-characters-to-check-for-errors' } });

    waitFor(() => {
      expect(screen.getByText(messages.totalLengthError)).toBeInTheDocument();
    });
  });

  it('should be disabled create button if form has error', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    const createBtn = screen.getByRole('button', { name: messages.createButton.defaultMessage });
    const displayNameInput = screen.getByPlaceholderText(messages.courseDisplayNamePlaceholder.defaultMessage);
    const orgInput = screen.getByText(messages.courseOrgNoOptions.defaultMessage);
    const numberInput = screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);
    const runInput = screen.getByPlaceholderText(messages.courseRunPlaceholder.defaultMessage);

    fireEvent.change(displayNameInput, { target: { value: 'foo course name' } });
    fireEvent.click(orgInput);
    fireEvent.change(numberInput, { target: { value: 'number with invalid (+) symbol' } });
    fireEvent.change(runInput, { target: { value: 'number with invalid (=) symbol' } });

    waitFor(() => {
      expect(createBtn).toBeDisabled();
    });
  });

  it('shows typeahead dropdown with allowed to create org permissions', async () => {
    const updatedStudioData = { ...studioHomeMock, allowToCreateNewOrg: true };
    store = initializeStore({
      ...initialState,
      studioHome: {
        ...initialState.studioHome,
        studioHomeData: updatedStudioData,
      },
    });
    render(<RootWrapper {...props} />);
    await mockStore();

    expect(screen.getByPlaceholderText(messages.courseOrgPlaceholder.defaultMessage));
  });

  it('shows button pending state', async () => {
    store = initializeStore({
      ...initialState,
      generic: {
        ...initialState.generic,
        savingStatus: RequestStatus.PENDING,
      },
    });
    render(<RootWrapper {...props} />);
    await mockStore();
    expect(screen.getByRole('button', { name: messages.creatingButton.defaultMessage })).toBeInTheDocument();
  });

  it('shows alert error if postErrors presents', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    await axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, { errMsg: 'aaa' });
    await executeThunk(updateCreateOrRerunCourseQuery({ org: 'testX', run: 'some' }), store.dispatch);

    expect(screen.getByText('aaa')).toBeInTheDocument();
  });

  it('shows error on field', async () => {
    render(<RootWrapper {...props} />);
    await mockStore();
    const numberInput = screen.getByPlaceholderText(messages.courseNumberPlaceholder.defaultMessage);

    fireEvent.change(numberInput, { target: { value: 'number with invalid (+) symbol' } });

    waitFor(() => {
      expect(screen.getByText(messages.noSpaceError)).toBeInTheDocument();
    });
  });
});
