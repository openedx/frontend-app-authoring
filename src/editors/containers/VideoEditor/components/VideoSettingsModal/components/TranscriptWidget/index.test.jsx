import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { TranscriptWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      transcripts: jest.fn(state => ({ transcripts: state })),
      allowTranscriptDownloads: jest.fn(state => ({ allowTranscriptDownloads: state })),
      showTranscriptByDefault: jest.fn(state => ({ showTranscriptByDefault: state })),
    },
  },
}));

describe('TranscriptWidget', () => {
  const props = {
    error: {},
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    // inject
    intl: { formatMessage },
    // redux
    transcripts: null,
    allowTranscriptDownloads: false,
    showTranscriptByDefault: false,
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<TranscriptWidget {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with transcripts', () => {
      expect(
        shallow(<TranscriptWidget {...props} transcripts={{ english: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with allowTranscriptDownloads true', () => {
      expect(
        shallow(<TranscriptWidget {...props} allowTranscriptDownloads transcripts={{ english: 'sOMeUrl' }} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with showTranscriptByDefault true', () => {
      expect(
        shallow(<TranscriptWidget {...props} showTranscriptByDefault transcripts={{ english: 'sOMeUrl' }} />),
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
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
