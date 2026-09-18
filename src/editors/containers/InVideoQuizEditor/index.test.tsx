import React from 'react';
import { screen, fireEvent, initializeMocks } from '@src/testUtils';
import { editorRender } from '@src/editors/editorTestRender';
import { thunkActions } from '@src/editors/data/redux';
import ConnectedInVideoQuizEditor, { hooks } from './index';

// Mock thunks that make API calls. Must use jest.mock (hoisted) rather than
// jest.spyOn because mapDispatchToProps captures function references at module
// load time, before jest.spyOn would run.
jest.mock('../../data/redux/thunkActions/inVideoQuiz', () => {
  const load = jest.fn(() => () => Promise.resolve());
  const save = jest.fn(() => () => Promise.resolve());
  return {
    __esModule: true,
    default: { loadInVideoQuizSettings: load, saveInVideoQuizSettings: save },
    loadInVideoQuizSettings: load,
    saveInVideoQuizSettings: save,
  };
});

jest.mock('../EditorContainer', () => ({
  __esModule: true,
  default: ({ children, onSave }: { children: React.ReactNode; onSave?: () => void; }) => (
    <div data-testid="editor-container">
      <button
        type="button"
        data-testid="save-button"
        onClick={() => onSave && onSave()}
      >
        Save
      </button>
      {children}
    </div>
  ),
}));

jest.mock('../../sharedComponents/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    className,
  }: { children: React.ReactNode; onClick?: () => void; className?: string; }) => (
    <button
      type="button"
      data-testid="custom-button"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../hooks', () => ({
  navigateCallback: jest.fn(() => jest.fn()),
}));

jest.mock('../../data/constants/analyticsEvt', () => ({
  editorSaveClick: 'editor_save_click',
}));

const baseState = {
  app: {
    blockId: 'test-block-id',
    blockValue: {
      data: {
        id: 'test-block-id',
        display_name: 'Test',
        data: '',
        metadata: {},
      },
    },
  },
  requests: {
    fetchBlock: { status: 'completed' as const },
  },
  inVideoQuiz: {
    selectedVideo: null,
    videos: [],
    problems: [],
    unitContentLoaded: false,
    quizItems: [
      {
        id: 'quiz-1',
        problemId: '',
        time: '',
        jumpBack: '',
      },
    ],
    isDirty: false,
  },
};

describe('InVideoQuizEditor', () => {
  beforeEach(() => {
    initializeMocks();
  });

  describe('Content not found alerts', () => {
    it('shows both alerts when no videos and no problems exist in the unit', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
            },
          },
        },
      );

      expect(screen.getByText('Content not found')).toBeInTheDocument();
      expect(screen.getByText('No video found for this unit')).toBeInTheDocument();
      expect(screen.getByText('No problem found for this unit')).toBeInTheDocument();
    });

    it('shows only video alert when no videos exist but problems do', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
            },
          },
        },
      );

      expect(screen.getByText('Content not found')).toBeInTheDocument();
      expect(screen.getByText('No video found for this unit')).toBeInTheDocument();
      expect(screen.queryByText('No problem found for this unit')).not.toBeInTheDocument();
    });

    it('shows only problem alert when no problems exist but videos do', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [{ id: 'video-1', display_name: 'Video 1' }],
            },
          },
        },
      );

      expect(screen.getByText('Content not found')).toBeInTheDocument();
      expect(screen.queryByText('No video found for this unit')).not.toBeInTheDocument();
      expect(screen.getByText('No problem found for this unit')).toBeInTheDocument();
    });

    it('does not show alert when both videos and problems exist', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [{ id: 'video-1', display_name: 'Video 1' }],
              problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
            },
          },
        },
      );

      expect(screen.queryByText('Content not found')).not.toBeInTheDocument();
      expect(screen.queryByText('No video found for this unit')).not.toBeInTheDocument();
      expect(screen.queryByText('No problem found for this unit')).not.toBeInTheDocument();
    });

    it('does not show alert while still loading', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: baseState },
      );

      expect(screen.queryByText('Content not found')).not.toBeInTheDocument();
      expect(screen.queryByText('No video found for this unit')).not.toBeInTheDocument();
      expect(screen.queryByText('No problem found for this unit')).not.toBeInTheDocument();
    });

    it('dismisses the alert when close button is clicked', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
            },
          },
        },
      );

      expect(screen.getByText('Content not found')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(closeButton);

      expect(screen.queryByText('Content not found')).not.toBeInTheDocument();
      expect(screen.queryByText('No video found for this unit')).not.toBeInTheDocument();
      expect(screen.queryByText('No problem found for this unit')).not.toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders loading spinner when block not finished', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            requests: {
              fetchBlock: { status: 'pending' as const },
            },
          },
        },
      );

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
    });

    it('renders loading spinner while unit content is loading', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: baseState },
      );

      expect(screen.getByTestId('editor-container')).toBeInTheDocument();
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
      expect(screen.queryByText('Content not found')).not.toBeInTheDocument();
    });

    it('renders editor form when block is finished', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [{ id: 'video-1', display_name: 'Video 1' }],
              problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
            },
          },
        },
      );

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('Problem')).toBeInTheDocument();
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('renders video options in the dropdown', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [
                { id: 'video-1', display_name: 'Intro Video' },
                { id: 'video-2', display_name: 'Lecture Video' },
              ],
              problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
            },
          },
        },
      );

      expect(screen.getByText('Intro Video')).toBeInTheDocument();
      expect(screen.getByText('Lecture Video')).toBeInTheDocument();
    });

    it('shows a formatted duration next to videos that have one', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [{ id: 'video-1', display_name: 'Intro Video', duration: 90 }],
              problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
            },
          },
        },
      );

      expect(screen.getByText('Intro Video 01:30')).toBeInTheDocument();
    });

    it('renders problem options in the dropdown', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              videos: [{ id: 'video-1', display_name: 'Video 1' }],
              problems: [
                { id: 'problem-1', display_name: 'Quiz Question 1' },
                { id: 'problem-2', display_name: 'Quiz Question 2' },
              ],
            },
          },
        },
      );

      expect(screen.getByText('Quiz Question 1')).toBeInTheDocument();
      expect(screen.getByText('Quiz Question 2')).toBeInTheDocument();
    });

    it('adds a quiz item when Add problem button is clicked', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
            },
          },
        },
      );

      const initialRows = container.querySelectorAll('.quiz-item-row').length;
      fireEvent.click(screen.getByText('Add problem'));
      const updatedRows = container.querySelectorAll('.quiz-item-row').length;
      expect(updatedRows).toBe(initialRows + 1);
    });

    it('removes a quiz item when delete button is clicked', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
            },
          },
        },
      );

      expect(container.querySelectorAll('.quiz-item-row').length).toBe(1);
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete problem' });
      fireEvent.click(deleteButtons[0]);
      expect(container.querySelectorAll('.quiz-item-row').length).toBe(0);
    });

    it('calls loadInVideoQuizSettings on mount when block is finished', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: baseState },
      );

      expect(thunkActions.inVideoQuiz.loadInVideoQuizSettings).toHaveBeenCalled();
    });

    it('allows saving when multiple problems share the same timestamp', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...baseState,
            inVideoQuiz: {
              ...baseState.inVideoQuiz,
              unitContentLoaded: true,
              selectedVideo: 'video-1',
              videos: [{ id: 'video-1', display_name: 'Video 1' }],
              problems: [
                { id: 'problem-1', display_name: 'Problem 1' },
                { id: 'problem-2', display_name: 'Problem 2' },
              ],
              quizItems: [
                {
                  id: 'quiz-1',
                  problemId: 'problem-1',
                  time: '1:30',
                  jumpBack: '',
                },
                {
                  id: 'quiz-2',
                  problemId: 'problem-2',
                  time: '1:30',
                  jumpBack: '',
                },
              ],
            },
          },
        },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.queryByText('Each problem must have a unique timestamp. Please remove duplicate times.')).not
        .toBeInTheDocument();
      expect(thunkActions.inVideoQuiz.saveInVideoQuizSettings).toHaveBeenCalled();
    });
  });

  describe('User interactions', () => {
    const stateWithOneRow = {
      ...baseState,
      inVideoQuiz: {
        ...baseState.inVideoQuiz,
        unitContentLoaded: true,
        videos: [
          { id: 'video-1', display_name: 'Video 1' },
          { id: 'video-2', display_name: 'Video 2' },
        ],
        problems: [
          { id: 'problem-1', display_name: 'Problem 1' },
          { id: 'problem-2', display_name: 'Problem 2' },
        ],
      },
    };

    it('updates the selected video when a video is chosen', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithOneRow },
      );

      const videoSelect = screen.getByDisplayValue('Select video');
      fireEvent.change(videoSelect, { target: { value: 'video-2' } });

      expect(screen.getByDisplayValue('Video 2')).toBeInTheDocument();
    });

    it('updates the problem for a quiz item when a problem is chosen', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithOneRow },
      );

      const problemSelect = screen.getByDisplayValue('Select problem');
      fireEvent.change(problemSelect, { target: { value: 'problem-2' } });

      expect(screen.getByDisplayValue('Problem 2')).toBeInTheDocument();
    });

    it('formats the time input as digits are typed', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithOneRow },
      );

      const timeInput = container.querySelector('.time-input input') as HTMLInputElement;

      fireEvent.change(timeInput, { target: { value: '1' } });
      expect(timeInput.value).toBe('1');

      fireEvent.change(timeInput, { target: { value: '12' } });
      expect(timeInput.value).toBe('12');

      fireEvent.change(timeInput, { target: { value: '130' } });
      expect(timeInput.value).toBe('1:30');

      fireEvent.change(timeInput, { target: { value: '1075' } });
      expect(timeInput.value).toBe('10:59');

      fireEvent.change(timeInput, { target: { value: '' } });
      expect(timeInput.value).toBe('');
    });

    it('formats the jump back input as digits are typed', () => {
      const { container } = editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithOneRow },
      );

      const jumpBackInput = container.querySelector('.jump-back-input input') as HTMLInputElement;
      fireEvent.change(jumpBackInput, { target: { value: '145' } });
      expect(jumpBackInput.value).toBe('1:45');
    });
  });

  describe('Save behavior', () => {
    afterEach(() => {
      (thunkActions.inVideoQuiz.saveInVideoQuizSettings as jest.Mock).mockImplementation(() => () => Promise.resolve());
    });

    const stateWithValidRow = {
      ...baseState,
      inVideoQuiz: {
        ...baseState.inVideoQuiz,
        unitContentLoaded: true,
        selectedVideo: 'video-1',
        videos: [{ id: 'video-1', display_name: 'Video 1' }],
        problems: [{ id: 'problem-1', display_name: 'Problem 1' }],
        quizItems: [
          {
            id: 'quiz-1',
            problemId: 'problem-1',
            time: '1:30',
            jumpBack: '',
          },
        ],
      },
    };

    it('shows a time format error and does not save when jump back time is invalid', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...stateWithValidRow,
            inVideoQuiz: {
              ...stateWithValidRow.inVideoQuiz,
              quizItems: [
                {
                  id: 'quiz-1',
                  problemId: 'problem-1',
                  time: '1:30',
                  jumpBack: 'not-a-time',
                },
              ],
            },
          },
        },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.getByText('Error saving in-video quiz')).toBeInTheDocument();
      expect(thunkActions.inVideoQuiz.saveInVideoQuizSettings).not.toHaveBeenCalled();
    });

    it('shows a timer required error when a problem is selected but no time is set', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...stateWithValidRow,
            inVideoQuiz: {
              ...stateWithValidRow.inVideoQuiz,
              quizItems: [
                { id: 'quiz-1', problemId: 'problem-1', time: '', jumpBack: '' },
              ],
            },
          },
        },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.getByText('Error saving in-video quiz')).toBeInTheDocument();
      expect(thunkActions.inVideoQuiz.saveInVideoQuizSettings).not.toHaveBeenCalled();
    });

    it('shows a problem required error when a time is set but no problem is selected', () => {
      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        {
          initialState: {
            ...stateWithValidRow,
            inVideoQuiz: {
              ...stateWithValidRow.inVideoQuiz,
              quizItems: [
                { id: 'quiz-1', problemId: '', time: '1:30', jumpBack: '' },
              ],
            },
          },
        },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.getByText('Error saving in-video quiz')).toBeInTheDocument();
      expect(thunkActions.inVideoQuiz.saveInVideoQuizSettings).not.toHaveBeenCalled();
    });

    it('shows an error message returned by the API when saving fails', () => {
      (thunkActions.inVideoQuiz.saveInVideoQuizSettings as jest.Mock).mockImplementation(
        ({ onFailure }: { onFailure: (error: unknown) => void; }) => () => {
          onFailure({ response: { data: { error: 'Server exploded' } } });
        },
      );

      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithValidRow },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.getByText('Server exploded')).toBeInTheDocument();
    });

    it('falls back to a generic error message when the API error has no message', () => {
      (thunkActions.inVideoQuiz.saveInVideoQuizSettings as jest.Mock).mockImplementation(
        ({ onFailure }: { onFailure: (error: unknown) => void; }) => () => {
          onFailure({});
        },
      );

      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithValidRow },
      );

      fireEvent.click(screen.getByTestId('save-button'));

      expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
    });

    it('calls onSuccess and clears any previous save error when saving succeeds', () => {
      (thunkActions.inVideoQuiz.saveInVideoQuizSettings as jest.Mock)
        .mockImplementationOnce(
          ({ onFailure }: { onFailure: (error: unknown) => void; }) => () => onFailure({}),
        )
        .mockImplementationOnce(
          ({ onSuccess }: { onSuccess: (response: unknown) => void; }) => () => onSuccess({ data: 'ok' }),
        );

      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithValidRow },
      );

      fireEvent.click(screen.getByTestId('save-button'));
      expect(screen.getByText('Failed to save settings')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('save-button'));
      expect(screen.queryByText('Failed to save settings')).not.toBeInTheDocument();
    });

    it('dismisses the save error alert when its close button is clicked', () => {
      (thunkActions.inVideoQuiz.saveInVideoQuizSettings as jest.Mock).mockImplementation(
        ({ onFailure }: { onFailure: (error: unknown) => void; }) => () => onFailure({}),
      );

      editorRender(
        <ConnectedInVideoQuizEditor onClose={jest.fn()} />,
        { initialState: stateWithValidRow },
      );

      fireEvent.click(screen.getByTestId('save-button'));
      expect(screen.getByText('Error saving in-video quiz')).toBeInTheDocument();

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Error saving in-video quiz')).not.toBeInTheDocument();
    });
  });

  describe('hooks.getContent', () => {
    it('filters out quiz items without problemId', () => {
      const result = hooks.getContent({
        selectedVideo: 'video-1',
        quizItems: [
          { id: '1', problemId: 'p1', time: '1:00', jumpBack: '' },
          { id: '2', problemId: '', time: '', jumpBack: '' },
          { id: '3', problemId: 'p3', time: '3:00', jumpBack: '' },
        ],
      });

      expect(result.selectedVideo).toBe('video-1');
      expect(result.quizItems).toHaveLength(2);
      expect(result.quizItems[0].problemId).toBe('p1');
      expect(result.quizItems[1].problemId).toBe('p3');
    });

    it('returns empty quizItems when none have problemId', () => {
      const result = hooks.getContent({
        selectedVideo: null,
        quizItems: [
          { id: '1', problemId: '', time: '', jumpBack: '' },
        ],
      });

      expect(result.quizItems).toHaveLength(0);
    });
  });
});
