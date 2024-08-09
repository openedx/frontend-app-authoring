import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { thunkActions, selectors } from '../../../../../../data/redux';

import * as module from './TranscriptActionMenu';

const TranscriptActionMenu = module.TranscriptActionMenuInternal;

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
      replaceTranscript: jest.fn((args) => ({ replaceTranscript: args })).mockName('thunkActions.video.replaceTranscript'),
      downloadTranscript: jest.fn().mockName('thunkActions.video.downloadTranscript'),
    },
  },
  selectors: {
    video: {
      getTranscriptDownloadUrl: jest.fn(args => ({ getTranscriptDownloadUrl: args })).mockName('selectors.video.getTranscriptDownloadUrl'),
      buildTranscriptUrl: jest.fn(args => ({ buildTranscriptUrl: args })).mockName('selectors.video.buildTranscriptUrl'),
    },
  },
}));

jest.mock('../../../../../../sharedComponents/FileInput', () => ({
  FileInput: 'FileInput',
  fileInput: jest.fn((args) => ({ click: jest.fn().mockName('click input'), onAddFile: args.onAddFile })),
}));

describe('TranscriptActionMenu', () => {
  describe('hooks', () => {
    describe('replaceFileCallback', () => {
      const lang1Code = 'coDe';
      const mockFile = 'sOmeEbytes';
      const mockFileName = 'one.srt';
      const mockEvent = { mockFile, name: mockFileName };
      const mockDispatch = jest.fn();
      const result = { newFile: { mockFile, name: mockFileName }, newFilename: mockFileName, language: lang1Code };

      test('it dispatches the correct thunk', () => {
        const cb = module.hooks.replaceFileCallback({
          dispatch: mockDispatch, language: lang1Code,
        });
        cb(mockEvent);
        expect(thunkActions.video.replaceTranscript).toHaveBeenCalledWith(result);
        expect(mockDispatch).toHaveBeenCalledWith({ replaceTranscript: result });
      });
    });
  });

  describe('Snapshots', () => {
    const props = {
      index: 'sOmenUmBer',
      language: 'lAnG',
      launchDeleteConfirmation: jest.fn().mockName('launchDeleteConfirmation'),
      // redux
      getTranscriptDownloadUrl: jest.fn().mockName('selectors.video.getTranscriptDownloadUrl'),
      buildTranscriptUrl: jest.fn().mockName('selectors.video.buildTranscriptUrl'),
    };
    afterAll(() => {
      jest.clearAllMocks();
    });
    test('snapshots: renders as expected with default props: dont show confirm delete', () => {
      jest.spyOn(module.hooks, 'replaceFileCallback').mockImplementationOnce(() => jest.fn().mockName('module.hooks.replaceFileCallback'));
      expect(
        shallow(<TranscriptActionMenu {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with transcriptUrl props: dont show confirm delete', () => {
      jest.spyOn(module.hooks, 'replaceFileCallback').mockImplementationOnce(() => jest.fn().mockName('module.hooks.replaceFileCallback'));
      expect(
        shallow(<TranscriptActionMenu {...props} transcriptUrl="url" />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('getTranscriptDownloadUrl from video.getTranscriptDownloadUrl', () => {
      expect(
        module.mapStateToProps(testState).getTranscriptDownloadUrl,
      ).toEqual(selectors.video.getTranscriptDownloadUrl(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('deleteTranscript from thunkActions.video.deleteTranscript', () => {
      expect(module.mapDispatchToProps.downloadTranscript).toEqual(thunkActions.video.downloadTranscript);
    });
  });
});
