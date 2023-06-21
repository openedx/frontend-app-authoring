import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  act,
  render,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { courseDetails, courseSettings } from './__mocks__';
import { getCourseDetailsApiUrl, getCourseSettingsApiUrl } from './data/api';
import { DATE_FORMAT } from './schedule-section/datepicker-control/constants';
import ScheduleAndDetails from '.';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ScheduleAndDetails intl={injectIntl} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<ScheduleAndDetails />', () => {
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
    axiosMock.onGet(getCourseDetailsApiUrl(courseId)).reply(200, courseDetails);
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, courseSettings);
  });

  it('should render without errors', async () => {
    const { getAllByText, getByText, getByRole } = render(<RootWrapper />);
    await waitForElementToBeRemoved(getByRole('status'));
    const scheduleAndDetails = getAllByText(/Schedule & details/i);
    const coursePacing = getAllByText(/Course Pacing/i);

    expect(scheduleAndDetails.length).toBe(2);
    expect(scheduleAndDetails.length).toBe(2);
    expect(getByText(/Basic information/i));
    expect(getByText(/Course Credit Requirements/i));
    expect(coursePacing.length).toBe(2);
    expect(getByText(/Course schedule/i));
    expect(getByRole('navigation', { name: /Other Course Settings/i }));
  });

  it('should hide section with condition', async () => {
    const updatedResponse = {
      ...courseSettings,
      creditEligibilityEnabled: false,
      isCreditCourse: false,
    };
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, updatedResponse);

    const { queryAllByText, getByRole } = render(<RootWrapper />);
    await waitForElementToBeRemoved(getByRole('status'));
    expect(queryAllByText('Course Credit Requirements').length).toBe(0);
  });

  it('should show save alert onChange ', async () => {
    const { getAllByPlaceholderText, getByRole, getByText } = render(
      <RootWrapper />,
    );
    await waitForElementToBeRemoved(getByRole('status'));
    const inputs = getAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    act(() => {
      fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });
    });

    expect(getByText(/You`ve made some changes/i)).toBeInTheDocument();
  });
});
