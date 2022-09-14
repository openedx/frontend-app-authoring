import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../testUtils';
import { RequestKeys } from '../../../../data/constants/requests';
import { selectors } from '../../../../data/redux';
import BaseModal from '../BaseModal';
import FileInput from '../../../../sharedComponents/FileInput';
import Gallery from './Gallery';
import SearchSort from './SearchSort';
import hooks from './hooks';
import { SelectImageModal, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../BaseModal', () => 'BaseModal');
jest.mock('../../../../sharedComponents/FileInput', () => 'FileInput');
jest.mock('./Gallery', () => 'Gallery');
jest.mock('./SearchSort', () => 'SearchSort');
jest.mock('../../../../sharedComponents/ErrorAlerts/FetchErrorAlert', () => 'FetchErrorAlert');
jest.mock('../../../../sharedComponents/ErrorAlerts/UploadErrorAlert', () => 'UploadErrorAlert');
jest.mock('../../../../sharedComponents/ErrorAlerts/ErrorAlert', () => 'ErrorAlert');

jest.mock('./hooks', () => ({
  imgHooks: jest.fn(() => ({
    galleryError: {
      show: 'ShoWERror gAlLery',
      set: jest.fn(),
      dismiss: jest.fn(),
    },
    inputError: {
      show: 'ShoWERror inPUT',
      set: jest.fn(),
      dismiss: jest.fn(),
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

jest.mock('../../../../data/redux', () => ({
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
      intl: { formatMessage },
      inputIsLoading: false,
    };
    let el;
    const imgHooks = hooks.imgHooks();
    beforeEach(() => {
      el = shallow(<SelectImageModal {...props} />);
    });
    test('snapshot', () => {
      expect(el).toMatchSnapshot();
    });
    test('snapshot: uploaded image not loaded, show spinner', () => {
      props.inputIsLoading = true;
      expect(shallow(<SelectImageModal {...props} />)).toMatchSnapshot();
      props.inputIsLoading = false;
    });
    it('provides confirm action, forwarding selectBtnProps from imgHooks', () => {
      expect(el.find(BaseModal).props().confirmAction.props).toEqual(
        expect.objectContaining({ ...hooks.imgHooks().selectBtnProps, variant: 'primary' }),
      );
    });
    it('provides file upload button linked to fileInput.click', () => {
      expect(el.find(BaseModal).props().footerAction.props.onClick).toEqual(
        imgHooks.fileInput.click,
      );
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      expect(el.find(SearchSort).props()).toEqual(imgHooks.searchSortProps);
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      expect(el.find(Gallery).props()).toEqual(imgHooks.galleryProps);
    });
    it('provides a FileInput component with fileInput props from imgHooks', () => {
      expect(el.find(FileInput).props()).toMatchObject({ fileInput: imgHooks.fileInput });
    });
  });
  describe('mapStateToProps', () => {
    const testState = { some: 'testState' };
    test('loads inputIsLoading from requests.isPending selector for uploadImage request', () => {
      expect(mapStateToProps(testState).inputIsLoading).toEqual(
        selectors.requests.isPending(testState, { requestKey: RequestKeys.uploadImage }),
      );
    });
  });
  describe('mapDispatchToProps', () => {
    test('is empty', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});
