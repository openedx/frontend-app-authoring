import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../testUtils';
import SelectionModal from '../../SelectionModal';
import hooks from './hooks';
import { SelectImageModal } from '.';

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
      expect(el.find(SelectionModal).props().selectBtnProps).toEqual(
        expect.objectContaining({ ...hooks.imgHooks().selectBtnProps }),
      );
    });
    it('provides file upload button linked to fileInput.click', () => {
      expect(el.find(SelectionModal).props().fileInput.click).toEqual(
        imgHooks.fileInput.click,
      );
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      expect(el.find(SelectionModal).props().searchSortProps).toEqual(imgHooks.searchSortProps);
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      expect(el.find(SelectionModal).props().galleryProps).toEqual(imgHooks.galleryProps);
    });
    it('provides a FileInput component with fileInput props from imgHooks', () => {
      expect(el.find(SelectionModal).props().fileInput).toMatchObject(imgHooks.fileInput);
    });
  });
});
