import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { HandoutWidgetInternal as HandoutWidget, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({ handout: ['error.handout', jest.fn().mockName('error.setHandout')] })),
}));

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      getHandoutDownloadUrl: jest.fn(args => ({ getHandoutDownloadUrl: args })).mockName('selectors.video.getHandoutDownloadUrl'),
      handout: jest.fn(state => ({ handout: state })),
    },
    app: {
      isLibrary: jest.fn(args => ({ isLibrary: args })),
    },
    requests: {
      isFailed: jest.fn(args => ({ isFailed: args })),
    },
  },
}));

describe('HandoutWidget', () => {
  const props = {
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    intl: { formatMessage },
    isLibrary: false,
    handout: '',
    getHandoutDownloadUrl: jest.fn().mockName('args.getHandoutDownloadUrl'),
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<HandoutWidget {...props} />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with isLibrary true', () => {
      expect(
        shallow(<HandoutWidget {...props} isLibrary />).snapshot,
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with handout', () => {
      expect(
        shallow(<HandoutWidget {...props} handout="sOMeUrl " />).snapshot,
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
    test('getHandoutDownloadUrl from video.getHandoutDownloadUrl', () => {
      expect(
        mapStateToProps(testState).getHandoutDownloadUrl,
      ).toEqual(selectors.video.getHandoutDownloadUrl(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
