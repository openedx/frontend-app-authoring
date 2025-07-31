import React from 'react';
import { initializeMocks } from '@src/testUtils';
import { RequestKeys } from '@src/editors/data/constants/requests';
import { SelectImageModalInternal as SelectImageModal } from '.';
import editorRender from '../../../editorTestRender';

jest.mock('../../BaseModal', () => 'BaseModal');
jest.mock('../../FileInput', () => 'FileInput');
jest.mock('../../SelectionModal/Gallery', () => 'Gallery');
jest.mock('../../SelectionModal/SearchSort', () => 'SearchSort');
jest.mock('../../ErrorAlerts/FetchErrorAlert', () => 'FetchErrorAlert');
jest.mock('../../ErrorAlerts/UploadErrorAlert', () => 'UploadErrorAlert');
jest.mock('../..//ErrorAlerts/ErrorAlert', () => 'ErrorAlert');
jest.mock('../../SelectionModal', () => 'SelectionModal');

jest.mock('./hooks', () => ({
  imgHooks: jest.fn(() => ({
    galleryError: {
      show: 'ShoWERror gAlLery',
      set: jest.fn(),
      dismiss: jest.fn(),
      message: {
        id: 'Gallery error id',
        defaultMessage: 'Gallery error',
        description: 'Gallery error',
      },
    },
    inputError: {
      show: 'ShoWERror inPUT',
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
  })),
}));

describe('SelectImageModal', () => {
  const initialState = {
    app: {
      imageCount: 1,
      learningContextId: 'library-v1:abc123', // so isLibrary returns true
      blockId: null, // optional since contextId alone is enough
    },
    requests: {
      [RequestKeys.fetchImages]: {
        status: 'completed', // or 'FAILED' for error case
      },
      [RequestKeys.uploadAsset]: {
        status: 'completed', // or 'FAILED' for error case
      },
    },
  };

  describe('component', () => {
    const props = {
      isOpen: true,
      close: jest.fn().mockName('props.close'),
      setSelection: jest.fn().mockName('props.setSelection'),
      clearSelection: jest.fn().mockName('props.clearSelection'),
      images: ['image.pgn'],
    };
    beforeEach(() => {
      initializeMocks({ initialState });
    });
    test('renders correctly', () => {
      const { container } = editorRender(<SelectImageModal {...props} />, { initialState });
      expect(container.querySelector('SelectionModal')).toBeInTheDocument();
    });
    it('provides confirm action, forwarding selectBtnProps from imgHooks', () => {
      const { container } = editorRender(<SelectImageModal {...props} />, { initialState });
      expect(container.querySelector('SelectionModal')?.getAttribute('selectBtnProps')).toBeTruthy();
    });
    it('provides file upload button linked to fileInput.click', () => {
      const { container } = editorRender(<SelectImageModal {...props} />, { initialState });
      expect(container.querySelector('SelectionModal')?.getAttribute('fileInput')).toBeTruthy();
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      const { container } = editorRender(<SelectImageModal {...props} />, { initialState });
      expect(container.querySelector('SelectionModal')?.getAttribute('searchSortProps')).toBeTruthy();
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      const { container } = editorRender(<SelectImageModal {...props} />, { initialState });
      expect(container.querySelector('SelectionModal')?.getAttribute('galleryProps')).toBeTruthy();
    });
  });
});
