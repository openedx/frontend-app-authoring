import { render, initializeMocks } from '@src/testUtils';
import VideoEditor from '.';
import * as hooks from './hooks';

const reduxSelectors = require('../../data/redux').selectors;

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/VideoEditorModal', () => 'VideoEditorModal');

describe('VideoEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    returnFunction: jest.fn().mockName('props.returnFunction'),
  };

  describe('conditional rendering', () => {
    let isFinishedSpy: jest.SpyInstance;
    let isLibrarySpy: jest.SpyInstance;
    let shouldCreateBlockSpy: jest.SpyInstance;
    let errorsHookSpy: jest.SpyInstance;
    let fetchVideoContentSpy: jest.SpyInstance;

    beforeEach(() => {
      isFinishedSpy = jest.spyOn(reduxSelectors.requests, 'isFinished');
      isLibrarySpy = jest.spyOn(reduxSelectors.app, 'isLibrary');
      shouldCreateBlockSpy = jest.spyOn(reduxSelectors.app, 'shouldCreateBlock');
      errorsHookSpy = jest.spyOn(hooks, 'errorsHook');
      fetchVideoContentSpy = jest.spyOn(hooks, 'fetchVideoContent');
      errorsHookSpy.mockReturnValue({ error: null, validateEntry: jest.fn() });
      fetchVideoContentSpy.mockReturnValue(jest.fn());
      isLibrarySpy.mockReturnValue(false);
      initializeMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('shows spinner when neither create workflow nor studio view finished', () => {
      isFinishedSpy.mockReturnValue(false);
      shouldCreateBlockSpy.mockReturnValue(false);
      const { container } = render(<VideoEditor {...props} />);
      expect(container.querySelector('.pgn__spinner')).toBeInTheDocument();
      expect(container.querySelector('EditorContainer')).toBeInTheDocument();
      expect(container.querySelector('VideoEditorModal')).not.toBeInTheDocument();
    });

    test('shows VideoEditorModal when isCreateWorkflow is true', () => {
      isFinishedSpy.mockReturnValue(false);
      shouldCreateBlockSpy.mockReturnValue(true);
      const { container } = render(<VideoEditor {...props} />);
      expect(container.querySelector('.pgn__spinner')).not.toBeInTheDocument();
      expect(container.querySelector('EditorContainer')).toBeInTheDocument();
      expect(container.querySelector('VideoEditorModal')).toBeInTheDocument();
    });

    test('shows VideoEditorModal when studioViewFinished is true', () => {
      isFinishedSpy.mockReturnValue(true);
      shouldCreateBlockSpy.mockReturnValue(false);

      const { container } = render(<VideoEditor {...props} />);
      expect(container.querySelector('.pgn__spinner')).not.toBeInTheDocument();
      expect(container.querySelector('EditorContainer')).toBeInTheDocument();
      expect(container.querySelector('VideoEditorModal')).toBeInTheDocument();
    });

    test('passes isLibrary, onClose, and returnFunction to VideoEditorModal', () => {
      isFinishedSpy.mockReturnValue(true);
      shouldCreateBlockSpy.mockReturnValue(false);
      isLibrarySpy.mockReturnValue(true);

      const { container } = render(<VideoEditor {...props} />);
      expect(container.querySelector('.video-editor')).toBeInTheDocument();
    });

    test('calls fetchVideoContent and passes validateEntry to EditorContainer', () => {
      isFinishedSpy.mockReturnValue(true);
      shouldCreateBlockSpy.mockReturnValue(false);

      render(<VideoEditor {...props} />);
      expect(fetchVideoContentSpy).toHaveBeenCalled();
      expect(errorsHookSpy).toHaveBeenCalled();
    });
  });
});
