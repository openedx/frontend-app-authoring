import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { Button, IconButton } from '@openedx/paragon';

import { thunkActions } from '../../../../../../data/redux';
import { ImportTranscriptCardInternal as ImportTranscriptCard, mapDispatchToProps, mapStateToProps } from './ImportTranscriptCard';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({ transcripts: ['error.transcripts', jest.fn().mockName('error.setTranscripts')] })),
}));

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      importTranscript: jest.fn().mockName('thunkActions.video.importTranscript'),
    },
  },
}));

describe('ImportTranscriptCard', () => {
  const props = {
    setOpen: jest.fn().mockName('setOpen'),
    importTranscript: jest.fn().mockName('args.importTranscript'),
  };
  let el;
  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<ImportTranscriptCard {...props} />).snapshot,
      ).toMatchSnapshot();
    });
  });
  describe('behavior inspection', () => {
    beforeEach(() => {
      el = shallow(<ImportTranscriptCard {...props} />);
    });
    test('close behavior is linked to IconButton', () => {
      expect(el.instance.findByType(IconButton)[0]
        .props.onClick).toBeDefined();
    });
    test('import behavior is linked to Button onClick', () => {
      expect(el.instance.findByType(Button)[0]
        .props.onClick).toEqual(props.importTranscript);
    });
  });
  describe('mapStateToProps', () => {
    it('returns an empty object', () => {
      expect(mapStateToProps()).toEqual({});
    });
  });
  describe('mapDispatchToProps', () => {
    test('updateField from thunkActions.video.importTranscript', () => {
      expect(mapDispatchToProps.importTranscript).toEqual(thunkActions.video.importTranscript);
    });
  });
});
