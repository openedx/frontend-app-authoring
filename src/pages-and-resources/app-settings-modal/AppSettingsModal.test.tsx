import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseAppsApiUrl } from '@src/data/api';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';

import PagesAndResourcesProvider from '@src/pages-and-resources/PagesAndResourcesProvider';
import AppSettingsModal, { AppSettingsModalProps } from './AppSettingsModal';
import messages from './messages';

const courseId = 'course-v1:edX+TestX+Test_Course';
const courseAppsUrl = `${getCourseAppsApiUrl()}/${courseId}`;

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
const onClose = jest.fn();
// jsdom doesn't implement scrollIntoView; the modal scrolls to the error alert when saving fails.
const scrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

const renderModal = (props: Partial<AppSettingsModalProps> = {}) =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <PagesAndResourcesProvider courseId={courseId}>
        <AppSettingsModal
          appId="wiki"
          title="Configure wiki"
          enableAppLabel="Wiki"
          enableAppHelp="Enable the wiki"
          initialValues={{}}
          validationSchema={{}}
          onClose={onClose}
          {...props}
        />
      </PagesAndResourcesProvider>
    </CourseAuthoringProvider>,
  );

const toggleAndSave = async () => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('checkbox', { name: /Wiki/ }));
  await user.click(screen.getByRole('button', { name: messages.save.defaultMessage }));
};

describe('<AppSettingsModal />', () => {
  beforeEach(() => {
    onClose.mockClear();
    scrollIntoView.mockClear();
    ({ axiosMock } = initializeMocks());
    axiosMock.onGet(courseAppsUrl).reply(200, [
      { id: 'wiki', name: 'Wiki', enabled: false },
    ]);
  });

  it('updates the app status and closes when saved', async () => {
    axiosMock.onPatch(courseAppsUrl).reply(200);
    renderModal();

    await toggleAndSave();

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(axiosMock.history.patch).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ id: 'wiki', enabled: true });
  });

  it('shows an error and stays open when updating the app status fails', async () => {
    axiosMock.onPatch(courseAppsUrl).reply(500);
    renderModal();

    await toggleAndSave();

    expect(await screen.findByText(messages.errorSavingTitle.defaultMessage)).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows an error and stays open when onSettingsSave fails', async () => {
    const onSettingsSave = jest.fn().mockResolvedValue(false);
    renderModal({ onSettingsSave });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: messages.save.defaultMessage }));

    expect(await screen.findByText(messages.errorSavingTitle.defaultMessage)).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(onSettingsSave).toHaveBeenCalled();
    expect(axiosMock.history.patch).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows an error when saving settings for an app that is not installed', async () => {
    renderModal({ appId: 'unknown_app' });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: messages.save.defaultMessage }));

    expect(await screen.findByText(messages.errorSavingTitle.defaultMessage)).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalled();
    expect(axiosMock.history.patch).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});
