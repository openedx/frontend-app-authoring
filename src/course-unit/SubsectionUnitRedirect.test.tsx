import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  initializeMocks, waitFor, render, screen,
} from '../testUtils';
import SubsectionUnitRedirect from './SubsectionUnitRedirect';
import { getXBlockApiUrl } from '../course-outline/data/api';

let axiosMock;
const courseId = '123';
const subsectionId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@19a30717eff543078a5d94ae9d6c18a5';
const path = '/subsection/:subsectionId';

const expectedCourseItemDataWithUnit = {
  childInfo: {
    children: [
      {
        id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@1',
      },
    ],
  },
};

const expectedCourseItemDataWithoutUnit = [{
  childInfo: {
    children: [],
  },
}];

const renderSubsectionRedirectPage = () => {
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <SubsectionUnitRedirect />
    </CourseAuthoringProvider>,
    {
      path,
      routerProps: {
        initialEntries: [`/subsection/${subsectionId}`],
      },
    },
  );
};

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Navigate: ({ to }: { to: string }) => <div data-testid="mock-navigate" data-to={to}>Mocked Navigate</div>,
  };
});
describe('SubsectionUnitRedirect', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('navigates to first unit if available', async () => {
    axiosMock
      .onGet(getXBlockApiUrl(subsectionId))
      .reply(200, expectedCourseItemDataWithUnit);

    renderSubsectionRedirectPage();

    await waitFor(() => {
      // Confirm redirection by checking the final URL
      const mockNavigate = screen.getByTestId('mock-navigate');
      expect(mockNavigate).toBeInTheDocument();
      expect(mockNavigate).toHaveAttribute(
        'data-to',
        `/course/${courseId}/container/${encodeURIComponent(
          'block-v1:edX+DemoX+Demo_Course+type@vertical+block@1',
        )}`,
      );
    });
  });

  it('navigates to course page with show param if no units present', async () => {
    axiosMock
      .onGet(getXBlockApiUrl(subsectionId))
      .reply(200, expectedCourseItemDataWithoutUnit);

    renderSubsectionRedirectPage();

    await waitFor(() => {
      // Confirm redirection by checking the final URL
      const mockNavigate = screen.getByTestId('mock-navigate');
      expect(mockNavigate).toBeInTheDocument();
      expect(mockNavigate).toHaveAttribute('data-to', `/course/${courseId}?show=${encodeURIComponent(subsectionId)}`);
    });
  });
});
