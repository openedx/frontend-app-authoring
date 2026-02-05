import { getConfig, setConfig } from '@edx/frontend-platform';
import { userEvent } from '@testing-library/user-event';

import {
  initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

import { OutlineSidebarProvider } from './OutlineSidebarContext';
import { OutlineSidebarPagesProvider } from './OutlineSidebarPagesContext';
import OutlineSidebar from './OutlineSidebar';

// Mock the useCourseDetails hook
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: jest.fn().mockReturnValue({ isPending: false, data: { title: 'Test Course' } }),
  useCreateCourseBlock: jest.fn(),
}));

const courseId = '123';

const extraWrapper = ({ children }) => (
  <CourseAuthoringProvider courseId={courseId}>
    <OutlineSidebarPagesProvider>
      <OutlineSidebarProvider>
        {children}
      </OutlineSidebarProvider>
    </OutlineSidebarPagesProvider>
  </CourseAuthoringProvider>
);

const renderComponent = () => render(
  <OutlineSidebar />,
  { extraWrapper },
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
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();

    // Hide the sidebar
    const toggleButton = within(sidebarToggle).getByRole('button', { name: 'Toggle' });
    expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    // Check that there are no more Info sidebar elements
    expect(screen.queryByText('Test Course')).not.toBeInTheDocument();

    // Show the sidebar
    await userEvent.click(toggleButton);

    // Check that the new sidebar is rendered, with the Info page
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    // Change page
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));

    // Check that the help page is rendered
    expect(screen.getByText('Creating your course organization')).toBeInTheDocument();
  });
});
