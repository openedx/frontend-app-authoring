import React from 'react';
import { shallow } from 'enzyme';

import { RequestKeys } from '../../../../../../data/constants/requests';

import { formatMessage } from '../../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { TranscriptWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  thunkActions: {
    video: {
      deleteTranscript: jest.fn().mockName('actions.video.deleteTranscript'),
    },
  },

  selectors: {
    video: {
      transcripts: jest.fn(state => ({ transcripts: state })),
      allowTranscriptDownloads: jest.fn(state => ({ allowTranscriptDownloads: state })),
      showTranscriptByDefault: jest.fn(state => ({ showTranscriptByDefault: state })),

    },
    requests: {
      isFailed: jest.fn(state => ({ isFailed: state })),
    },
  },
}));

describe('TranscriptWidget', () => {
  const props = {
    error: {},
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    intl: { formatMessage },
    transcripts: {},
    allowTranscriptDownloads: false,
    showTranscriptByDefault: false,
    updateField: jest.fn().mockName('args.updateField'),
    isUploadError: false,
    isDeleteError: false,
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<TranscriptWidget {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with transcripts', () => {
      expect(
        shallow(<TranscriptWidget {...props} transcripts={{ en: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with allowTranscriptDownloads true', () => {
      expect(
        shallow(<TranscriptWidget {...props} allowTranscriptDownloads transcripts={{ en: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with showTranscriptByDefault true', () => {
      expect(
        shallow(<TranscriptWidget {...props} showTranscriptByDefault transcripts={{ en: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshot: renders ErrorAlert with upload error message', () => {
      expect(
        shallow(<TranscriptWidget {...props} isUploadError transcripts={{ en: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshot: renders ErrorAlert with delete error message', () => {
      expect(
        shallow(<TranscriptWidget {...props} isDeleteError transcripts={{ en: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('transcripts from video.transcript', () => {
      expect(
        mapStateToProps(testState).transcripts,
      ).toEqual(selectors.video.transcripts(testState));
    });
    test('allowTranscriptDownloads from video.allowTranscriptDownloads', () => {
      expect(
        mapStateToProps(testState).allowTranscriptDownloads,
      ).toEqual(selectors.video.allowTranscriptDownloads(testState));
    });
    test('showTranscriptByDefault from video.showTranscriptByDefault', () => {
      expect(
        mapStateToProps(testState).showTranscriptByDefault,
      ).toEqual(selectors.video.showTranscriptByDefault(testState));
    });
    test('isUploadError from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).isUploadError,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.uploadTranscript }));
    });
    test('isDeleteError from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).isDeleteError,
      ).toEqual(selectors.requests.isFailed(testState, { requestKey: RequestKeys.deleteTranscript }));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
