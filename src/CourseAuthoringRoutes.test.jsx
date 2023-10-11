import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import initializeStore from './store';

const courseId = 'course-v1:edX+TestX+Test_Course';
const pagesAndResourcesMockText = 'Pages And Resources';
const proctoredExamSeetingsMockText = 'Proctored Exam Settings';
const editorContainerMockText = 'Editor Container';
const videoSelectorContainerMockText = 'Video Selector Container';
const customPagesMockText = 'Custom Pages';
let store;
const mockComponentFn = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    courseId,
  }),
}));

// Mock the TinyMceWidget from frontend-lib-content-components
jest.mock('@edx/frontend-lib-content-components', () => ({
  TinyMceWidget: () => <div>Widget</div>,
  Footer: () => <div>Footer</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('./pages-and-resources/PagesAndResources', () => (props) => {
  mockComponentFn(props);
  return pagesAndResourcesMockText;
});
jest.mock('./proctored-exam-settings/ProctoredExamSettings', () => (props) => {
  mockComponentFn(props);
  return proctoredExamSeetingsMockText;
});
jest.mock('./editors/EditorContainer', () => (props) => {
  mockComponentFn(props);
  return editorContainerMockText;
});
jest.mock('./selectors/VideoSelectorContainer', () => (props) => {
  mockComponentFn(props);
  return videoSelectorContainerMockText;
});
jest.mock('./custom-pages/CustomPages', () => (props) => {
  mockComponentFn(props);
  return customPagesMockText;
});

describe('<CourseAuthoringRoutes>', () => {
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
  });

  fit('renders the PagesAndResources component when the pages and resources route is active', () => {
    render(
      <AppProvider store={store} wrapWithRouter={false}>
        <MemoryRouter initialEntries={['/pages-and-resources']}>
          <CourseAuthoringRoutes />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText(pagesAndResourcesMockText)).toBeVisible();
    expect(screen.queryByText(proctoredExamSeetingsMockText)).not.toBeInTheDocument();
    expect(mockComponentFn).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId,
      }),
    );
  });

  it('renders the ProctoredExamSettings component when the proctored exam settings route is active', () => {
    render(
      <AppProvider store={store} wrapWithRouter={false}>
        <MemoryRouter initialEntries={['/proctored-exam-settings']}>
          <CourseAuthoringRoutes />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.queryByText(proctoredExamSeetingsMockText)).toBeInTheDocument();
    expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
    expect(mockComponentFn).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId,
      }),
    );
  });

  it('renders the EditorContainer component when the course editor route is active', () => {
    render(
      <AppProvider store={store} wrapWithRouter={false}>
        <MemoryRouter initialEntries={['/editor/video/block-id']}>
          <CourseAuthoringRoutes />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.queryByText(editorContainerMockText)).toBeInTheDocument();
    expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
    expect(mockComponentFn).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId,
      }),
    );
  });

  it('renders the VideoSelectorContainer component when the course videos route is active', () => {
    render(
      <AppProvider store={store} wrapWithRouter={false}>
        <MemoryRouter initialEntries={['/editor/course-videos/block-id']}>
          <CourseAuthoringRoutes />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.queryByText(videoSelectorContainerMockText)).toBeInTheDocument();
    expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
    expect(mockComponentFn).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId,
      }),
    );
  });
});
