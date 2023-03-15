import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../testUtils';
import SelectionModal from '.';

const props = {
  isOpen: jest.fn(),
  isClose: jest.fn(),
  size: 'fullscreen',
  isFullscreenScroll: false,
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
  intl: { formatMessage },
};

jest.mock('../BaseModal', () => 'BaseModal');
jest.mock('./SearchSort', () => 'SearchSort');
jest.mock('./Gallery', () => 'Gallery');
jest.mock('../FileInput', () => 'FileInput');
jest.mock('../ErrorAlerts/ErrorAlert', () => 'ErrorAlert');
jest.mock('../ErrorAlerts/FetchErrorAlert', () => 'FetchErrorAlert');
jest.mock('../ErrorAlerts/UploadErrorAlert', () => 'UploadErrorAlert');

describe('Selection Modal', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<SelectionModal {...props} />)).toMatchSnapshot();
    });
    test('rendering with props to null', () => {
      expect(shallow(<SelectionModal />)).toMatchSnapshot();
    });
  });
});
