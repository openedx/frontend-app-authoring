import userEvent from '@testing-library/user-event';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import {
  render as baseRender,
  fireEvent,
  initializeMocks,
  screen,
} from '@src/testUtils';
import { advancedSettingsMock } from './__mocks__';
import { getCourseAdvancedSettingsApiUrl } from './data/api';
import AdvancedSettings from './AdvancedSettings';
import messages from './messages';

let axiosMock;
const mockPathname = '/foo-bar';
const courseId = '123';

// Mock the TextareaAutosize component
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea
    {...props}
    onFocus={() => { }}
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
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(`${getCourseAdvancedSettingsApiUrl(courseId)}?fetch_all=0`)
      .reply(200, advancedSettingsMock);

    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    } as unknown as ReturnType<typeof useUserPermissions>);
  });

  it('should render without errors', async () => {
    render();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    })).toBeInTheDocument();
    expect(screen.getByText(messages.policy.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(/Do not modify these policies unless you are familiar with their purpose./i)).toBeInTheDocument();
  });

  it('should render setting element', async () => {
    render();
    expect(await screen.findByText(/Advanced Module List/i)).toBeInTheDocument();
    expect(screen.queryByText('Certificate web/html view enabled')).toBeNull();
  });

  it('should change to onСhange', async () => {
    render();
    const textarea = await screen.findByLabelText(/Advanced Module List/i);
    expect(textarea).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });
    expect(textarea).toHaveValue('[1, 2, 3]');
  });

  it('should display a warning alert', async () => {
    render();
    const textarea = await screen.findByLabelText(/Advanced Module List/i);
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(screen.getByText(messages.buttonCancelText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.buttonSaveText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertWarning.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertWarningDescriptions.defaultMessage)).toBeInTheDocument();
  });

  it('should display a tooltip on clicking on the icon', async () => {
    const user = userEvent.setup();
    render();
    const button = await screen.findByLabelText(/Show help text/i);
    await user.click(button);
    expect(screen.getByText(/Enter the names of the advanced modules to use in your course./i)).toBeInTheDocument();
  });

  it('should change deprecated button text', async () => {
    const user = userEvent.setup();
    render();
    const showDeprecatedItemsBtn = await screen.findByText(/Show Deprecated Settings/i);
    expect(showDeprecatedItemsBtn).toBeInTheDocument();
    await user.click(showDeprecatedItemsBtn);
    expect(screen.getByText(/Hide Deprecated Settings/i)).toBeInTheDocument();
    expect(screen.getByText('Certificate web/html view enabled')).toBeInTheDocument();
  });

  it('should reset to default value on click on Cancel button', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByLabelText(/Advanced Module List/i);
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(textarea).toHaveValue('[3, 2, 1]');
    await user.click(screen.getByText(messages.buttonCancelText.defaultMessage));
    expect(textarea).toHaveValue('[]');
  });

  it('should update the textarea value and display the updated value after clicking "Change manually"', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByLabelText(/Advanced Module List/i);
    fireEvent.change(textarea, { target: { value: '[3, 2, 1,' } });
    fireEvent.blur(textarea);
    expect(textarea).toHaveValue('[3, 2, 1,');
    await user.click(screen.getByText('Save changes'));
    await user.click(await screen.findByText('Change manually'));
    expect(textarea).toHaveValue('[3, 2, 1,');
  });

  it('should show success alert after save', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByLabelText(/Advanced Module List/i);
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(textarea).toHaveValue('[3, 2, 1]');
    axiosMock
      .onPatch(`${getCourseAdvancedSettingsApiUrl(courseId)}`)
      .reply(200, {
        ...advancedSettingsMock,
        advancedModules: {
          ...advancedSettingsMock.advancedModules,
          value: [3, 2, 1],
        },
      });
    await user.click(screen.getByText('Save changes'));
    expect(screen.getByText('Your policy changes have been saved.')).toBeInTheDocument();
  });

  it('should render without errors when authz.enable_course_authoring flag is enabled and the user is authorized', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    } as unknown as ReturnType<typeof useUserPermissions>);
    render();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    })).toBeInTheDocument();
    expect(screen.getByText(messages.policy.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(/Do not modify these policies unless you are familiar with their purpose./i)).toBeInTheDocument();
  });

  it('should show permission alert when authz.enable_course_authoring flag is enabled and the user is not authorized', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: false },
    } as unknown as ReturnType<typeof useUserPermissions>);
    render();
    expect(await screen.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
  });
});
