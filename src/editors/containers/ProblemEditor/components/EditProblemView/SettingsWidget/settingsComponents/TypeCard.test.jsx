import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../../testUtils';
import { TypeCard } from './TypeCard';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';

describe('TypeCard', () => {
  const props = {
    answers: [],
    blockTitle: 'BLocktiTLE',
    correctAnswerCount: 0,
    problemType: ProblemTypeKeys.TEXTINPUT,
    setBlockTitle: jest.fn().mockName('args.setBlockTitle'),
    updateField: jest.fn().mockName('args.updateField'),
    updateAnswer: jest.fn().mockName('args.updateAnswer'),
    // injected
    intl: { formatMessage },
  };

  describe('snapshot', () => {
    test('snapshot: renders type setting card', () => {
      expect(shallow(<TypeCard {...props} />)).toMatchSnapshot();
    });
  });
});
