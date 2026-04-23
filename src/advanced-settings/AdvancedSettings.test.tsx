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
import filterMessages from './settings-filters/messages';

// Mock CodeMirror-based JsonInput with a controlled textarea so tests can
// interact with JSON fields without a real browser layout engine.
jest.mock('./setting-card/inputs/JsonInput', () => jest.fn(({ initialValue, onChange, onBlur }) => (
  <textarea
    data-testid="json-input"
    value={initialValue}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
  />
)));

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

let axiosMock;
const mockPathname = '/foo-bar';
const courseId = '123';

const render = () =>
  baseRender(
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

  it('should render placeholder when settings fetch returns 403', async () => {
    axiosMock
      .onGet(`${getCourseAdvancedSettingsApiUrl(courseId)}?fetch_all=0`)
      .reply(403);
    render();
    expect(await screen.findByText(/Under Construction/i)).toBeInTheDocument();
  });

  it('should render without errors', async () => {
    render();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage, {
      selector: 'small.sub-header-title-subtitle',
    })).toBeInTheDocument();
    expect(screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    })).toBeInTheDocument();
    expect(screen.queryByText(messages.policy.defaultMessage)).toBeNull();
  });

  it('should render setting element', async () => {
    render();
    expect(await screen.findByText(/Advanced Module List/i)).toBeInTheDocument();
    expect(screen.queryByText('Certificate web/html view enabled')).toBeNull();
  });

  it('should change to onChange', async () => {
    render();
    const textarea = await screen.findByDisplayValue('[]');
    expect(textarea).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });
    expect(textarea).toHaveValue('[1, 2, 3]');
  });

  it('should display a warning alert', async () => {
    render();
    const textarea = await screen.findByDisplayValue('[]');
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(screen.getByText(messages.buttonCancelText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.buttonSaveText.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertWarning.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.alertWarningDescriptions.defaultMessage)).toBeInTheDocument();
  });

  it('should display a tooltip on clicking on the info icon', async () => {
    const user = userEvent.setup();
    render();
    const button = await screen.findByLabelText(/Show help text/i);
    await user.click(button);
    expect(screen.getByText(/Enter the names of the advanced modules to use in your course./i)).toBeInTheDocument();
  });

  it('should toggle deprecated settings visibility', async () => {
    const user = userEvent.setup();
    render();
    const showDeprecatedBtn = await screen.findByText(filterMessages.showDeprecated.defaultMessage);
    expect(showDeprecatedBtn).toBeInTheDocument();
    expect(screen.queryByText('Certificate web/html view enabled')).toBeNull();
    await user.click(showDeprecatedBtn);
    expect(screen.getByText(filterMessages.hideDeprecated.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('Certificate web/html view enabled')).toBeInTheDocument();
  });

  it('should reset to default value on click on Cancel button', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByDisplayValue('[]');
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    expect(textarea).toHaveValue('[3, 2, 1]');
    await user.click(screen.getByText(messages.buttonCancelText.defaultMessage));
    expect(textarea).toHaveValue('[]');
  });

  it('should preserve the field value after a failed save due to invalid JSON', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByDisplayValue('[]');
    fireEvent.change(textarea, { target: { value: '[3, 2, 1,' } });
    fireEvent.blur(textarea);
    expect(textarea).toHaveValue('[3, 2, 1,');
    await user.click(screen.getByText('Save changes'));
    expect(screen.queryByText(messages.buttonSaveText.defaultMessage)).toBeNull();
    expect(textarea).toHaveValue('[3, 2, 1,');
  });

  it('should show success alert after save', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByDisplayValue('[]');
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
    expect(await screen.findByText('Your policy changes have been saved.')).toBeInTheDocument();
  });

  it('should show error modal on save failure', async () => {
    const user = userEvent.setup();
    render();
    const textarea = await screen.findByDisplayValue('[]');
    fireEvent.change(textarea, { target: { value: '[3, 2, 1]' } });
    axiosMock
      .onPatch(`${getCourseAdvancedSettingsApiUrl(courseId)}`)
      .reply(500);
    await user.click(screen.getByText('Save changes'));
    expect(await screen.findByText('Validation error while saving')).toBeInTheDocument();
  });

  it('should render without errors when authz.enable_course_authoring flag is enabled and the user is authorized', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    } as unknown as ReturnType<typeof useUserPermissions>);
    render();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage, {
      selector: 'small.sub-header-title-subtitle',
    })).toBeInTheDocument();
    expect(screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    })).toBeInTheDocument();
    expect(screen.queryByText(messages.policy.defaultMessage)).toBeNull();
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
