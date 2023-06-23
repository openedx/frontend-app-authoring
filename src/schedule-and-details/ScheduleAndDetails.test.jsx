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
import { courseDetailsMock, courseSettingsMock } from './__mocks__';
import { getCourseDetailsApiUrl, getCourseSettingsApiUrl } from './data/api';
import { DATE_FORMAT } from './schedule-section/datepicker-control/constants';
import creditMessages from './credit-section/messages';
import pacingMessages from './pacing-section/messages';
import basicMessages from './basic-section/messages';
import scheduleMessages from './schedule-section/messages';
import genericMessages from '../generic/messages';
import messages from './messages';
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
    axiosMock
      .onGet(getCourseDetailsApiUrl(courseId))
      .reply(200, courseDetailsMock);
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, courseSettingsMock);
  });

  it('should render without errors', async () => {
    const { getByText, getByRole } = render(<RootWrapper />);
    await waitForElementToBeRemoved(getByRole('status'));

    expect(
      getByText(pacingMessages.pacingTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(
      getByText(basicMessages.basicTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(creditMessages.creditTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByText(scheduleMessages.scheduleTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByRole('navigation', { name: genericMessages.sidebarTitleOther.defaultMessage }),
    ).toBeInTheDocument();
  });

  it('should hide section with condition', async () => {
    const updatedResponse = {
      ...courseSettingsMock,
      creditEligibilityEnabled: false,
      isCreditCourse: false,
    };
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, updatedResponse);

    const { queryAllByText, getByRole } = render(<RootWrapper />);
    await waitForElementToBeRemoved(getByRole('status'));
    expect(
      queryAllByText(creditMessages.creditTitle.defaultMessage).length,
    ).toBe(0);
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

    expect(getByText(messages.alertWarning.defaultMessage)).toBeInTheDocument();
  });
});
