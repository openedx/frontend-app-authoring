import {
  initializeMocks,
  render,
  screen,
  fireEvent,
} from '@src/testUtils';
import {
  AudioDescriptionWidgetInternal as AudioDescriptionWidget,
  mapDispatchToProps,
  mapStateToProps,
} from '.';
import * as hooks from './hooks';
import { selectors, thunkActions } from '../../../../../../data/redux';
import * as fileValidation from '../../../../../../sharedComponents/FileInput/fileValidation';

jest.mock('./hooks', () => ({
  useFileInput: jest.fn(),
  useDurationWarning: jest.fn(),
}));

jest.mock('../../../../../../sharedComponents/FileInput/fileValidation', () => ({
  useErrorToggle: jest.fn(),
  parseAssetName: jest.fn(),
}));

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    video: {
      audioDescriptionUrl: jest.fn(),
    },
    requests: {
      isFailed: jest.fn(),
      isPending: jest.fn(),
    },
  },
  thunkActions: {
    video: {
      deleteAudioDescription: jest.fn(),
    },
  },
}));

describe('AudioDescriptionWidget', () => {
  const mockedHooks = hooks as any;
  const mockedFileValidation = fileValidation as any;
  const mockedSelectors = selectors as any;
  const mockedThunkActions = thunkActions as any;
  const defaultProps = {
    audioDescriptionUrl: '',
    isUploadError: false,
    isUploadPending: false,
    deleteAudioDescription: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
    mockedFileValidation.useErrorToggle.mockReturnValue({ show: false, dismiss: jest.fn(), set: jest.fn() });
    mockedFileValidation.parseAssetName.mockReturnValue('audio-description.mp3');
    mockedHooks.useDurationWarning.mockReturnValue({
      durationWarning: {
        show: false,
        adDuration: 0,
        videoDuration: 0,
        dismiss: jest.fn(),
        onDurationChecked: jest.fn(),
      },
    });
    mockedHooks.useFileInput.mockReturnValue({ click: jest.fn(), addFile: jest.fn(), ref: { current: null } });
  });

  it('renders the empty state with the upload button', () => {
    render(<AudioDescriptionWidget {...defaultProps} />);

    expect(screen.getByText('Audio Description (AD)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Audio Description' })).toBeInTheDocument();
    expect(screen.getByText(/Add an audio description track/)).toBeInTheDocument();
  });

  it('renders the uploaded state and calls delete when the delete button is clicked', () => {
    render(<AudioDescriptionWidget {...defaultProps} audioDescriptionUrl="https://cdn.example.com/audio-description.mp3" />);

    expect(screen.getAllByText('audio-description.mp3').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(defaultProps.deleteAudioDescription).toHaveBeenCalled();
  });

  it('renders the upload spinner while the request is pending', () => {
    render(<AudioDescriptionWidget {...defaultProps} isUploadPending />);

    expect(screen.getAllByText('Uploading…').length).toBeGreaterThan(0);
  });

  it('renders the duration warning when the hook says it should be shown', () => {
    mockedHooks.useDurationWarning.mockReturnValue({
      durationWarning: {
        show: true,
        adDuration: 70,
        videoDuration: 60,
        dismiss: jest.fn(),
        onDurationChecked: jest.fn(),
      },
    });

    render(<AudioDescriptionWidget {...defaultProps} />);

    expect(screen.getByText(/duration differs from the video duration by more than 1 second/i)).toBeInTheDocument();
  });

  it('mapStateToProps reads audio description data from selectors', () => {
    const state = { some: 'state' };
    mockedSelectors.video.audioDescriptionUrl.mockReturnValue('https://cdn.example.com/audio-description.mp3');
    mockedSelectors.requests.isFailed.mockReturnValue(true);
    mockedSelectors.requests.isPending.mockReturnValue(false);

    expect(mapStateToProps(state)).toEqual({
      audioDescriptionUrl: 'https://cdn.example.com/audio-description.mp3',
      isUploadError: true,
      isUploadPending: false,
    });
  });

  it('mapDispatchToProps dispatches the delete thunk', () => {
    const dispatch = jest.fn();
    mockedThunkActions.video.deleteAudioDescription.mockReturnValue({ type: 'deleteAudioDescription' });

    mapDispatchToProps(dispatch).deleteAudioDescription();

    expect(dispatch).toHaveBeenCalledWith({ type: 'deleteAudioDescription' });
  });
});
