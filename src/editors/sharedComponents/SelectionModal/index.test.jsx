import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { formatMessage } from '../../../testUtils';
import SelectionModal from '.';
import '@testing-library/jest-dom';

const props = {
  isOpen: jest.fn(),
  isClose: jest.fn(),
  size: 'fullscreen',
  isFullscreenScroll: false,
  galleryError: {
    show: false,
    set: jest.fn(),
    dismiss: jest.fn(),
    message: {
      id: 'Gallery error id',
      defaultMessage: 'Gallery error',
      description: 'Gallery error',
    },
  },
  inputError: {
    show: false,
    set: jest.fn(),
    dismiss: jest.fn(),
    message: {
      id: 'Input error id',
      defaultMessage: 'Input error',
      description: 'Input error',
    },
  },
  fileInput: {
    addFile: 'imgHooks.fileInput.addFile',
    click: 'imgHooks.fileInput.click',
    ref: 'imgHooks.fileInput.ref',
  },
  galleryProps: { gallery: 'props' },
  searchSortProps: { search: 'sortProps' },
  selectBtnProps: { select: 'btnProps' },
  acceptedFiles: { png: '.png' },
  modalMessages: {
    confirmMsg: {
      id: 'confirmMsg',
      defaultMessage: 'confirmMsg',
      description: 'confirmMsg',
    },
    uploadButtonMsg: {
      id: 'uploadButtonMsg',
      defaultMessage: 'uploadButtonMsg',
      description: 'uploadButtonMsg',
    },
    titleMsg: {
      id: 'titleMsg',
      defaultMessage: 'titleMsg',
      description: 'titleMsg',
    },
    fetchError: {
      id: 'fetchError',
      defaultMessage: 'fetchError',
      description: 'fetchError',
    },
    uploadError: {
      id: 'uploadError',
      defaultMessage: 'uploadError',
      description: 'uploadError',
    },
  },
  isLoaded: true,
  isFetchError: false,
  isUploadError: false,
  intl: { formatMessage },
};

const mockGalleryFn = jest.fn();
const mockFileInputFn = jest.fn();
const mockFetchErrorAlertFn = jest.fn();
const mockUploadErrorAlertFn = jest.fn();

jest.mock('../BaseModal', () => 'BaseModal');
jest.mock('./SearchSort', () => 'SearchSort');
jest.mock('./Gallery', () => function mockGallery(componentProps) {
  mockGalleryFn(componentProps);
  return (<div>Gallery</div>);
});
jest.mock('../FileInput', () => function mockFileInput(componentProps) {
  mockFileInputFn(componentProps);
  return (<div>FileInput</div>);
});
jest.mock('../ErrorAlerts/ErrorAlert', () => function mockErrorAlert() {
  return <div>ErrorAlert</div>;
});
jest.mock('../ErrorAlerts/FetchErrorAlert', () => function mockFetchErrorAlert(componentProps) {
  mockFetchErrorAlertFn(componentProps);
  return (<div>FetchErrorAlert</div>);
});
jest.mock('../ErrorAlerts/UploadErrorAlert', () => function mockUploadErrorAlert(componentProps) {
  mockUploadErrorAlertFn(componentProps);
  return (<div>UploadErrorAlert</div>);
});

describe('Selection Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('rendering correctly with expected Input', async () => {
    render(
      <IntlProvider>
        <SelectionModal {...props} />
      </IntlProvider>,
    );
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('FileInput')).toBeInTheDocument();
    expect(screen.getByText('FetchErrorAlert')).toBeInTheDocument();
    expect(screen.getByText('UploadErrorAlert')).toBeInTheDocument();

    expect(mockGalleryFn).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props.galleryProps,
        isLoaded: props.isLoaded,
        show: true,
      }),
    );
    expect(mockFetchErrorAlertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        isFetchError: props.isFetchError,
        message: props.modalMessages.fetchError,
      }),
    );
    expect(mockUploadErrorAlertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        isUploadError: props.isUploadError,
        message: props.modalMessages.uploadError,
      }),
    );
    expect(mockFileInputFn).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptedFiles: '.png',
        fileInput: props.fileInput,
      }),
    );
  });
  test('rendering correctly with errors', () => {
    render(
      <IntlProvider>
        <SelectionModal {...props} isFetchError />
      </IntlProvider>,
    );
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('FileInput')).toBeInTheDocument();
    expect(screen.getByText('FetchErrorAlert')).toBeInTheDocument();
    expect(screen.getByText('UploadErrorAlert')).toBeInTheDocument();

    expect(mockFetchErrorAlertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        isFetchError: true,
        message: props.modalMessages.fetchError,
      }),
    );
    expect(mockGalleryFn).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props.galleryProps,
        isLoaded: props.isLoaded,
        show: false,
      }),
    );
  });
  test('rendering correctly with loading', () => {
    render(
      <IntlProvider>
        <SelectionModal {...props} isLoaded={false} />
      </IntlProvider>,
    );
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('FileInput')).toBeInTheDocument();
    expect(screen.getByText('FetchErrorAlert')).toBeInTheDocument();
    expect(screen.getByText('UploadErrorAlert')).toBeInTheDocument();

    expect(mockGalleryFn).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props.galleryProps,
        isLoaded: false,
        show: true,
      }),
    );
  });
});
