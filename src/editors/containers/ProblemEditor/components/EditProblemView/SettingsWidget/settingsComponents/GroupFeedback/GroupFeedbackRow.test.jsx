import React from 'react';
import { shallow } from 'enzyme';
import { formatMessage } from '../../../../../../../../testUtils';
import { GroupFeedbackRow } from './GroupFeedbackRow';

describe('GroupFeedbackRow', () => {
  const props = {
    value: { answers: ['A', 'C'], feedback: 'sOmE FeEDBACK' },
    answers: ['A', 'B', 'C', 'D'],
    handleAnswersSelectedChange: jest.fn().mockName('handleAnswersSelectedChange'),
    handleFeedbackChange: jest.fn().mockName('handleFeedbackChange'),
    handleDelete: jest.fn().mockName('handleDelete'),
    intl: { formatMessage },
  };

  describe('snapshot', () => {
    test('snapshot: renders hints row', () => {
      expect(shallow(<GroupFeedbackRow {...props} />)).toMatchSnapshot();
    });
  });
});
