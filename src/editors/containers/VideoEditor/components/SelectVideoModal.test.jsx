import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SelectVideoModal, useVideoList, useOnSelectClick } from './SelectVideoModal';
import messages from './messages';

describe('SelectVideoModal', () => {
  const mockStore = configureStore([]);
  const mockFetchVideos = jest.fn();
  const mockSetSelection = jest.fn();
  const mockClose = jest.fn();
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it('renders the modal with the correct title', () => {
    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <SelectVideoModal
            isOpen
            close={mockClose}
            setSelection={mockSetSelection}
            fetchVideos={mockFetchVideos}
          />
        </IntlProvider>
      </Provider>,
    );

    expect(screen.getByText(messages.selectVideoModalTitle.defaultMessage)).toBeInTheDocument();
  });

  it('calls close when the modal is closed', () => {
    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <SelectVideoModal
            isOpen
            close={mockClose}
            setSelection={mockSetSelection}
            fetchVideos={mockFetchVideos}
          />
        </IntlProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockClose).toHaveBeenCalled();
  });

  it('renders a div for each video in the videos array', () => {
    const videos = [
      { externalUrl: 'video1.mp4' },
      { externalUrl: 'video2.mp4' },
    ];
    const fetchVideos = jest.fn(({ onSuccess }) => onSuccess(videos));

    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <SelectVideoModal
            isOpen
            close={jest.fn()}
            setSelection={jest.fn()}
            fetchVideos={fetchVideos}
          />
        </IntlProvider>
      </Provider>,
    );

    // Assert that a div is rendered for each video
    videos.forEach((video) => {
      expect(screen.getByText(video.externalUrl)).toBeInTheDocument();
    });
  });
});

describe('SelectVideoModal hooks', () => {
  describe('useVideoList', () => {
    it('fetches videos and sets them in state', async () => {
      // eslint-disable-next-line react/prop-types
      const TestComponent = ({ fetchVideos }) => {
        const videos = useVideoList({ fetchVideos });
        return (
          <div data-testid="videos">
            {videos ? videos.map((v) => v.externalUrl).join(', ') : 'Loading'}
          </div>
        );
      };

      const videos = [
        { externalUrl: 'video1.mp4' },
        { externalUrl: 'video2.mp4' },
      ];
      const fetchVideos = jest.fn(({ onSuccess }) => {
        onSuccess(videos);
      });

      render(<TestComponent fetchVideos={fetchVideos} />);

      await waitFor(() => expect(screen.getByTestId('videos').textContent).toBe(videos.map((v) => v.externalUrl).join(', ')));

      expect(fetchVideos).toHaveBeenCalled();
    });
  });

  describe('useOnSelectClick', () => {
    it('calls setSelection with the first video', () => {
      const mockSetSelection = jest.fn();
      const videos = [
        { externalUrl: 'video1.mp4' },
        { externalUrl: 'video2.mp4' },
      ];

      const onSelectClick = useOnSelectClick({
        setSelection: mockSetSelection,
        videos,
      });

      onSelectClick();
      expect(mockSetSelection).toHaveBeenCalledWith(videos[0]);
    });
  });
});
