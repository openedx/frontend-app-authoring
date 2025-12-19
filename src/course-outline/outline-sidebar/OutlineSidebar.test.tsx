import { getConfig, setConfig } from '@edx/frontend-platform';
import { userEvent } from '@testing-library/user-event';

import {
  initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';

import { OutlineSidebarProvider } from './OutlineSidebarContext';
import OutlineSidebar from './OutlineSidebar';

const courseId = 'course-v1:TestOrg+TestCourse+2023_1';

const renderComponent = () => render(
  <OutlineSidebar courseId={courseId} />,
  { extraWrapper: OutlineSidebarProvider },
);

describe('<OutlineSidebar>', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should render the help sidebar by default', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Creating your course organization')).toBeInTheDocument();
    });
  });

  it('should render the new sidebar if ENABLE_COURSE_OUTLINE_NEW_DESIGN is true', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_COURSE_OUTLINE_NEW_DESIGN: 'true',
    });
    renderComponent();

    // Check that the new sidebar is rendered, with the Info page
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();

    // Hide the sidebar
    const toggleButton = within(sidebarToggle).getByRole('button', { name: 'Toggle' });
    expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    // Check that there are no more Info sidebar elements
    expect(screen.queryByText('Course 1')).not.toBeInTheDocument();

    // Show the sidebar
    await userEvent.click(toggleButton);

    // Check that the new sidebar is rendered, with the Info page
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });

    // Change page
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));

    // Check that the help page is rendered
    expect(screen.getByText('Creating your course organization')).toBeInTheDocument();
  });
});
