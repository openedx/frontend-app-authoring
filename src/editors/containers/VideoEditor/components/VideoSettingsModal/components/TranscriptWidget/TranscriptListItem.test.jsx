import React from 'react';
import { shallow } from 'enzyme';

import { TranscriptListItem, mapDispatchToProps, mapStateToProps } from './TranscriptListItem';
import { thunkActions, selectors } from '../../../../../../data/redux';
import hooks from './hooks';

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn().mockName('mockUseDispatch');
  return {
    ...jest.requireActual('react-redux'),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      deleteTranscript: jest.fn().mockName('thunkActions.video.deleteTranscript'),
    },
  },
  selectors: {
    video: {
      getTranscriptDownloadUrl: jest.fn(args => ({ getTranscriptDownloadUrl: args })).mockName('selectors.video.getTranscriptDownloadUrl'),
    },
  },
}));

jest.mock('./hooks', () => ({
  fileInput: jest.fn((args) => ({ fileInput: args, click: jest.fn().mockName('mockInputClick') })),
  replaceFileCallback: jest.fn((args) => ({ replaceFileCallback: args })),
  setUpDeleteConfirmation: jest.fn((args) => ({ setUpDeleteConfirmation: args })).mockName('setUpDeleteConfirmation'),
}));

describe('TranscriptListItem', () => {
  const props = {
    getTranscriptDownloadUrl: jest.fn().mockName('selectors..video.getTranscriptDownloadUrl'),
    title: 'sOmeTiTLE',
    language: 'lAnG',
    deleteTranscript: jest.fn().mockName('thunkActions.video.deleteTranscript'),
  };

  describe('Snapshots', () => {
    afterAll(() => {
      jest.clearAllMocks();
    });
    test('snapshots: renders as expected with default props: dont show confirm delete', () => {
      jest.spyOn(hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
        inDeleteConfirmation: false,
        launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
        cancelDelete: jest.fn().mockName('cancelDelete'),
      }));
      expect(
        shallow(<TranscriptListItem {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with default props: show confirm delete', () => {
      jest.spyOn(hooks, 'setUpDeleteConfirmation').mockImplementationOnce(() => ({
        inDeleteConfirmation: true,
        launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
        cancelDelete: jest.fn().mockName('cancelDelete'),
      }));
      expect(
        shallow(<TranscriptListItem {...props} />),
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('getTranscriptDownloadUrl from video.getTranscriptDownloadUrl', () => {
      expect(
        mapStateToProps(testState).getTranscriptDownloadUrl,
      ).toEqual(selectors.video.getTranscriptDownloadUrl(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('deleteTranscript from thunkActions.video.deleteTranscript', () => {
      expect(mapDispatchToProps.deleteTranscript).toEqual(thunkActions.video.deleteTranscript);
    });
  });
});
