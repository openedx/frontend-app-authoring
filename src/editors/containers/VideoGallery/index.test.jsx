import React from 'react';
import { shallow } from 'enzyme';

import SelectionModal from '../../sharedComponents/SelectionModal';
import hooks from './hooks';
import * as module from '.';

jest.mock('../../sharedComponents/SelectionModal', () => 'SelectionModal');

jest.mock('./hooks', () => ({
  buildVideos: jest.fn(() => []),
  videoProps: jest.fn(() => ({
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
      addFile: 'videoHooks.fileInput.addFile',
      click: 'videoHooks.fileInput.click',
      ref: 'videoHooks.fileInput.ref',
    },
    galleryProps: { gallery: 'props' },
    searchSortProps: { search: 'sortProps' },
    selectBtnProps: { select: 'btnProps' },
  })),
  handleCancel: jest.fn(),
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isLoaded: (state, { requestKey }) => ({ isLoaded: { state, requestKey } }),
      isFetchError: (state, { requestKey }) => ({ isFetchError: { state, requestKey } }),
      isUploadError: (state, { requestKey }) => ({ isUploadError: { state, requestKey } }),
    },
  },
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  navigateCallback: jest.fn((args) => ({ navigateCallback: args })),
}));

describe('VideoGallery', () => {
  describe('component', () => {
    const props = {
      rawVideos: { sOmEaSsET: { staTICUrl: '/video/sOmEaSsET' } },
      isLoaded: false,
      isFetchError: false,
      isUploadError: false,
    };
    let el;
    const videoProps = hooks.videoProps();
    beforeEach(() => {
      el = shallow(<module.VideoGallery {...props} />);
    });
    it('provides confirm action, forwarding selectBtnProps from imgHooks', () => {
      expect(el.find(SelectionModal).props().selectBtnProps).toEqual(
        expect.objectContaining({ ...hooks.videoProps().selectBtnProps }),
      );
    });
    it('provides file upload button linked to fileInput.click', () => {
      expect(el.find(SelectionModal).props().fileInput.click).toEqual(
        videoProps.fileInput.click,
      );
    });
    it('provides a SearchSort component with searchSortProps from imgHooks', () => {
      expect(el.find(SelectionModal).props().searchSortProps).toEqual(videoProps.searchSortProps);
    });
    it('provides a Gallery component with galleryProps from imgHooks', () => {
      expect(el.find(SelectionModal).props().galleryProps).toEqual(videoProps.galleryProps);
    });
    it('provides a FileInput component with fileInput props from imgHooks', () => {
      expect(el.find(SelectionModal).props().fileInput).toMatchObject(videoProps.fileInput);
    });
  });
});
