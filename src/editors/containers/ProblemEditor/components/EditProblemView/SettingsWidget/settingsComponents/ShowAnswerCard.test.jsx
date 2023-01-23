import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../../testUtils';
import { selectors } from '../../../../../../data/redux';
import { ShowAnswerCard, mapStateToProps, mapDispatchToProps } from './ShowAnswerCard';
import { showAnswerCardHooks } from '../hooks';

jest.mock('../hooks', () => ({
  showAnswerCardHooks: jest.fn(),
}));

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    app: {
      studioEndpointUrl: jest.fn(state => ({ studioEndpointUrl: state })),
      learningContextId: jest.fn(state => ({ learningContextId: state })),
    },
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
    // injected
    intl: { formatMessage },
    // redux
    studioEndpointUrl: 'SoMEeNDpOinT',
    learningContextId: 'sOMEcouRseId',
  };

  const showAnswerCardHooksProps = {
    handleShowAnswerChange: jest.fn().mockName('showAnswerCardHooks.handleShowAnswerChange'),
    handleAttemptsChange: jest.fn().mockName('showAnswerCardHooks.handleAttemptsChange'),
  };

  showAnswerCardHooks.mockReturnValue(showAnswerCardHooksProps);

  describe('behavior', () => {
    it(' calls showAnswerCardHooks when initialized', () => {
      shallow(<ShowAnswerCard {...props} />);
      expect(showAnswerCardHooks).toHaveBeenCalledWith(showAnswer, props.updateSettings);
    });
  });

  describe('snapshot', () => {
    test('snapshot: show answer setting card', () => {
      expect(shallow(<ShowAnswerCard {...props} />)).toMatchSnapshot();
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
