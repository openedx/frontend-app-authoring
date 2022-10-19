import React from 'react';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { HandoutWidget, mapStateToProps, mapDispatchToProps } from '.';

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
  },
}));

describe('HandoutWidget', () => {
  const props = {
    subtitle: 'SuBTItle',
    title: 'tiTLE',
    intl: { formatMessage },
    handout: '',
    getHandoutDownloadUrl: jest.fn().mockName('args.getHandoutDownloadUrl'),
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<HandoutWidget {...props} />),
      ).toMatchSnapshot();
    });
    test('snapshots: renders as expected with handout', () => {
      expect(
        shallow(<HandoutWidget {...props} handout="sOMeUrl " />),
      ).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('handout from video.handout', () => {
      expect(
        mapStateToProps(testState).handout,
      ).toEqual(selectors.video.handout(testState));
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
