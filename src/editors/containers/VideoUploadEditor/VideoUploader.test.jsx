import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { configureStore } from '@reduxjs/toolkit';
import { AppProvider } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom';
import * as redux from 'react-redux';
import * as hooks from './hooks';
import { VideoUploader } from './VideoUploader';

jest.unmock('react-redux');
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

describe('VideoUploader', () => {
  const setLoadingMock = jest.fn();
  const onURLUploadMock = jest.fn();
  let store;

  beforeEach(async () => {
    store = configureStore({
      reducer: (state, action) => ((action && action.newState) ? action.newState : state),
      preloadedState: {
        app: {
          learningContextId: 'course-v1:test+test+test',
          blockId: 'some-block-id',
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

  const renderComponent = async (storeParam, setLoadingMockParam) => render(
    <AppProvider store={storeParam}>
      <IntlProvider locale="en">
        <VideoUploader setLoading={setLoadingMockParam} />
      </IntlProvider>,
    </AppProvider>,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected with default behavior', async () => {
    expect(await renderComponent(store, setLoadingMock)).toMatchSnapshot();
  });

  it('calls onURLUpload when URL submit button is clicked', async () => {
    const onVideoUploadSpy = jest.spyOn(hooks, 'onVideoUpload').mockImplementation(() => onURLUploadMock);

    const { getByPlaceholderText, getAllByRole } = await renderComponent(store, setLoadingMock);

    const urlInput = getByPlaceholderText('Paste your video ID or URL');
    const urlSubmitButton = getAllByRole('button', { name: /submit/i });
    expect(urlSubmitButton).toHaveLength(1);

    fireEvent.change(urlInput, { target: { value: 'https://example.com/video.mp4' } });
    urlSubmitButton.forEach((button) => fireEvent.click(button));
    expect(onURLUploadMock).toHaveBeenCalledWith('https://example.com/video.mp4');

    onVideoUploadSpy.mockRestore();
  });

  it('calls handleProcessUpload when file is selected', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const mockDispatchFn = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatchFn);

    const { getByTestId } = await renderComponent(store, setLoadingMock);

    const fileInput = getByTestId('dropzone-container');
    const file = new File(['file'], 'video.mp4', {
      type: 'video/mp4',
    });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    await act(async () => fireEvent.drop(fileInput));
    // Test dispacting thunkAction
    expect(mockDispatchFn).toHaveBeenCalledWith(expect.any(Function));
    useDispatchSpy.mockRestore();
  });
});
