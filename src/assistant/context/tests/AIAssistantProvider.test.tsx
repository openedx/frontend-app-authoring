import { useParams } from 'react-router-dom';

import { useAiAssistant } from '../hooks';
import { AiAssistantProvider } from '../AIAssistantProvider';
import { render, screen, initializeMocks } from '../../../testUtils';

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useParams: jest.fn(),
  };
});

jest.mock('../../data/apiHooks', () => ({
  useGenerateAiContent: () => ({
    mutate: jest.fn(),
    isLoading: false,
    data: undefined,
  }),
}));

const TestConsumer = () => {
  const { courseId } = useAiAssistant();
  return <div>Course ID: {courseId || 'No Course ID'}</div>;
};

const mockUseParams = useParams as jest.Mock;

describe('AiAssistantProvider', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  test('renders children without crashing', () => {
    mockUseParams.mockReturnValue({ courseId: 'course-v1:test' });

    render(
      <AiAssistantProvider>
        <div>Test Child</div>
      </AiAssistantProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('provides courseId from URL params to consumers', () => {
    mockUseParams.mockReturnValue({ courseId: 'course-v1:edX+DemoX+Demo_Course' });

    render(
      <AiAssistantProvider>
        <TestConsumer />
      </AiAssistantProvider>,
    );

    expect(screen.getByText('Course ID: course-v1:edX+DemoX+Demo_Course')).toBeInTheDocument();
  });

  test('handles missing params gracefully (no crash in unit tests)', () => {
    mockUseParams.mockReturnValue({});

    render(
      <AiAssistantProvider>
        <TestConsumer />
      </AiAssistantProvider>,
    );

    expect(screen.getByText('Course ID: No Course ID')).toBeInTheDocument();
  });
});
