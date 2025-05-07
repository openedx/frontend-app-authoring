import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { SelectVideoModal, hooks } from './SelectVideoModal';
import messages from './messages';

const mockStore = configureStore([]);
const mockFetchVideos = jest.fn();
const mockSetSelection = jest.fn();
const mockClose = jest.fn();

jest.mock('./SelectVideoModal', () => ({
  ...jest.requireActual('./SelectVideoModal'),
  hooks: {
    videoList: jest.fn(),
    onSelectClick: jest.fn(),
  },
}));

describe('SelectVideoModal', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it('renders the modal with the correct title', () => {
    hooks.videoList.mockReturnValue([{ externalUrl: 'video1.mp4' }]);

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
    hooks.videoList.mockReturnValue([]);

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
});
