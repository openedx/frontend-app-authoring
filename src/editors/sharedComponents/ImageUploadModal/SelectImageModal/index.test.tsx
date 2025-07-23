import React from 'react';
import { render, initializeMocks } from '@src/testUtils';
import { formatMessage } from '@src/editors/testUtils';
import { SelectImageModalInternal as SelectImageModal } from '.';

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

jest.mock('../../../data/redux', () => ({
  selectors: {
    requests: {
      isPending: (state, { requestKey }) => ({ isPending: { state, requestKey } }),
    },
  },
}));

describe('SelectImageModal', () => {
  describe('component', () => {
    const props = {
      isOpen: true,
      close: jest.fn().mockName('props.close'),
      setSelection: jest.fn().mockName('props.setSelection'),
      clearSelection: jest.fn().mockName('props.clearSelection'),
      isLoaded: true,
      isFetchError: false,
      isUploadError: false,
      imageCount: 1,
      images: ['image.pgn'],
      intl: { formatMessage },
    };
    beforeEach(() => {
      initializeMocks();
    });
    test('renders correctly', () => {
      const { container } = render(<SelectImageModal {...props} />);
      expect(container.querySelector('SelectionModal')).toBeInTheDocument();
    });
    it('provides confirm action, forwarding selectBtnProps from imgHooks', () => {
      const { container } = render(<SelectImageModal {...props} />);
      expect(container.querySelector('SelectionModal')?.getAttribute('selectBtnProps')).toBeTruthy();
    });
    it('provides file upload button linked to fileInput.click', () => {
      const { container } = render(<SelectImageModal {...props} />);
      expect(container.querySelector('SelectionModal')?.getAttribute('fileInput')).toBeTruthy();
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      const { container } = render(<SelectImageModal {...props} />);
      expect(container.querySelector('SelectionModal')?.getAttribute('searchSortProps')).toBeTruthy();
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      const { container } = render(<SelectImageModal {...props} />);
      expect(container.querySelector('SelectionModal')?.getAttribute('galleryProps')).toBeTruthy();
    });
  });
});
