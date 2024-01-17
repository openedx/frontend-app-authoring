import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { executeThunk } from '../utils';
import { advancedSettingsMock } from './__mocks__';
import { getCourseAdvancedSettingsApiUrl } from './data/api';
import { updateCourseAppSetting } from './data/thunks';
import AdvancedSettings from './AdvancedSettings';
import messages from './messages';
import { getUserPermissionsUrl, getUserPermissionsEnabledFlagUrl } from '../generic/data/api';
import { fetchUserPermissionsQuery, fetchUserPermissionsEnabledFlag } from '../generic/data/thunks';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';
const userId = 3;
const userPermissionsData = { permissions: ['view_course_settings', 'manage_advanced_settings'] };

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => {}}
    onBlur={() => {}}
  />
)));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <AdvancedSettings intl={injectIntl} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

const permissionsMockStore = async (permissions) => {
  axiosMock.onGet(getUserPermissionsUrl(courseId, userId)).reply(200, permissions);
  axiosMock.onGet(getUserPermissionsEnabledFlagUrl).reply(200, { enabled: true });
  await executeThunk(fetchUserPermissionsQuery(courseId), store.dispatch);
  await executeThunk(fetchUserPermissionsEnabledFlag(), store.dispatch);
};

const permissionDisabledMockStore = async () => {
  axiosMock.onGet(getUserPermissionsEnabledFlagUrl).reply(200, { enabled: false });
  await executeThunk(fetchUserPermissionsEnabledFlag(), store.dispatch);
};

describe('<AdvancedSettings />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(`${getCourseAdvancedSettingsApiUrl(courseId)}?fetch_all=0`)
      .reply(200, advancedSettingsMock);
    permissionsMockStore(userPermissionsData);
  });

  it('should render without errors', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      const advancedSettingsElement = getByText(messages.headingTitle.defaultMessage, {
        selector: 'h2.sub-header-title',
      });
      expect(advancedSettingsElement).toBeInTheDocument();
      expect(getByText(messages.policy.defaultMessage)).toBeInTheDocument();
      expect(getByText(/Do not modify these policies unless you are familiar with their purpose./i)).toBeInTheDocument();
    });
  });
  it('should render setting element', async () => {
    const { getByText, queryByText } = render(<RootWrapper />);
    await waitFor(() => {
      const advancedModuleListTitle = getByText(/Advanced Module List/i);
      expect(advancedModuleListTitle).toBeInTheDocument();
      expect(queryByText('Certificate web/html view enabled')).toBeNull();
    });
  });
  it('should change to onСhange', async () => {
    const { getByLabelText } = render(<RootWrapper />);
    await waitFor(() => {
      const textarea = getByLabelText(/Advanced Module List/i);
      expect(textarea).toBeInTheDocument();
      fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });
      expect(textarea.value).toBe('[1, 2, 3]');
    });
  });
  it('should display a warning alert', async () => {
    const { getByLabelText, getByText } = render(<RootWrapper />);
    await waitFor(() => {
      const textarea = getByLabelText(/Advanced Module List/i);
      fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
      expect(getByText(messages.buttonCancelText.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.buttonSaveText.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.alertWarning.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.alertWarningDescriptions.defaultMessage)).toBeInTheDocument();
    });
  });
  it('should display a tooltip on clicking on the icon', async () => {
    const { getByLabelText, getByText } = render(<RootWrapper />);
    await waitFor(() => {
      const button = getByLabelText(/Show help text/i);
      fireEvent.click(button);
      expect(getByText(/Enter the names of the advanced modules to use in your course./i)).toBeInTheDocument();
    });
  });
  it('should change deprecated button text ', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      const showDeprecatedItemsBtn = getByText(/Show Deprecated Settings/i);
      expect(showDeprecatedItemsBtn).toBeInTheDocument();
      fireEvent.click(showDeprecatedItemsBtn);
      expect(getByText(/Hide Deprecated Settings/i)).toBeInTheDocument();
    });
    expect(getByText('Certificate web/html view enabled')).toBeInTheDocument();
  });
  it('should reset to default value on click on Cancel button', async () => {
    const { getByLabelText, getByText } = render(<RootWrapper />);
    let textarea;
    await waitFor(() => {
      textarea = getByLabelText(/Advanced Module List/i);
    });
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(textarea.value).toBe('[3, 2, 1]');
    fireEvent.click(getByText(messages.buttonCancelText.defaultMessage));
    expect(textarea.value).toBe('[]');
  });
  it('should update the textarea value and display the updated value after clicking "Change manually"', async () => {
    const { getByLabelText, getByText } = render(<RootWrapper />);
    let textarea;
    await waitFor(() => {
      textarea = getByLabelText(/Advanced Module List/i);
    });
    fireEvent.change(textarea, { target: { value: '[3, 2, 1,' } });
    expect(textarea.value).toBe('[3, 2, 1,');
    fireEvent.click(getByText('Save changes'));
    fireEvent.click(getByText('Change manually'));
    expect(textarea.value).toBe('[3, 2, 1,');
  });
  it('should show success alert after save', async () => {
    const { getByLabelText, getByText } = render(<RootWrapper />);
    let textarea;
    await waitFor(() => {
      textarea = getByLabelText(/Advanced Module List/i);
    });
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(textarea.value).toBe('[3, 2, 1]');
    axiosMock
      .onPatch(`${getCourseAdvancedSettingsApiUrl(courseId)}`)
      .reply(200, {
        ...advancedSettingsMock,
        advancedModules: {
          ...advancedSettingsMock.advancedModules,
          value: [3, 2, 1],
        },
      });
    fireEvent.click(getByText('Save changes'));
    await executeThunk(updateCourseAppSetting(courseId, [3, 2, 1]), store.dispatch);
    expect(getByText('Your policy changes have been saved.')).toBeInTheDocument();
  });
  it('should shows the PermissionDeniedAlert when there are not the right user permissions', async () => {
    const permissionsData = { permissions: ['view'] };
    await permissionsMockStore(permissionsData);

    const { queryByText } = render(<RootWrapper />);
    await waitFor(() => {
      const permissionDeniedAlert = queryByText('You are not authorized to view this page. If you feel you should have access, please reach out to your course team admin to be given access.');
      expect(permissionDeniedAlert).toBeInTheDocument();
    });
  });
  it('should not show the PermissionDeniedAlert when the User Permissions Flag is not enabled', async () => {
    await permissionDisabledMockStore();

    const { queryByText } = render(<RootWrapper />);
    const permissionDeniedAlert = queryByText('You are not authorized to view this page. If you feel you should have access, please reach out to your course team admin to be given access.');
    expect(permissionDeniedAlert).not.toBeInTheDocument();
  });
  it('should be view only if the permission is set for viewOnly', async () => {
    const permissions = { permissions: ['view_course_settings'] };
    await permissionsMockStore(permissions);
    const { getByLabelText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByLabelText('Advanced Module List')).toBeDisabled();
    });
  });
});
