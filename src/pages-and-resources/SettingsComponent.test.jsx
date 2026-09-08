import { useParams, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from 'CourseAuthoring/CourseAuthoringContext';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { getCourseAppsApiUrl, getCourseDetailsUrl } from 'CourseAuthoring/data/api';
import { initializeMocks, render, screen, waitFor } from 'CourseAuthoring/testUtils';
import SettingsComponent from './SettingsComponent';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('CourseAuthoring/utils', () => ({
  ...jest.requireActual('CourseAuthoring/utils'),
  // Real useAppSetting() returns a single value (not a [value, setter] tuple).
  useAppSetting: () => false,
  useIsMobile: () => false,
}));

const courseId = 'course-v1:foo+bar+baz';

const RequiredProviders = ({ children }) => (
  <CourseAuthoringProvider courseId={courseId}>
    <PagesAndResourcesProvider courseId={courseId}>
      {children}
    </PagesAndResourcesProvider>
  </CourseAuthoringProvider>
);

describe('SettingsComponent', () => {
  beforeEach(() => {
    const { axiosMock } = initializeMocks();

    axiosMock.onGet(getCourseDetailsUrl(courseId, 'abc123')).reply(200, {
      courseId,
      name: 'Course Test',
      start: Date(),
    });

    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'wiki',
        name: 'Wiki',
        description: 'Wiki description',
        enabled: false,
        documentation_links: {},
        allowed_operations: {
          enable: true,
          configure: true,
        },
      },
    ]);
  });

  test('renders LazyLoadedComponent when provided with props', async () => {
    useParams.mockImplementation(() => ({ appId: 'wiki' }));

    render(
      <SettingsComponent url="/some-url" />,
      { extraWrapper: RequiredProviders },
    );

    await screen.findByText('Configure wiki');

    const modalComponent = screen.getByRole('dialog');
    expect(modalComponent.querySelector('#enable-wiki-toggleHelpText')).toContainHTML('The course wiki can be set up');
  });

  test('navigates to provided url when closing', async () => {
    useParams.mockImplementation(() => ({ appId: 'wiki' }));

    const LocationDisplay = () => {
      const location = useLocation();

      return <div data-testid="location-display">{location.pathname}</div>;
    };
    const user = userEvent.setup();
    render(
      <>
        <SettingsComponent url="/some-url" />
        <LocationDisplay />
      </>,
      { extraWrapper: RequiredProviders },
    );

    await screen.findByText('Configure wiki');
    const firstLocation = await screen.findByTestId('location-display');
    expect(firstLocation).toHaveTextContent('/');

    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);
    const secondLocation = await screen.findByTestId('location-display');
    expect(secondLocation).toHaveTextContent('/some-url');
  });

  test('renders error message when plugin is unavilable when provided with props', async () => {
    // Silence noisy error about the plugin failing to load, when we do that deliberately.
    jest.spyOn(console, 'trace').mockImplementation(() => {});
    // Specify an invalid course app, with no matching plugin:
    useParams.mockImplementation(() => ({ appId: 'invalid-plugin' }));

    const rendered = render(
      <SettingsComponent url="/some-url" />,
      { extraWrapper: RequiredProviders },
    );

    const errorMessage = 'An error occurred when loading the configuration UI';
    await waitFor(() => expect(rendered.container).toHaveTextContent(errorMessage));
  });
});
