import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../testUtils';
import BaseModal from '../BaseModal';
import FileInput from './FileInput';
import Gallery from './Gallery';
import SearchSort from './SearchSort';
import hooks from './hooks';
import { SelectImageModal } from '.';

jest.mock('../BaseModal', () => 'BaseModal');
jest.mock('./FileInput', () => 'FileInput');
jest.mock('./Gallery', () => 'Gallery');
jest.mock('./SearchSort', () => 'SearchSort');
jest.mock('../ErrorAlerts/FetchErrorAlert', () => 'FetchErrorAlert');
jest.mock('../ErrorAlerts/UploadErrorAlert', () => 'UploadErrorAlert');

jest.mock('./hooks', () => ({
  imgHooks: jest.fn(() => ({
    error: {
      show: 'ShoWERror',
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

describe('SelectImageModal', () => {
  describe('component', () => {
    const props = {
      isOpen: true,
      close: jest.fn().mockName('props.close'),
      setSelection: jest.fn().mockName('props.setSelection'),
      intl: { formatMessage },
    };
    let el;
    const imgHooks = hooks.imgHooks();
    beforeEach(() => {
      el = shallow(<SelectImageModal {...props} />);
    });
    test('snapshot', () => {
      expect(el).toMatchSnapshot();
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
});
