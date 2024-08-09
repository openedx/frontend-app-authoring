import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import { formatMessage } from '../../../../../../../testUtils';
import { GroupFeedbackCardInternal as GroupFeedbackCard } from './index';
import { groupFeedbackRowHooks, groupFeedbackCardHooks } from './hooks';
import messages from './messages';

jest.mock('./hooks', () => ({
  groupFeedbackCardHooks: jest.fn(),
  groupFeedbackRowHooks: jest.fn(),
}));

describe('HintsCard', () => {
  const answers = ['A', 'B', 'C'];
  const groupFeedback1 = {
    id: 1, value: 'groupFeedback1', answers: ['A', 'C'], feedback: 'sOmE FeEDBACK',
  };
  const groupFeedback2 = {
    id: 2, value: '', answers: ['A'], feedback: 'sOmE FeEDBACK oTher FeEdback',
  };
  const groupFeedbacks0 = [];
  const groupFeedbacks1 = [groupFeedback1];
  const groupFeedbacks2 = [groupFeedback1, groupFeedback2];
  const props = {
    intl: { formatMessage },
    groupFeedbacks: groupFeedbacks0,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    answers,
  };

  const groupFeedbacksRowHooksProps = { props: 'propsValue' };
  groupFeedbackRowHooks.mockReturnValue(groupFeedbacksRowHooksProps);

  describe('behavior', () => {
    it(' calls groupFeedbacksCardHooks when initialized', () => {
      const groupFeedbacksCardHooksProps = {
        summary: { message: messages.noGroupFeedbackSummary },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };

      groupFeedbackCardHooks.mockReturnValue(groupFeedbacksCardHooksProps);
      shallow(<GroupFeedbackCard {...props} />);
      expect(groupFeedbackCardHooks).toHaveBeenCalledWith(groupFeedbacks0, props.updateSettings, answers);
    });
  });

  describe('snapshot', () => {
    test('snapshot: renders groupFeedbacks setting card no groupFeedbacks', () => {
      const groupFeedbacksCardHooksProps = {
        summary: { message: messages.noGroupFeedbackSummary, values: {} },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };

      groupFeedbackCardHooks.mockReturnValue(groupFeedbacksCardHooksProps);
      expect(shallow(<GroupFeedbackCard {...props} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders groupFeedbacks setting card one groupFeedback', () => {
      const groupFeedbacksCardHooksProps = {
        summary: {
          message: messages.groupFeedbackSummary,
          values: { groupFeedback: groupFeedback1.value, count: 1 },
        },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };

      groupFeedbackCardHooks.mockReturnValue(groupFeedbacksCardHooksProps);
      expect(shallow(<GroupFeedbackCard {...props} groupFeedbacks={groupFeedbacks1} />).snapshot).toMatchSnapshot();
    });
    test('snapshot: renders groupFeedbacks setting card multiple groupFeedbacks', () => {
      const groupFeedbacksCardHooksProps = {
        summary: {
          message: messages.groupFeedbackSummary,
          values: { groupFeedback: groupFeedback2.value, count: 2 },
        },
        handleAdd: jest.fn().mockName('groupFeedbacksCardHooks.handleAdd'),
      };

      groupFeedbackCardHooks.mockReturnValue(groupFeedbacksCardHooksProps);
      expect(shallow(<GroupFeedbackCard {...props} groupFeedbacks={groupFeedbacks2} />).snapshot).toMatchSnapshot();
    });
  });
});
