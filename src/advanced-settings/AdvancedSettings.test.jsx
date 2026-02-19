import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import {
  render as baseRender,
  fireEvent,
  initializeMocks,
  waitFor,
} from '../testUtils';
import { executeThunk } from '../utils';
import { advancedSettingsMock } from './__mocks__';
import { getCourseAdvancedSettingsApiUrl } from './data/api';
import { updateCourseAppSetting } from './data/thunks';
import AdvancedSettings from './AdvancedSettings';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => { }}
    onBlur={() => { }}
  />
)));

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

const render = () => baseRender(
  <CourseAuthoringProvider courseId={courseId}>
    <AdvancedSettings />
  </CourseAuthoringProvider>,
  { path: mockPathname },
);

describe('<AdvancedSettings />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(`${getCourseAdvancedSettingsApiUrl(courseId)}?fetch_all=0`)
      .reply(200, advancedSettingsMock);

    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    });
  });
  it('should render without errors', async () => {
    const { getByText } = render();
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
    const { getByText, queryByText } = render();
    await waitFor(() => {
      const advancedModuleListTitle = getByText(/Advanced Module List/i);
      expect(advancedModuleListTitle).toBeInTheDocument();
      expect(queryByText('Certificate web/html view enabled')).toBeNull();
    });
  });
  it('should change to onСhange', async () => {
    const { getByLabelText } = render();
    await waitFor(() => {
      const textarea = getByLabelText(/Advanced Module List/i);
      expect(textarea).toBeInTheDocument();
      fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });
      expect(textarea.value).toBe('[1, 2, 3]');
    });
  });
  it('should display a warning alert', async () => {
    const { getByLabelText, getByText } = render();
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
    const { getByLabelText, getByText } = render();
    await waitFor(() => {
      const button = getByLabelText(/Show help text/i);
      fireEvent.click(button);
      expect(getByText(/Enter the names of the advanced modules to use in your course./i)).toBeInTheDocument();
    });
  });
  it('should change deprecated button text ', async () => {
    const { getByText } = render();
    await waitFor(() => {
      const showDeprecatedItemsBtn = getByText(/Show Deprecated Settings/i);
      expect(showDeprecatedItemsBtn).toBeInTheDocument();
      fireEvent.click(showDeprecatedItemsBtn);
      expect(getByText(/Hide Deprecated Settings/i)).toBeInTheDocument();
    });
    expect(getByText('Certificate web/html view enabled')).toBeInTheDocument();
  });
  it('should reset to default value on click on Cancel button', async () => {
    const { getByLabelText, getByText } = render();
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
    const { getByLabelText, getByText } = render();
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
    const { getByLabelText, getByText } = render();
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

  it('should render without errors when authz.enable_course_authoring flag is enabled and the user is authorized', async () => {
    // Mock feature flag
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    });
    const { getByText } = render();
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
  it('should show permission alert when authz.enable_course_authoring flag is enabled and the user is not authorized', async () => {
    // Mock feature flag
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: false },
    });
    const { getByTestId } = render();
    await waitFor(() => {
      const permissionAlert = getByTestId('permissionDeniedAlert');
      expect(permissionAlert).toBeInTheDocument();
    });
  });
});
