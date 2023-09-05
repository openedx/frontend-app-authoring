import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  act, render, waitFor, fireEvent,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { courseDetailsMock, courseSettingsMock } from './__mocks__';
import { getCourseDetailsApiUrl, getCourseSettingsApiUrl } from './data/api';
import { DATE_FORMAT } from '../constants';
import creditMessages from './credit-section/messages';
import pacingMessages from './pacing-section/messages';
import basicMessages from './basic-section/messages';
import scheduleMessages from './schedule-section/messages';
import genericMessages from '../generic/help-sidebar/messages';
import messages from './messages';
import ScheduleAndDetails from '.';

let axiosMock;
let store;
const courseId = '123';

// Mock the tinymce lib
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

// Mock the TinyMceWidget from frontend-lib-content-components
jest.mock('@edx/frontend-lib-content-components', () => ({
  TinyMceWidget: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea {...props} onFocus={() => {}} onBlur={() => {}} />
)));

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
    const { getByText, getByRole, getAllByText } = render(<RootWrapper />);
    await waitFor(() => {
      const scheduleAndDetailElements = getAllByText(messages.headingTitle.defaultMessage);
      const scheduleAndDetailTitle = scheduleAndDetailElements[0];
      expect(
        getByText(pacingMessages.pacingTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(scheduleAndDetailTitle).toBeInTheDocument();
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
        getByRole('navigation', {
          name: genericMessages.sidebarTitleOther.defaultMessage,
        }),
      ).toBeInTheDocument();
    });
  });

  it('should hide credit section with condition', async () => {
    const updatedResponse = {
      ...courseSettingsMock,
      creditEligibilityEnabled: false,
      isCreditCourse: false,
    };
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, updatedResponse);

    const { queryAllByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(
        queryAllByText(creditMessages.creditTitle.defaultMessage).length,
      ).toBe(0);
    });
  });

  it('should show save alert onChange ', async () => {
    const { getAllByPlaceholderText, getByText } = render(
      <RootWrapper />,
    );
    await waitFor(() => {
      const inputs = getAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
      act(() => {
        fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });
      });

      expect(
        getByText(messages.alertWarning.defaultMessage),
      ).toBeInTheDocument();
    });
  });
});
