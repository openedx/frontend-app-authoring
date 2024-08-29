import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../testUtils';
import { selectors } from '../../../../../../data/redux';
import { ShowAnswerCardInternal as ShowAnswerCard, mapStateToProps, mapDispatchToProps } from './ShowAnswerCard';
import { useAnswerSettings } from '../hooks';

jest.mock('../hooks', () => ({
  useAnswerSettings: jest.fn(),
}));

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    app: {
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
  thunkActions: {
    video: jest.fn(),
  },
}));

describe('ShowAnswerCard', () => {
  const showAnswer = {
    on: 'after_attempts',
    afterAttempts: 5,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    intl: { formatMessage },
  };
  const props = {
    showAnswer,
    defaultValue: 'finished',
    // injected
    intl: { formatMessage },
    // redux
    studioEndpointUrl: 'SoMEeNDpOinT',
    learningContextId: 'sOMEcouRseId',
  };

  const useAnswerSettingsProps = {
    handleShowAnswerChange: jest.fn().mockName('useAnswerSettings.handleShowAnswerChange'),
    handleAttemptsChange: jest.fn().mockName('useAnswerSettings.handleAttemptsChange'),
  };

  useAnswerSettings.mockReturnValue(useAnswerSettingsProps);

  describe('behavior', () => {
    it(' calls useAnswerSettings when initialized', () => {
      shallow(<ShowAnswerCard {...props} />);
      expect(useAnswerSettings).toHaveBeenCalledWith(showAnswer, props.updateSettings);
    });
  });

  describe('snapshot', () => {
    test('snapshot: show answer setting card', () => {
      expect(shallow(<ShowAnswerCard {...props} />).snapshot).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('studioEndpointUrl from app.studioEndpointUrl', () => {
      expect(
        mapStateToProps(testState).studioEndpointUrl,
      ).toEqual(selectors.app.studioEndpointUrl(testState));
    });
    test('learningContextId from app.learningContextId', () => {
      expect(
        mapStateToProps(testState).learningContextId,
      ).toEqual(selectors.app.learningContextId(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('equal an empty object', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});
