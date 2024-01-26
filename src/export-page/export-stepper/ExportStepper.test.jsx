import React from 'react';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';

import messages from './messages';
import ExportStepper from './ExportStepper';
import { exportStepperPageMock } from './__mocks__';
import { fetchExportStatus } from '../data/thunks';
import { getExportStatusApiUrl } from '../data/api';


const courseId = 'course-123';
let axiosMock;
let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ExportStepper intl={{ formatMessage: jest.fn() }} courseId={courseId} viewOnly={false} />
    </IntlProvider>
  </AppProvider>
);

const ViewOnlyRootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ExportStepper intl={{ formatMessage: jest.fn() }} courseId={courseId} viewOnly={true} />
    </IntlProvider>
  </AppProvider>
);

describe('<ExportStepper />', () => {
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
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, exportStepperPageMock);
    executeThunk(fetchExportStatus(courseId), store.dispatch);
  });
  it('render stepper correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.stepperHeaderTitle.defaultMessage)).toBeInTheDocument();
  });
  it('render stepper correctly if button is disabled', () => {
    const { getByText } = render(<ViewOnlyRootWrapper />);
    expect(getByText(messages.stepperHeaderTitle.defaultMessage)).toBeInTheDocument();
    const buttonElement = getByText(messages.downloadCourseButtonTitle.defaultMessage, {
      selector: '.disabled',
    });
    expect(buttonElement).toBeInTheDocument();
  });
});
