import ReactDOM from 'react-dom';
import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from 'CourseAuthoring/testUtils';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

import XpertUnitSummarySettings from './Settings';
import * as API from './data/api';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock;
let container;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

function renderComponent() {
  const wrapper = render(
    <PagesAndResourcesProvider courseId={courseId}>
      <XpertUnitSummarySettings />
    </PagesAndResourcesProvider>,
  );
  container = wrapper.container;
}

function generateCourseLevelAPIResponse({
  success,
  enabled,
}) {
  return {
    response: {
      success,
      enabled,
    },
  };
}

describe('XpertUnitSummarySettings', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('with successful network connections', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: true,
          }),
        );

      renderComponent();
    });

    test('Shows switch on if enabled from backend', async () => {
      const enableBadge = await screen.findByTestId('enable-badge');
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).toBeTruthy();
      expect(enableBadge).toBeTruthy();
    });

    test('Shows enable radio selected if enabled from backend', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(screen.getByTestId('enable-radio').checked).toBeTruthy();
    });
  });

  describe('course configured with units disabled by default', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: false,
          }),
        );

      renderComponent();
    });

    // A course-level record existing with enabled: false still means the app itself is
    // configured for this course, so the top switch and badge remain on -- only the
    // "which units get summaries by default" radio reflects the false value.
    test('Shows switch on (app is configured) even though units are disabled by default', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).toBeTruthy();
      expect(screen.queryByTestId('enable-badge')).toBeTruthy();
    });

    test('Shows disable radio selected', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(screen.getByTestId('disable-radio').checked).toBeTruthy();
    });
  });

  describe('first time course configuration', () => {
    beforeEach(() => {
      // A course that has never been configured gets a 404 from ai_aside, not a 400.
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(404);

      renderComponent();
    });

    test('Does not show as enabled if configuration does not exist', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).not.toBeTruthy();
      expect(screen.queryByTestId('enable-badge')).not.toBeTruthy();
    });
  });

  describe('saving configuration changes', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: false,
          }),
        );

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: true,
          }),
        );

      renderComponent();
    });

    test('Saving configuration changes', async () => {
      const user = userEvent.setup();
      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(screen.getByTestId('disable-radio').checked).toBeTruthy();
      await user.click(screen.getByTestId('enable-radio'));
      await user.click(screen.getByText('Save'));
      await waitFor(() => expect(API.postXpertSettings).toBeCalled());
    });
  });

  describe('removing course configuration', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: true,
          }),
        );

      axiosMock.onDelete(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: undefined,
          }),
        );

      renderComponent();
    });

    test('Deleting course configuration', async () => {
      const user = userEvent.setup();
      jest.spyOn(API, 'deleteXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      await user.click(container.querySelector('#enable-xpert-unit-summary-toggle'));
      await user.click(screen.getByText('Save'));
      await waitFor(() => expect(API.deleteXpertSettings).toBeCalled());
    });
  });

  describe('resetting course units', () => {
    test('reset all units to be enabled', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: true,
          }),
        );

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: true,
          }),
        );

      renderComponent();

      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      await user.click(screen.getByTestId('reset-units'));
      await waitFor(() => (
        expect(API.postXpertSettings).toBeCalledWith(courseId, { reset: true, enabled: true })
      ));
    });

    test('reset all units to be disabled', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: false,
          }),
        );

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(
          200,
          generateCourseLevelAPIResponse({
            success: true,
            enabled: false,
          }),
        );

      renderComponent();

      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      await user.click(screen.getByTestId('reset-units'));
      await waitFor(() => (
        expect(API.postXpertSettings).toBeCalledWith(courseId, { reset: true, enabled: false })
      ));
    });
  });
});
