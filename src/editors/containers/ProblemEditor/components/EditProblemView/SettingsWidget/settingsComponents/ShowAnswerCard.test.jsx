import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../../testUtils';
import { ShowAnswerCard } from './ShowAnswerCard';
import { showAnswerCardHooks } from '../hooks';

jest.mock('../hooks', () => ({
  showAnswerCardHooks: jest.fn(),
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
    intl: { formatMessage },
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
});
