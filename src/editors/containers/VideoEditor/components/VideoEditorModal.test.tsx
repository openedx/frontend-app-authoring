import { thunkActions } from '@src/editors/data/redux';
import { initializeMocks, waitFor, act } from '@src/testUtils';
import { editorRender, getEditorStore, PartialEditorState } from '@src/editors/editorTestRender';
import VideoEditorModal from './VideoEditorModal';

thunkActions.video.loadVideoData = jest.fn().mockImplementation(() => ({ type: 'MOCK_ACTION' }));

const initialState: PartialEditorState = {
  app: {
    videos: {},
    learningContextId: 'course-v1:test+test+test',
    blockId: 'some-block-id',
    courseDetails: {},
  },
  requests: {
    uploadAsset: { status: 'inactive', response: {} as any },
    uploadTranscript: { status: 'inactive', response: {} as any },
    deleteTranscript: { status: 'inactive', response: {} as any },
    fetchVideos: { status: 'inactive', response: {} as any },
  },
  video: {
    videoSource: '',
    videoId: '',
    fallbackVideos: ['', ''],
    allowVideoDownloads: false,
    allowVideoSharing: { level: 'block', value: false },
    thumbnail: undefined,
    transcripts: [],
    selectedVideoTranscriptUrls: {},
    allowTranscriptDownloads: false,
    duration: {
      startTime: '00:00:00',
      stopTime: '00:00:00',
      total: '00:00:00',
    },
  },
};

describe('VideoUploader', () => {
  beforeEach(async () => {
    initializeMocks();
  });

  const renderComponent = () => editorRender(
    <VideoEditorModal isLibrary={false} />,
    {
      routerProps: {
        initialEntries: ['/some/path?selectedVideoId=id_1&selectedVideoUrl=https://video.com'],
      },
      initialState,
    },
  );

  it('should render the component and call loadVideoData with correct parameters', async () => {
    renderComponent();
    await waitFor(() => {
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledWith(
        'id_1',
        'https://video.com',
      );
    });
  });

  it('should call loadVideoData again when isLoaded state changes', async () => {
    renderComponent();
    await waitFor(() => {
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledTimes(1);
    });
    const store = getEditorStore();

    act(() => {
      store.dispatch({
        type: 'UPDATE_STATE',
        newState: {
          ...store.getState(),
          requests: {
            ...store.getState().requests,
            fetchVideos: { status: 'completed' }, // isLoaded = true
          },
        },
      });
    });

    await waitFor(() => {
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledTimes(2);
    });
  });
});
