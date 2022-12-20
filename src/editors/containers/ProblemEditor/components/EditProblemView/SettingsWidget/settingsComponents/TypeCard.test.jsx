import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../../testUtils';
import { TypeCard } from './TypeCard';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';

describe('TypeCard', () => {
  const props = {
    problemType: ProblemTypeKeys.TEXTINPUT,
    updateField: jest.fn().mockName('args.updateField'),
    intl: { formatMessage },
  };

  describe('snapshot', () => {
    test('snapshot: renders type setting card', () => {
      expect(shallow(<TypeCard {...props} />)).toMatchSnapshot();
    });
  });
});
