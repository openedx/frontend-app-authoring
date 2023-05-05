import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoUploadEditor, { VideoUploader } from '.';
import * as hooks from './hooks';
import * as appHooks from '../../hooks';

const mockDispatch = jest.fn();
const mockOnUpload = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  navigateTo: jest.fn((args) => ({ navigateTo: args })),
}));

const defaultEditorProps = {
  intl: {},
};

const defaultUploaderProps = {
  onUpload: mockOnUpload,
  errorMessage: '',
  intl: {},
};

const renderEditorComponent = (props = defaultEditorProps) => render(
  <IntlProvider locale="en">
    <VideoUploadEditor {...props} />
  </IntlProvider>,
);

const renderUploaderComponent = (props = defaultUploaderProps) => render(
  <IntlProvider locale="en">
    <VideoUploader {...props} />
  </IntlProvider>,
);

describe('VideoUploadEditor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without errors', () => {
    const { container } = renderEditorComponent();
    expect(container).toMatchSnapshot();
  });

  it('updates the input field value when user types', () => {
    const { getByPlaceholderText } = renderEditorComponent();
    const input = getByPlaceholderText('Paste your video ID or URL');

    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input.value).toBe('test value');
  });

  it('click on the save button', () => {
    const { getByPlaceholderText, getByTestId } = renderEditorComponent();
    const testValue = 'test vale';
    const input = getByPlaceholderText('Paste your video ID or URL');
    fireEvent.change(input, { target: { value: testValue } });
    const button = getByTestId('inputSaveButton');
    fireEvent.click(button);
    expect(appHooks.navigateTo).toHaveBeenCalled();
  });

  it('shows error message with unsupported files', async () => {
    const { getByTestId, findByText } = renderEditorComponent();
    const fileInput = getByTestId('fileInput');

    const unsupportedFile = new File(['(⌐□_□)'], 'unsupported.avi', { type: 'video/avi' });
    fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

    const errorMsg = await findByText('Video must be an MP4 or MOV file');
    expect(errorMsg).toBeInTheDocument();
  });

  it('calls uploadVideo with supported files', async () => {
    const uploadVideoSpy = jest.spyOn(hooks, 'uploadVideo');
    const { container } = renderEditorComponent();
    const dropzone = container.querySelector('.dropzone-middle');

    const supportedFile = new File(['(⌐□_□)'], 'supported.mp4', { type: 'video/mp4' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [supportedFile],
          types: ['Files'],
        },
      });
    });

    expect(uploadVideoSpy).toHaveBeenCalledWith(expect.objectContaining({
      dispatch: mockDispatch,
      supportedFiles: expect.arrayContaining([
        expect.objectContaining({
          name: supportedFile.name,
          type: supportedFile.type,
          size: supportedFile.size,
        }),
      ]),
    }));
  });
});

describe('VideoUploader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without errors', () => {
    const { container } = renderUploaderComponent();
    expect(container).toMatchSnapshot();
  });

  it('renders with an error message', () => {
    const errorMessage = 'Video must be an MP4 or MOV file';
    const { getByText } = renderUploaderComponent({ ...defaultUploaderProps, errorMessage });
    expect(getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls the onUpload function when a supported file is dropped', async () => {
    const { container } = renderUploaderComponent();
    const dropzone = container.querySelector('.dropzone-middle');
    const file = new File(['(⌐□_□)'], 'video.mp4', { type: 'video/mp4' });

    await act(async () => {
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });
    });

    expect(mockOnUpload).toHaveBeenCalledWith(file);
  });
});
