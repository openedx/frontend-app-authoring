import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { ThumbnailWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({ thumbnail: ['error.thumbnail', jest.fn().mockName('error.setThumbnail')] })),
}));
jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      allowThumbnailUpload: jest.fn(state => ({ allowThumbnailUpload: state })),
      thumbnail: jest.fn(state => ({ thumbnail: state })),
      videoType: jest.fn(state => ({ videoType: state })),
    },
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
}));

describe('ThumbnailWidget', () => {
  const props = {
    error: {},
    title: 'tiTLE',
    intl: { formatMessage },
    isLibrary: false,
    allowThumbnailUpload: false,
    thumbnail: null,
    videoType: '',
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<ThumbnailWidget {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with isLibrary true', () => {
      expect(
        shallow(<ThumbnailWidget {...props} isLibrary />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with a thumbnail provided', () => {
      expect(
        shallow(<ThumbnailWidget {...props} thumbnail="sOMeUrl" videoType="edxVideo" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected where thumbnail uploads are allowed', () => {
      expect(
        shallow(<ThumbnailWidget {...props} thumbnail="sOMeUrl" allowThumbnailUpload />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected where videoType equals edxVideo', () => {
      expect(
        shallow(<ThumbnailWidget {...props} thumbnail="sOMeUrl" allowThumbnailUpload videoType="edxVideo" />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected where videoType equals edxVideo and no thumbnail', () => {
      expect(
        shallow(<ThumbnailWidget {...props} allowThumbnailUpload videoType="edxVideo" />),
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
    test('allowThumbnailUpload from video.allowThumbnailUpload', () => {
      expect(
        mapStateToProps(testState).allowThumbnailUpload,
      ).toEqual(selectors.video.allowThumbnailUpload(testState));
    });
    test('thumbnail from video.thumbnail', () => {
      expect(
        mapStateToProps(testState).thumbnail,
      ).toEqual(selectors.video.thumbnail(testState));
    });
    test('videoType from video.videoType', () => {
      expect(
        mapStateToProps(testState).videoType,
      ).toEqual(selectors.video.videoType(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
