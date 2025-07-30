import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as reactRedux from 'react-redux';
import { SelectVideoModal, useVideoList, useOnSelectClick } from './SelectVideoModal';
import messages from './messages';

import { thunkActions } from '../../../data/redux';

// Mock fetchVideos thunk
jest.mock('../../../data/redux', () => ({
  thunkActions: {
    app: {
      fetchVideos: jest.fn(({ onSuccess }) => () => {
        onSuccess([
          { externalUrl: 'video1.mp4' },
          { externalUrl: 'video2.mp4' },
        ]);
      }),
    },
  },
}));

// Mock useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('SelectVideoModal', () => {
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);
  const mockSetSelection = jest.fn();
  const mockClose = jest.fn();
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
    const mockDispatch = jest.fn((thunkFn) => thunkFn(() => {}, () => ({})));
    reactRedux.useDispatch.mockReturnValue(mockDispatch);
  });

  it('renders the modal with the correct title', async () => {
    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <SelectVideoModal
            isOpen
            close={mockClose}
            setSelection={mockSetSelection}
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
          />
        </IntlProvider>
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockClose).toHaveBeenCalled();
  });

  it('renders a div for each video in the videos array', async () => {
    render(
      <Provider store={store}>
        <IntlProvider locale="en" messages={messages}>
          <SelectVideoModal
            isOpen
            close={jest.fn()}
            setSelection={jest.fn()}
          />
        </IntlProvider>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('video1.mp4')).toBeInTheDocument();
      expect(screen.getByText('video2.mp4')).toBeInTheDocument();
    });
  });
});

describe('SelectVideoModal hooks', () => {
  describe('useVideoList', () => {
    it('fetches videos and sets them in state', async () => {
      const mockDispatch = jest.fn((thunkFn) => thunkFn(() => {}, () => ({})));
      reactRedux.useDispatch.mockReturnValue(mockDispatch);

      // eslint-disable-next-line react/prop-types
      const TestComponent = () => {
        const videos = useVideoList();
        return (
          <div data-testid="videos">
            {videos ? videos.map((v) => v.externalUrl).join(', ') : 'Loading'}
          </div>
        );
      };

      const mockStore = configureStore([thunk]);
      render(
        <Provider store={mockStore({})}>
          <TestComponent />
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('videos').textContent).toBe('video1.mp4, video2.mp4');
      });

      expect(thunkActions.app.fetchVideos).toHaveBeenCalled();
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
