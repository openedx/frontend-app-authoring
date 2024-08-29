import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../testUtils';
import SelectionModal from '../../SelectionModal';
import * as hooks from './hooks';
import { SelectImageModalInternal as SelectImageModal } from '.';

const mockImage = {
  displayName: 'DALL·E 2023-03-10.png',
  contentType: 'image/png',
  dateAdded: 1682009100000,
  url: '/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  externalUrl: 'http://localhost:18000/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  portableUrl: '/static/DALL_E_2023-03-10.png',
  thumbnail: '/asset-v1:TestX+Test01+Test0101+type@thumbnail+block@DALL_E_2023-03-10.jpg',
  locked: false,
  staticFullUrl: '/assets/courseware/v1/af2bf9ac70804e54c534107160a8e51e/asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  id: 'asset-v1:TestX+Test01+Test0101+type@asset+block@DALL_E_2023-03-10.png',
  width: 100,
  height: 150,
};

const mockImagesRef = { current: [mockImage] };

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
      images: mockImagesRef,
      intl: { formatMessage },
    };
    let el;
    const imgHooks = hooks.imgHooks();
    beforeEach(() => {
      el = shallow(<SelectImageModal {...props} />);
    });
    test('snapshot', () => {
      expect(el.snapshot).toMatchSnapshot();
    });
    it('provides confirm action, forwarding selectBtnProps from imgHooks', () => {
      expect(el.instance.findByType(SelectionModal)[0].props.selectBtnProps).toEqual(
        expect.objectContaining({ ...hooks.imgHooks().selectBtnProps }),
      );
    });
    it('provides file upload button linked to fileInput.click', () => {
      expect(el.instance.findByType(SelectionModal)[0].props.fileInput.click).toEqual(
        imgHooks.fileInput.click,
      );
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      expect(el.instance.findByType(SelectionModal)[0].props.searchSortProps).toEqual(imgHooks.searchSortProps);
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      expect(el.instance.findByType(SelectionModal)[0].props.galleryProps).toEqual(imgHooks.galleryProps);
    });
    it('provides a FileInput component with fileInput props from imgHooks', () => {
      expect(el.instance.findByType(SelectionModal)[0].props.fileInput).toMatchObject(imgHooks.fileInput);
    });
  });
});
