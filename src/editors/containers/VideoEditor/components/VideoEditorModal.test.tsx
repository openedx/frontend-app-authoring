import { render, waitFor, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import VideoEditorModal from './VideoEditorModal';
import { thunkActions } from '../../../data/redux';

jest.mock('../../../data/redux', () => ({
  ...jest.requireActual('../../../data/redux'),
  thunkActions: {
    video: {
      loadVideoData: jest
        .fn()
        .mockImplementation(() => ({ type: 'MOCK_ACTION' })),
    },
  },
}));

describe('VideoUploader', () => {
  let store;

  beforeEach(async () => {
    store = configureStore({
      reducer: (state, action) => (action && action.newState ? action.newState : state),
      preloadedState: {
        app: {
          videos: [],
          learningContextId: 'course-v1:test+test+test',
          blockId: 'some-block-id',
          courseDetails: {},
        },
        requests: {
          uploadAsset: { status: 'inactive' },
          uploadTranscript: { status: 'inactive' },
          deleteTranscript: { status: 'inactive' },
          fetchVideos: { status: 'inactive' },
        },
        video: {
          videoSource: '',
          videoId: '',
          fallbackVideos: ['', ''],
          allowVideoDownloads: false,
          allowVideoSharing: { level: 'block', value: false },
          thumbnail: null,
          transcripts: [],
          transcriptHandlerUrl: '',
          selectedVideoTranscriptUrls: {},
          allowTranscriptDownloads: false,
          duration: {
            startTime: '00:00:00',
            stopTime: '00:00:00',
            total: '00:00:00',
          },
        },
      },
    });
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'test-user',
        administrator: true,
        roles: [],
      },
    });
  });

  const renderComponent = async () => render(
    <AppProvider store={store} wrapWithRouter={false}>
      <IntlProvider locale="en">
        <MemoryRouter
          initialEntries={[
            '/some/path?selectedVideoId=id_1&selectedVideoUrl=https://video.com',
          ]}
        >
          <VideoEditorModal isLibrary={false} />
        </MemoryRouter>
      </IntlProvider>
    </AppProvider>,
  );

  it('should render the component and call loadVideoData with correct parameters', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledWith(
        'id_1',
        'https://video.com',
      );
    });
  });

  it('should call loadVideoData again when isLoaded state changes', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledTimes(2);
    });

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
      expect(thunkActions.video.loadVideoData).toHaveBeenCalledTimes(3);
    });
  });
});
