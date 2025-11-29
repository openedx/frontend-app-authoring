import useAIAssistantChat from '../hooks';
import { act, renderHook } from '../../../testUtils';
import { useAiAssistant } from '../../context/hooks';

jest.mock('../../context/hooks', () => ({
  __esModule: true,
  useAiAssistant: jest.fn(),
}));

const mockUseAiAssistant = useAiAssistant as jest.Mock;

describe('useAIAssistantChat', () => {
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAiAssistant.mockReturnValue({
      generateContent: mockGenerateContent,
      isAiLoading: false,
      aiData: undefined,
      courseId: 'course-v1:test',
    });
  });

  test('should initialize with empty messages', () => {
    const { result } = renderHook(() => useAIAssistantChat({ xblockType: 'html' }));
    expect(result.current.messages).toEqual([]);
    expect(result.current.isReady).toBe(true);
  });

  test('should add user message and call generateContent on handleSend', () => {
    const { result } = renderHook(() => useAIAssistantChat({ xblockType: 'html' }));

    act(() => {
      result.current.handleSend('Test prompt');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Test prompt');
    expect(result.current.messages[0].type).toBe('user');

    expect(mockGenerateContent).toHaveBeenCalledWith({
      course_id: 'course-v1:test',
      xblock_type: 'html',
      prompt: 'Test prompt',
    });
  });

  test('should not send message if courseId is missing', () => {
    mockUseAiAssistant.mockReturnValue({
      generateContent: mockGenerateContent,
      isAiLoading: false,
      aiData: undefined,
      courseId: undefined,
    });

    const { result } = renderHook(() => useAIAssistantChat({ xblockType: 'html' }));

    act(() => {
      result.current.handleSend('Test prompt');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(result.current.isReady).toBe(false);
  });

  test('should add AI success message when loading finishes with data', () => {
    const { result, rerender } = renderHook(() => useAIAssistantChat({ xblockType: 'html' }));

    act(() => {
      result.current.handleSend('Hello');
    });

    mockUseAiAssistant.mockReturnValue({
      generateContent: mockGenerateContent,
      isAiLoading: false,
      aiData: { content: 'Generated HTML' },
      courseId: 'course-v1:test',
    });

    rerender();

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].type).toBe('ai');
    expect(result.current.messages[1].variant).toBe('success');
  });
});
